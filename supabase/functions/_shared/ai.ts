/**
 * Flexible AI Provider Module
 *
 * Supports any AI provider via configuration from database.
 * Default providers: OpenAI, Anthropic, Google, Local/Ollama
 */

import { createServiceClient } from "./supabase.ts";

interface AIProvider {
  id: string;
  name: string;
  display_name: string;
  api_base_url: string;
  api_key_env: string;
  default_model: string;
  is_active: boolean;
  config: {
    headers?: Record<string, string>;
    body_params?: Record<string, unknown>;
  };
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface GenerateOptions {
  provider?: string; // provider name, e.g. 'openai'
  model?: string; // model override, e.g. 'gpt-4o'
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "json" | "text";
}

/**
 * Fetch active AI provider from database
 */
async function getProvider(name?: string): Promise<AIProvider> {
  const supabase = createServiceClient();

  let query = supabase.from("ai_providers").select("*").eq("is_active", true);

  if (name) {
    query = query.eq("name", name);
  } else {
    query = query.order("created_at", { ascending: true }).limit(1);
  }

  const { data, error } = await query.single();

  if (error || !data) {
    throw new Error(`AI provider not found: ${name ?? "any"}`);
  }

  return data as AIProvider;
}

/**
 * Build request body based on provider format
 */
function buildRequestBody(
  provider: AIProvider,
  messages: ChatMessage[],
  model: string,
  options: GenerateOptions,
): Record<string, unknown> {
  const bodyParams = provider.config.body_params ?? {};

  switch (provider.name) {
    case "openai":
      return {
        model,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        temperature: options.temperature ?? bodyParams.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? bodyParams.max_tokens ?? 2000,
        ...(options.responseFormat === "json"
          ? { response_format: { type: "json_object" } }
          : {}),
        ...bodyParams,
      };

    case "anthropic":
      return {
        model,
        system: messages.find((m) => m.role === "system")?.content ?? "",
        messages: messages
          .filter((m) => m.role !== "system")
          .map((m) => ({ role: m.role, content: m.content })),
        max_tokens: options.maxTokens ?? bodyParams.max_tokens ?? 2000,
        ...bodyParams,
      };

    case "google": {
      const baseUrl = provider.api_base_url;
      // Google uses URL-based model selection
      provider.api_base_url = `${baseUrl}/${model}:generateContent`;
      return {
        contents: messages
          .filter((m) => m.role !== "system")
          .map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
        systemInstruction: messages.find((m) => m.role === "system")
          ? {
              parts: [
                { text: messages.find((m) => m.role === "system")!.content },
              ],
            }
          : undefined,
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxTokens ?? 2000,
          ...(options.responseFormat === "json"
            ? { responseMimeType: "application/json" }
            : {}),
          ...bodyParams.generationConfig,
        },
        ...bodyParams,
      };
    }

    case "local":
    default:
      return {
        model,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        stream: false,
        ...bodyParams,
      };
  }
}

/**
 * Parse response based on provider format
 */
function parseResponse(
  provider: AIProvider,
  data: Record<string, unknown>,
): string {
  switch (provider.name) {
    case "openai":
      return (
        (data as { choices?: { message?: { content?: string } }[] })
          ?.choices?.[0]?.message?.content ?? "{}"
      );

    case "anthropic":
      return (
        (data as { content?: { text?: string }[] })?.content?.[0]?.text ?? "{}"
      );

    case "google": {
      const candidates = (
        data as { candidates?: { content?: { parts?: { text?: string }[] } }[] }
      )?.candidates;
      return candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    }

    case "local":
    default:
      return (
        (data as { message?: { content?: string } })?.message?.content ?? "{}"
      );
  }
}

/**
 * Call AI provider with messages
 */
export async function generateWithAI(
  systemPrompt: string,
  userMessage: string,
  options: GenerateOptions = {},
): Promise<string> {
  // Get provider from DB or use specified one
  const provider = await getProvider(options.provider);
  const model = options.model ?? provider.default_model;

  // Get API key from environment
  const apiKey = provider.api_key_env
    ? (Deno.env.get(provider.api_key_env) ?? "")
    : "";

  // Build messages
  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ];

  // Build request body
  const body = buildRequestBody(provider, messages, model, options);

  // Build headers
  const headers: Record<string, string> = {};
  if (provider.config.headers) {
    for (const [key, value] of Object.entries(provider.config.headers)) {
      headers[key] = value.replace("{{api_key}}", apiKey);
    }
  }

  // Handle Google API key in URL
  let url = provider.api_base_url;
  if (provider.name === "google") {
    url = `${url}?key=${apiKey}`;
  }

  // Make request
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  console.log("Second", response);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(
      `AI API error (${provider.name}): ${response.status} - ${error}`,
    );
  }

  const data = await response.json();
  console.log("DATA, :", data);
  return parseResponse(provider, data);
}

/**
 * Parse AI response as JSON
 * Handles markdown code blocks (```json ... ```) if present
 */
export function parseAIResponse<T>(response: string): T {
  try {
    let jsonString = response.trim();

    // Strip markdown code blocks if present (```json ... ``` or ``` ... ```)
    const codeBlockMatch = jsonString.match(
      /^```(?:json)?\s*([\s\S]*?)\s*```$/,
    );
    if (codeBlockMatch) {
      jsonString = codeBlockMatch[1].trim();
    }

    return JSON.parse(jsonString) as T;
  } catch {
    throw new Error(`Failed to parse AI response: ${response}`);
  }
}

/**
 * List all active providers
 */
export async function listProviders(): Promise<AIProvider[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("ai_providers")
    .select("*")
    .eq("is_active", true)
    .order("name");

  return (data ?? []) as AIProvider[];
}
