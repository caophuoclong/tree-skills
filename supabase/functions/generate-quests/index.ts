import { generateWithAI, parseAIResponse } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";
import {
  fillPromptTemplate,
  getSystemPrompt,
  getUserContext,
} from "../_shared/prompt.ts";
import {
  createServiceClient,
  getUserFromRequest,
  unauthorized,
} from "../_shared/supabase.ts";
import { GeneratedQuest } from "../_shared/types.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify JWT and get authenticated user
    const authUser = await getUserFromRequest(req);
    if (!authUser) return unauthorized();

    const user_id = authUser.id;
    const { branch, node_id } = await req.json();

    // 1. Fetch system prompt
    const prompt = await getSystemPrompt("quest_generation");
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "System prompt not found" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 2. Fetch user context
    const context = await getUserContext(user_id);
    if (!context.profile) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Get node info if generating for a specific node
    const supabase = createServiceClient();
    let targetNode = null;
    if (node_id) {
      const { data: node } = await supabase
        .from("skill_nodes")
        .select("node_id, branch, tier, title, description, quests_total")
        .eq("node_id", node_id)
        .single();
      targetNode = node;
    }

    // 4. Get current node in progress
    const { data: currentNode } = await supabase
      .from("user_skill_nodes")
      .select("node_id, status")
      .eq("user_id", user_id)
      .eq("status", "in_progress")
      .limit(1)
      .single();

    // 5. Fill prompt template
    const targetBranch =
      targetNode?.branch ??
      branch ??
      context.profile.primary_branch ??
      "career";
    const localization = context.profile.localization || { language: "vi" };
    const filledPrompt = fillPromptTemplate(prompt.prompt, {
      branch: targetBranch,
      language: localization.language,
      stamina: String(context.profile.stamina),
      level: String(context.profile.level),
      current_node: currentNode?.node_id ?? "none",
      node_id: targetNode?.node_id ?? "none",
      node_title: targetNode?.title ?? "none",
      node_description: targetNode?.description ?? "none",
      node_tier: String(targetNode?.tier ?? 1),
      quests_needed: String(targetNode?.quests_total ?? 4),
      recent_quests: JSON.stringify(
        context.recentQuests.map((q) => q.quest_id),
      ),
    });

    // 6. Generate with AI
    const aiResponse = await generateWithAI(
      filledPrompt,
      targetNode
        ? `Tạo ${targetNode.quests_total} nhiệm vụ cho node "${targetNode.title}" (nhánh ${targetBranch}). Language: ${localization.language}`
        : `Tạo nhiệm vụ hàng ngày cho nhánh ${targetBranch}. Language: ${localization.language}`,
    );

    const generatedQuests = parseAIResponse<{ quests: GeneratedQuest[] }>(
      aiResponse,
    );

    // 7. Insert generated quests into quests table
    const today = new Date().toISOString().split("T")[0];
    const questsToInsert = (generatedQuests?.quests ?? []).map(
      (q: GeneratedQuest) => ({
        quest_id: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        title: q.title,
        description: q.description,
        branch: targetBranch,
        difficulty: q.difficulty,
        duration_min: q.duration_min,
        xp_reward: q.xp_reward,
        node_id: targetNode?.node_id ?? null,
      }),
    );

    if (questsToInsert.length > 0) {
      // Insert into quests table
      const { error: insertError } = await supabase
        .from("quests")
        .insert(questsToInsert);

      if (insertError) {
        console.error("Failed to insert quests:", insertError);
      }

      // Also insert into user_quests to assign today
      const userQuestsToInsert = questsToInsert.map((q) => ({
        user_id: user_id,
        quest_id: q.quest_id,
        date: today,
        xp_earned: q.xp_reward,
        assigned: false,
      }));

      const { error: assignError } = await supabase
        .from("user_quests")
        .upsert(userQuestsToInsert, {
          onConflict: "user_id,quest_id",
        });

      if (assignError) {
        console.error("Failed to assign quests:", assignError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: { quests: questsToInsert },
        prompt_used: prompt.name,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("generate-quests error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
