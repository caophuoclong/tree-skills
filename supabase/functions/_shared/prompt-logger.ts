import { createServiceClient } from './supabase.ts'

interface LogPromptParams {
  userId?: string
  promptName: string
  promptVersion?: number
  edgeFunction: string
  variables: Record<string, string>
  filledPrompt: string
  aiResponse?: string
  parsedData?: unknown
  model?: string
  provider?: string
  tokensUsed?: number
  success: boolean
  errorMessage?: string
  durationMs: number
}

/**
 * Log prompt execution to database for tracking
 */
export async function logPromptExecution(params: LogPromptParams): Promise<void> {
  try {
    const supabase = createServiceClient()

    await supabase.from('prompt_executions').insert({
      user_id: params.userId,
      prompt_name: params.promptName,
      prompt_version: params.promptVersion ?? 1,
      edge_function: params.edgeFunction,
      variables: params.variables,
      filled_prompt: params.filledPrompt,
      ai_response: params.aiResponse,
      parsed_data: params.parsedData,
      model: params.model,
      provider: params.provider,
      tokens_used: params.tokensUsed,
      success: params.success,
      error_message: params.errorMessage,
      duration_ms: params.durationMs,
      executed_at: new Date().toISOString(),
    })
  } catch (err) {
    // Don't fail the main flow if logging fails
    console.error('Failed to log prompt execution:', err)
  }
}

/**
 * Wrapper that executes AI call and logs the result
 */
export async function generateWithAILogged(
  systemPrompt: string,
  userMessage: string,
  options: {
    userId?: string
    promptName: string
    promptVersion?: number
    edgeFunction: string
    variables: Record<string, string>
    model?: string
    provider?: string
  }
): Promise<string> {
  const startTime = Date.now()

  try {
    // Import the AI module
    const { generateWithAI } = await import('./ai.ts')

    const response = await generateWithAI(systemPrompt, userMessage, {
      provider: options.provider,
      model: options.model,
    })

    const durationMs = Date.now() - startTime

    // Log success
    await logPromptExecution({
      userId: options.userId,
      promptName: options.promptName,
      promptVersion: options.promptVersion,
      edgeFunction: options.edgeFunction,
      variables: options.variables,
      filledPrompt: systemPrompt,
      aiResponse: response,
      model: options.model,
      provider: options.provider,
      success: true,
      durationMs,
    })

    return response
  } catch (error) {
    const durationMs = Date.now() - startTime

    // Log failure
    await logPromptExecution({
      userId: options.userId,
      promptName: options.promptName,
      promptVersion: options.promptVersion,
      edgeFunction: options.edgeFunction,
      variables: options.variables,
      filledPrompt: systemPrompt,
      success: false,
      errorMessage: error.message,
      durationMs,
    })

    throw error
  }
}
