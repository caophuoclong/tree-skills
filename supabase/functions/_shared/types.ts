export interface SystemPrompt {
  id: string;
  name: string;
  version: number;
  prompt: string;
  variables: string[];
  is_active: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  level: number;
  total_xp: number;
  streak: number;
  primary_branch: string | null;
  stamina: number;
}

export interface GenerationRequest {
  user_id: string;
  generation_type: "skills" | "quests" | "challenges" | "assessment";
  context?: Record<string, unknown>;
}

export interface GenerationResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  prompt_used?: string;
}

export interface GeneratedQuest {
  title: string;
  description: string;
  difficulty: string;
  duration_min: number;
  xp_reward: number;
}
