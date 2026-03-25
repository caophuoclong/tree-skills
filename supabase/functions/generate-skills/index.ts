import { generateWithAI, parseAIResponse } from "../_shared/ai.ts";
import { corsHeaders } from "../_shared/cors.ts";
import {
  fillPromptTemplate,
  getSystemPrompt,
  getUserContext,
} from "../_shared/prompt.ts";
import {
  createSupabaseClient,
  getUserFromRequest,
  unauthorized,
} from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify JWT and get authenticated user
    const authUser = await getUserFromRequest(req);
    if (!authUser) return unauthorized();

    const user_id = authUser.id;

    // 1. Fetch system prompt
    const prompt = await getSystemPrompt("skill_generation");
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

    // 3. Fill prompt template with user data
    const branchWeights = {
      career: context.completedNodes.filter((n) =>
        n.node_id.startsWith("career"),
      ).length,
      finance: context.completedNodes.filter((n) =>
        n.node_id.startsWith("finance"),
      ).length,
      softskills: context.completedNodes.filter((n) =>
        n.node_id.startsWith("soft"),
      ).length,
      wellbeing: context.completedNodes.filter((n) =>
        n.node_id.startsWith("well"),
      ).length,
    };

    const filledPrompt = fillPromptTemplate(prompt.prompt, {
      user_level: String(context.profile.level),
      primary_branch: context.profile.primary_branch ?? "career",
      branch_weights: JSON.stringify(branchWeights),
      streak: String(context.profile.streak),
      completed_nodes: JSON.stringify(
        context.completedNodes.map((n) => n.node_id),
      ),
    });

    // 4. Generate with AI
    const aiResponse = await generateWithAI(
      filledPrompt,
      "Tạo cây kỹ năng cá nhân hóa cho người dùng này.",
    );

    const generatedSkills = parseAIResponse<{ nodes: unknown[] }>(aiResponse);

    // 5. Save generated skills to custom_goal_trees
    const supabase = createSupabaseClient(req);
    await supabase.from("custom_goal_trees").insert({
      user_id,
      goal: `Personalized skill tree for level ${context.profile.level}`,
      clusters: generatedSkills.nodes ?? [],
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: generatedSkills,
        prompt_used: prompt.name,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("generate-skills error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
