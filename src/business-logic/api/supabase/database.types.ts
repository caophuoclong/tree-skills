/**
 * Supabase database type definitions.
 * Auto-generate in production with: `supabase gen types typescript --project-id YOUR_ID > database.types.ts`
 * 
 * Table naming convention: snake_case, plural
 * All tables have `user_id` (uuid, FK → auth.users) except seed tables (skill_nodes, quests, challenges)
 */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {

      // ─── profiles ─────────────────────────────────────────────────────────
      // 1-to-1 with auth.users. Created via trigger on signup.
      profiles: {
        Row: {
          id: string;              // uuid, FK → auth.users.id
          name: string;
          avatar_url: string | null;
          level: number;
          total_xp: number;
          current_xp_in_level: number;
          xp_to_next_level: number;
          streak: number;
          best_streak: number;
          stamina: number;         // 0–100
          primary_branch: string | null;
          onboarding_done: boolean;
          last_active_date: string | null;  // YYYY-MM-DD
          shields_remaining: number;
          shield_activated_date: string | null; // YYYY-MM-DD
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };

      // ─── skill_nodes ──────────────────────────────────────────────────────
      // Master catalog — seeded, public read, admin write
      skill_nodes: {
        Row: {
          node_id: string;         // e.g. 'career_t1_1'
          branch: string;          // career | finance | softskills | wellbeing
          tier: number;            // 1 | 2 | 3
          title: string;
          description: string;
          xp_required: number;
          quests_total: number;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['skill_nodes']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['skill_nodes']['Insert']>;
      };

      // ─── user_skill_nodes ─────────────────────────────────────────────────
      // Per-user progress on each node
      user_skill_nodes: {
        Row: {
          id: string;              // uuid
          user_id: string;         // FK → auth.users
          node_id: string;         // FK → skill_nodes
          status: string;          // locked | in_progress | completed
          quests_completed: number;
          unlocked_at: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_skill_nodes']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['user_skill_nodes']['Insert']>;
      };

      // ─── quests ───────────────────────────────────────────────────────────
      // Master catalog — seeded, public read
      quests: {
        Row: {
          quest_id: string;        // e.g. 'career_easy_001'
          title: string;
          description: string;
          branch: string;
          difficulty: string;      // easy | medium | hard
          duration_min: number;    // 5 | 15 | 30
          xp_reward: number;       // 10 | 25 | 50
          node_id: string | null;  // optional FK → skill_nodes
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['quests']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['quests']['Insert']>;
      };

      // ─── user_quests ──────────────────────────────────────────────────────
      // Tracks which quests user completed + daily pool
      user_quests: {
        Row: {
          id: string;              // uuid
          user_id: string;
          quest_id: string;        // FK → quests
          completed_at: string;    // ISO timestamp
          xp_earned: number;       // actual XP (after stamina multiplier)
          date: string;            // YYYY-MM-DD (for daily grouping)
        };
        Insert: Omit<Database['public']['Tables']['user_quests']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['user_quests']['Insert']>;
      };

      // ─── challenges ───────────────────────────────────────────────────────
      // Master catalog — seeded
      challenges: {
        Row: {
          id: string;
          title: string;
          description: string;
          branch: string;
          target_count: number;
          duration_days: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['challenges']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['challenges']['Insert']>;
      };

      // ─── user_challenges ─────────────────────────────────────────────────
      user_challenges: {
        Row: {
          id: string;              // uuid
          user_id: string;
          challenge_id: string;    // FK → challenges
          progress: number;        // quests completed toward target
          joined_at: string;
          ends_at: string;         // joined_at + duration_days
          completed_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['user_challenges']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['user_challenges']['Insert']>;
      };

      // ─── roadmap_milestones ───────────────────────────────────────────────
      roadmap_milestones: {
        Row: {
          id: string;              // uuid
          user_id: string;
          title: string;
          branch: string;
          horizon: string;         // short | mid | long
          target_date: string;     // YYYY-MM-DD
          is_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['roadmap_milestones']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['roadmap_milestones']['Insert']>;
      };

      // ─── custom_goal_trees ────────────────────────────────────────────────
      custom_goal_trees: {
        Row: {
          id: string;              // uuid
          user_id: string;
          goal: string;
          clusters: Json;          // CustomCluster[] stored as JSONB
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['custom_goal_trees']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['custom_goal_trees']['Insert']>;
      };

      // ─── notifications ────────────────────────────────────────────────────
      notifications: {
        Row: {
          id: string;              // uuid
          user_id: string;
          type: string;            // streak_reminder | quest_suggestion | level_up | challenge_complete
          title: string;
          body: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
    };

    Views: {};
    Functions: {};
    Enums: {
      branch_type: 'career' | 'finance' | 'softskills' | 'wellbeing';
      node_status: 'locked' | 'in_progress' | 'completed';
      difficulty_type: 'easy' | 'medium' | 'hard';
      time_horizon: 'short' | 'mid' | 'long';
    };
  };
}

// ─── Convenience row types ────────────────────────────────────────────────────
export type ProfileRow        = Database['public']['Tables']['profiles']['Row'];
export type SkillNodeRow      = Database['public']['Tables']['skill_nodes']['Row'];
export type UserSkillNodeRow  = Database['public']['Tables']['user_skill_nodes']['Row'];
export type QuestRow          = Database['public']['Tables']['quests']['Row'];
export type UserQuestRow      = Database['public']['Tables']['user_quests']['Row'];
export type ChallengeRow      = Database['public']['Tables']['challenges']['Row'];
export type UserChallengeRow  = Database['public']['Tables']['user_challenges']['Row'];
export type RoadmapMilestoneRow = Database['public']['Tables']['roadmap_milestones']['Row'];
export type CustomGoalTreeRow = Database['public']['Tables']['custom_goal_trees']['Row'];
export type NotificationRow   = Database['public']['Tables']['notifications']['Row'];
