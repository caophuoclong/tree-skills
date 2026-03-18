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

// ─── Weekly Activity ──────────────────────────────────────────────────────

export interface WeeklyDay {
  date: string; // YYYY-MM-DD
  questsCompleted: number;
  xpEarned: number;
}

// ─── Custom Skill Tree Builder ─────────────────────────────────────────────────

/** A user-defined goal tree generated with AI assistance */
export interface CustomGoalTree {
  id: string;
  goal: string;
  created_at: string;
  clusters: CustomCluster[];
}

/** A skill cluster (parent group) — always mapped to one Branch category */
export interface CustomCluster {
  id: string;
  title: string;
  branch: Branch;          // career | finance | softskills | wellbeing
  emoji: string;
  tier: 1 | 2 | 3;
  skills: CustomSkillItem[];
}

/** A quest inside a custom skill */
export interface CustomQuest {
  id: string;
  title: string;
  difficulty: Difficulty;
  duration_min: QuestDuration;
}

/** A single skill node inside a cluster */
export interface CustomSkillItem {
  id: string;
  title: string;
  description: string;
  branch: Branch;          // inherited from cluster
  duration_weeks: 1 | 2;
  quests: CustomQuest[];   // 3 quests with actual content
  status: NodeStatus;
}

/** Extended SkillNode with optional custom goal metadata */
export interface SkillNodeMeta {
  goalId?: string;         // id of the CustomGoalTree that created this node
  goalTitle?: string;      // short display name of the goal
}
