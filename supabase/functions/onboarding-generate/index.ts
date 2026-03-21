import { corsHeaders } from "../_shared/cors.ts";
import { generateWithAILogged } from "../_shared/prompt-logger.ts";
import { fillPromptTemplate, getSystemPrompt } from "../_shared/prompt.ts";
import { createServiceClient } from "../_shared/supabase.ts";

function parseAIResponse(raw: string): any {
  const cleaned = raw
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();
  return JSON.parse(cleaned);
}

interface SkillNode {
  node_id: string;
  branch: string;
  tier: number;
  title: string;
  description: string;
  xp_required: number;
  quests_total: number;
}

interface GeneratedQuest {
  title: string;
  description: string;
  difficulty: string;
  duration_min: number;
  xp_reward: number;
}

async function updateTracking(
  supabase: any,
  userId: string,
  update: Record<string, unknown>,
) {
  await supabase
    .from("generation_tracking")
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
}

/**
 * Retry AI call with fallback
 */
async function retryAI(
  promptFilled: string,
  context: string,
  options: any,
  maxRetries: number = 2,
): Promise<string> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await generateWithAILogged(
        promptFilled,
        context,
        options,
      );
      return response;
    } catch (error) {
      console.error(`AI attempt ${attempt + 1} failed:`, error);
      if (attempt === maxRetries) throw error;
      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw new Error("All retry attempts failed");
}

/**
 * Get fallback quests for a node from database
 */
async function getFallbackQuests(
  supabase: any,
  nodeId: string,
): Promise<GeneratedQuest[]> {
  const { data } = await supabase
    .from("quests")
    .select("*")
    .eq("node_id", nodeId)
    .limit(4);

  return (data ?? []).map((q: any) => ({
    title: q.title,
    description: q.description,
    difficulty: q.difficulty,
    duration_min: q.duration_min,
    xp_reward: q.xp_reward,
  }));
}

/**
 * Generate quests for a specific skill node with retry and fallback
 */
