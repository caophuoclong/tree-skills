import { corsHeaders } from '../_shared/cors.ts'
import { createServiceClient } from '../_shared/supabase.ts'
import { getSystemPrompt, getUserContext, fillPromptTemplate } from '../_shared/prompt.ts'
import { generateWithAI, parseAIResponse } from '../_shared/ai.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user_id } = await req.json()

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 1. Fetch system prompt
    const prompt = await getSystemPrompt('challenge_generation')
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'System prompt not found' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Fetch user context
    const context = await getUserContext(user_id)
    if (!context.profile) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Analyze weak areas (branches with fewer completed nodes)
    const branchProgress = {
      career: context.completedNodes.filter(n => n.node_id.startsWith('career')).length,
      finance: context.completedNodes.filter(n => n.node_id.startsWith('finance')).length,
      softskills: context.completedNodes.filter(n => n.node_id.startsWith('soft')).length,
      wellbeing: context.completedNodes.filter(n => n.node_id.startsWith('well')).length,
    }

    const weakAreas = Object.entries(branchProgress)
      .sort(([, a], [, b]) => a - b)
      .slice(0, 2)
      .map(([branch]) => branch)

    // 4. Fill prompt template
    const filledPrompt = fillPromptTemplate(prompt.prompt, {
      primary_branch: context.profile.primary_branch ?? 'career',
      level: String(context.profile.level),
      completed_challenges: JSON.stringify(context.completedChallenges.map(c => c.challenge_id)),
      weak_areas: JSON.stringify(weakAreas),
    })

    // 5. Generate with AI
    const aiResponse = await generateWithAI(
      filledPrompt,
      'Tạo thử thách mới cho người dùng.'
    )

    const generatedChallenges = parseAIResponse<{ challenges: unknown[] }>(aiResponse)

    // 6. Insert into challenges table
    const supabase = createServiceClient()
    const challengesToInsert = (generatedChallenges.challenges ?? []).map((c: Record<string, unknown>) => ({
      id: `ch_gen_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      title: c.title,
      description: c.description,
      branch: c.branch,
      target_count: c.target_count,
      duration_days: c.duration_days,
    }))

    if (challengesToInsert.length > 0) {
      await supabase.from('challenges').insert(challengesToInsert)
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: { challenges: challengesToInsert },
        prompt_used: prompt.name,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('generate-challenges error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
