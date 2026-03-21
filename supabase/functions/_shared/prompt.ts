import { createServiceClient } from './supabase.ts'
import type { SystemPrompt, UserProfile } from './types.ts'

/**
 * Fetch active system prompt by name
 */
export async function getSystemPrompt(name: string): Promise<SystemPrompt | null> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('system_prompts')
    .select('*')
    .eq('name', name)
    .eq('is_active', true)
    .order('version', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    console.error(`Failed to fetch prompt "${name}":`, error)
    return null
  }

  return data as SystemPrompt
}

/**
 * Fetch user profile and related data
 */
export async function getUserContext(userId: string) {
  const supabase = createServiceClient()

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  // Fetch completed skill nodes
  const { data: completedNodes } = await supabase
    .from('user_skill_nodes')
    .select('node_id, status')
    .eq('user_id', userId)
    .eq('status', 'completed')

  // Fetch recent quests (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const { data: recentQuests } = await supabase
    .from('user_quests')
    .select('quest_id, xp_earned, date')
    .eq('user_id', userId)
    .gte('date', sevenDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: false })
    .limit(20)

  // Fetch completed challenges
  const { data: completedChallenges } = await supabase
    .from('user_challenges')
    .select('challenge_id, progress, completed_at')
    .eq('user_id', userId)
    .not('completed_at', 'is', null)

  return {
    profile,
    completedNodes: completedNodes ?? [],
    recentQuests: recentQuests ?? [],
    completedChallenges: completedChallenges ?? [],
  }
}

/**
 * Replace template variables in prompt
 */
export function fillPromptTemplate(
  template: string,
  variables: Record<string, string>
): string {
  let result = template
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
  }
  return result
}