async function generateQuestsForNode(
  supabase: any,
  userId: string,
  node: SkillNode,
  profile: any,
  localization: any,
  answers: any,
): Promise<number> {
  const questPrompt = await getSystemPrompt("quest_generation");
  if (!questPrompt) throw new Error("Quest generation prompt not found");

  const variables = {
    node_id: node.node_id,
    skill_title: node.title,
    skill_description: node.description,
    branch: node.branch,
    tier: String(node.tier),
    quests_total: String(node.quests_total),
    stamina: String(profile.stamina || 100),
    level: String(profile.level || 1),
    current_node: node.node_id,
    recent_quests: "[]",
  };

  const promptFilled = fillPromptTemplate(questPrompt.prompt, variables);

  const context = `Generate quests for this specific skill node:
${JSON.stringify(node, null, 2)}

Requirements:
- Generate exactly ${node.quests_total} quests for this skill
- Language: ${localization.language}
- User answers: ${JSON.stringify(answers)}
- Each quest must be specific to learning "${node.title}"
- Difficulty progression: start easy, get harder

Return JSON with "quests" array containing quest objects with: title, description, difficulty, duration_min, xp_reward`;

  let generatedQuests: GeneratedQuest[] = [];

  try {
    // Try AI generation with retry
    const aiResponse = await retryAI(
      promptFilled,
      context,
      {
        userId,
        promptName: "quest_generation",
        promptVersion: questPrompt.version,
        edgeFunction: "onboarding-generate",
        variables,
      },
      2,
    );

    // Parse response - handle both array and object with quests property
    const parsed = parseAIResponse(aiResponse);
    if (Array.isArray(parsed)) {
      generatedQuests = parsed;
    } else if (parsed.quests && Array.isArray(parsed.quests)) {
      generatedQuests = parsed.quests;
    } else if (parsed.data && Array.isArray(parsed.data)) {
      generatedQuests = parsed.data;
    }

    if (generatedQuests.length === 0) {
      throw new Error("No quests in AI response");
    }
  } catch (error) {
    console.error(
      `AI generation failed for node ${node.node_id}, using fallback:`,
      error,
    );
    // Use fallback quests from database
    generatedQuests = await getFallbackQuests(supabase, node.node_id);
  }

  if (generatedQuests.length === 0) {
    console.error(`No quests available for node ${node.node_id}`);
    return 0;
  }

  const today = new Date().toISOString().split("T")[0];

  // Insert quests with node_id
  const questsToInsert = generatedQuests
    .slice(0, node.quests_total)
    .map((quest, index) => ({
      quest_id: `gen_${node.node_id}_q${index + 1}_${Date.now()}`,
      title: quest.title,
      description: quest.description,
      branch: node.branch,
      difficulty: quest.difficulty,
      duration_min: quest.duration_min,
      xp_reward: quest.xp_reward,
      node_id: node.node_id,
    }));
  console.log("generateQuestsForNode questsToInsert:", questsToInsert);

  const { error: questError } = await supabase
    .from("quests")
    .upsert(questsToInsert, { onConflict: "quest_id" });

  if (questError) {
    console.error("Error inserting quests:", questError);
    return 0;
  }

  // Create user_quests entries
  const userQuestsToInsert = questsToInsert.map((quest, index) => ({
    user_id: userId,
    quest_id: quest.quest_id,
    date: today,
    xp_earned: 0,
    completed_at: null,
  }));

  const { error: userQuestError } = await supabase
    .from("user_quests")
    .insert(userQuestsToInsert);

  if (userQuestError) {
    console.error("Error inserting user_quests:", userQuestError);
  }

  console.log(
    `Generated ${questsToInsert.length} quests for node ${node.node_id}`,
  );
  return questsToInsert.length;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createServiceClient();

  try {
    // const { user_id } = await req.json();
    const user_id = "9c59bd86-3fa3-4447-86b8-7962096efa19";

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize tracking
    await supabase.from("generation_tracking").upsert(
      {
        user_id,
        status: "generating_skills",
        progress: 0,
        current_step: "Starting generation...",
        skills_done: false,
        quests_done: false,
      },
      { onConflict: "user_id" },
    );

    // 1. Fetch user profile and localization
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user_id)
      .single();

    if (!profile) {
      await updateTracking(supabase, user_id, {
        status: "failed",
        error_message: "User profile not found",
      });
      throw new Error("User profile not found");
    }

    const localization = profile.localization || {
      language: "vi",
      timezone: "Asia/Ho_Chi_Minh",
    };
    const primaryBranch = profile.primary_branch || "career";

    // 2. Fetch onboarding detail data via RPC
    const { data: detailRows } = await supabase.rpc("onboarding_detail_data", {
      p_user_id: user_id,
    });

    // Transform to { [type]: { key, label, description } }
    const answers: Record<
      string,
      { key: string; label: string; description: string }
    > = {};
    for (const row of detailRows ?? []) {
      answers[row.type] = {
        key: row.key,
        label: row.label,
        description: row.description,
      };
    }

    // 3. Fetch existing skill nodes for the branch
    const { data: existingNodes } = await supabase
      .from("skill_nodes")
      .select("node_id")
      .eq("branch", primaryBranch);

    const existingNodeIds = (existingNodes || []).map((n: any) => n.node_id);

    // 4. Fetch user's completed nodes
    const { data: userNodes } = await supabase
      .from("user_skill_nodes")
      .select("node_id, status")
      .eq("user_id", user_id);

    const completedNodes = (userNodes || [])
      .filter((n: any) => n.status === "completed")
      .map((n: any) => n.node_id);

    // 5. Generate skill nodes
    await updateTracking(supabase, user_id, {
      current_step: "Generating skill tree...",
      progress: 10,
    });

    const skillPrompt = await getSystemPrompt("skill_generation");
    if (!skillPrompt) throw new Error("Skill generation prompt not found");

    const branchWeights = {
      career:
        userNodes?.filter((n: any) => n.node_id.startsWith("career")).length ||
        0,
      finance:
        userNodes?.filter((n: any) => n.node_id.startsWith("finance")).length ||
        0,
      softskills:
        userNodes?.filter((n: any) => n.node_id.startsWith("softskills"))
          .length || 0,
      wellbeing:
        userNodes?.filter((n: any) => n.node_id.startsWith("wellbeing"))
          .length || 0,
    };

    const skillVariables = {
      user_level: String(profile.level || 1),
      primary_branch: primaryBranch,
      branch_weights: JSON.stringify(branchWeights),
      branch_weights_career: String(branchWeights.career),
      branch_weights_finance: String(branchWeights.finance),
      branch_weights_softskills: String(branchWeights.softskills),
      branch_weights_wellbeing: String(branchWeights.wellbeing),
      streak: String(profile.streak || 0),
      completed_nodes: JSON.stringify(completedNodes),
    };

    const skillPromptFilled = fillPromptTemplate(
      skillPrompt.prompt,
      skillVariables,
    );

    const skillContext = `Generate a personalized skill tree for a user with:
- Language: ${localization.language}
- Onboarding answers: ${JSON.stringify(answers)}
- Primary branch: ${primaryBranch}
- Level: ${profile.level || 1}

Return JSON: { "nodes": [{ "node_id", "branch", "tier", "title", "description", "xp_required", "quests_total" }] }`;

    let generatedSkills: { nodes: SkillNode[] } = { nodes: [] };
    console.log("Filled skill prompt:", skillPromptFilled);
    console.log("Skill generation context:", skillContext);
    console.log("Skill generation variables:", skillVariables);
    console.log("Skill geneartedSkills before AI call:", generatedSkills);
    try {
      // Try AI generation with retry
      const skillAIResponse = await retryAI(
        skillPromptFilled,
        skillContext,
        {
          userId: user_id,
          promptName: "skill_generation",
          promptVersion: skillPrompt.version,
          edgeFunction: "onboarding-generate",
          variables: skillVariables,
        },
        2,
      );

      // Parse response
      const parsed = parseAIResponse(skillAIResponse);
      if (parsed.nodes && Array.isArray(parsed.nodes)) {
        generatedSkills = parsed;
      } else if (Array.isArray(parsed)) {
        generatedSkills = { nodes: parsed };
      }

      if (generatedSkills.nodes.length === 0) {
        throw new Error("No nodes in AI response");
      }
    } catch (error) {
      console.error("AI skill generation failed, using fallback:", error);
      // Use fallback nodes from database for primary branch
      const { data: fallbackNodes } = await supabase
        .from("skill_nodes")
        .select("*")
        .eq("branch", primaryBranch)
        .order("tier", { ascending: true })
        .order("tier_order", { ascending: true })
        .limit(6);

      generatedSkills.nodes = (fallbackNodes ?? []).map((n: any) => ({
        node_id: n.node_id,
        branch: n.branch,
        tier: n.tier,
        title: n.title,
        description: n.description,
        xp_required: n.xp_required,
        quests_total: n.quests_total,
      }));
    }
    console.log("generatedSkills:", generatedSkills);

    await updateTracking(supabase, user_id, {
      current_step: "Saving skill nodes...",
      progress: 25,
    });

    // 6. Save generated skill nodes
    const skillsToInsert = (generatedSkills.nodes || [])
      .filter((node: SkillNode) => !existingNodeIds.includes(node.node_id))
      .map((node: SkillNode) => ({
        ...node,
        // Add gen_ prefix to distinguish from fallback data
        node_id: node.node_id.startsWith("gen_")
          ? node.node_id
          : `gen_${node.node_id}`,
      }));

    if (skillsToInsert.length > 0) {
      // Insert skill nodes
      await supabase.from("skill_nodes").insert(
        skillsToInsert.map((node: SkillNode) => ({
          node_id: node.node_id,
          branch: node.branch,
          tier: node.tier,
          title: node.title,
          description: node.description,
          xp_required: node.xp_required,
          quests_total: node.quests_total,
        })),
      );

      // Create user_skill_nodes for first 3 nodes (unlock them)
      const nodesToUnlock = skillsToInsert.slice(0, 3);
      await supabase.from("user_skill_nodes").upsert(
        nodesToUnlock.map((node: SkillNode) => ({
          user_id,
          node_id: node.node_id,
          status: "in_progress",
          unlocked_at: new Date().toISOString(),
        })),
        { onConflict: "user_id,node_id" },
      );

      await updateTracking(supabase, user_id, {
        skills_done: true,
        skills_count: skillsToInsert.length,
        current_step: "Skill tree complete!",
        progress: 40,
      });

      // 7. Generate quests for each unlocked node
      await updateTracking(supabase, user_id, {
        status: "generating_quests",
        current_step: "Generating quests for skills...",
        progress: 45,
      });

      let totalQuests = 0;
      const nodesWithQuests = skillsToInsert.slice(0, 3);

      for (let i = 0; i < nodesWithQuests.length; i++) {
        const node = nodesWithQuests[i];
        const nodeProgress = 45 + Math.floor((i / nodesWithQuests.length) * 45);

        await updateTracking(supabase, user_id, {
          current_step: `Generating quests for "${node.title}"...`,
          progress: nodeProgress,
        });

        try {
          const questCount = await generateQuestsForNode(
            supabase,
            user_id,
            node,
            profile,
            localization,
            answers,
          );
          totalQuests += questCount;
        } catch (err) {
          console.error(
            `Error generating quests for node ${node.node_id}:`,
            err,
          );
        }
      }

      // 8. Update user_quests_count in tracking
      await updateTracking(supabase, user_id, {
        quests_done: true,
        quests_count: totalQuests,
        status: "completed",
        current_step: "Generation complete!",
        progress: 100,
        completed_at: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            skills_generated: skillsToInsert.length,
            quests_generated: totalQuests,
            unlocked_nodes: nodesWithQuests.map((n) => ({
              node_id: n.node_id,
              title: n.title,
            })),
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    } else {
      await updateTracking(supabase, user_id, {
        status: "completed",
        current_step: "No new skills to generate",
        progress: 100,
        completed_at: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            skills_generated: 0,
            quests_generated: 0,
            message: "No new skills needed",
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
  } catch (error) {
    console.error("onboarding-generate error:", error);

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
