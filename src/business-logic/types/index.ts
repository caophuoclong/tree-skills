export type Branch = 'career' | 'finance' | 'softskills' | 'wellbeing';
export type NodeStatus = 'locked' | 'in_progress' | 'completed';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type QuestDuration = 5 | 15 | 30;
export type MoodScore = 1 | 2 | 3 | 4 | 5;

export interface SkillNode {
  node_id: string;
  branch: Branch;
  tier: 1 | 2 | 3;
  title: string;
  description: string;
  status: NodeStatus;
  xp_required: number;
  quests_total: number;
  quests_completed: number;
}

export interface Quest {
  quest_id: string;
  title: string;
  description: string;
  branch: Branch;
  difficulty: Difficulty;
  duration_min: QuestDuration;
  xp_reward: 10 | 25 | 50;
  completed_at: string | null;
}

export interface UserProgress {
  user_id: string;
  name: string;
  avatar_url: string | null;
  level: number;
  total_xp: number;
  current_xp_in_level: number;
  xp_to_next_level: number;
  streak: number;
  best_streak: number;
  stamina: number;
  last_active_date: string | null;
  last_login_at: string | null;
  onboarding_done: boolean;
}

export interface DailyStats {
  quests_completed_today: number;
  wellbeing_quests_today: number;
  career_finance_quests_today: number;
  session_combo: number;
}

export type OnboardingAnswer = {
  question_id: number;
  selected_branch: Branch;
};
