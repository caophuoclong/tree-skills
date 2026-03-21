import { generateWithAI, parseAIResponse } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";
import {
  fillPromptTemplate,
  getSystemPrompt,
  getUserContext,
} from "../_shared/prompt.ts";
import { createServiceClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { user_id, branch } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    // 3. Get current node in progress
    const supabase = createServiceClient();
    const { data: currentNode } = await supabase
      .from("user_skill_nodes")
      .select("node_id, status")
      .eq("user_id", user_id)
      .eq("status", "in_progress")
      .limit(1)
      .single();

    // 4. Fill prompt template
    const targetBranch = branch ?? context.profile.primary_branch ?? "career";
    const filledPrompt = fillPromptTemplate(prompt.prompt, {
      branch: targetBranch,
      stamina: String(context.profile.stamina),
      level: String(context.profile.level),
      current_node: currentNode?.node_id ?? "none",
      recent_quests: JSON.stringify(
        context.recentQuests.map((q) => q.quest_id),
      ),
    });

    // 5. Generate with AI
    const aiResponse = await generateWithAI(
      filledPrompt,
      `Tạo nhiệm vụ hàng ngày cho nhánh ${targetBranch}.`,
    );

    const generatedQuests = parseAIResponse<unknown[]>(aiResponse);

    // 6. Insert generated quests into quests table
    const questsToInsert = (generatedQuests ?? []).map(
      (q: Record<string, unknown>) => ({
        quest_id: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        title: q.title,
        description: q.description,
        branch: targetBranch,
        difficulty: q.difficulty,
        duration_min: q.duration_min,
        xp_reward: q.xp_reward,
      }),
    );

    if (questsToInsert.length > 0) {
      await supabase.from("quests").insert(questsToInsert);
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
