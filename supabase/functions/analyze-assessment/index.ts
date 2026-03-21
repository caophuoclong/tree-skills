import { corsHeaders } from '../_shared/cors.ts'
import { createServiceClient } from '../_shared/supabase.ts'
import { getSystemPrompt, fillPromptTemplate } from '../_shared/prompt.ts'
import { generateWithAI, parseAIResponse } from '../_shared/ai.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user_id, answers } = await req.json()

    if (!user_id || !answers) {
      return new Response(
        JSON.stringify({ error: 'user_id and answers are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 1. Fetch system prompt
    const prompt = await getSystemPrompt('assessment_analysis')
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'System prompt not found' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Fill prompt template with answers
    const filledPrompt = fillPromptTemplate(prompt.prompt, {
      answers: JSON.stringify(answers),
    })

    // 3. Generate with AI
    const aiResponse = await generateWithAI(
      filledPrompt,
      'Phân tích câu trả lời đánh giá và xác định profile người dùng.'
    )

    const analysis = parseAIResponse<{
      branch_weights: Record<string, number>
      primary_branch: string
      roadmap_summary: string
      recommended_start_nodes: string[]
    }>(aiResponse)

    // 4. Update user profile with primary branch
    const supabase = createServiceClient()
    await supabase
      .from('profiles')
      .update({
        primary_branch: analysis.primary_branch,
        onboarding_done: true,
      })
      .eq('id', user_id)

    // 5. Unlock recommended starting nodes
    if (analysis.recommended_start_nodes?.length > 0) {
      const nodesToUnlock = analysis.recommended_start_nodes.map((nodeId: string) => ({
        user_id,
        node_id: nodeId,
        status: 'in_progress',
        unlocked_at: new Date().toISOString(),
      }))

      await supabase
        .from('user_skill_nodes')
        .upsert(nodesToUnlock, { onConflict: 'user_id,node_id' })
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: analysis,
        prompt_used: prompt.name,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('analyze-assessment error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
