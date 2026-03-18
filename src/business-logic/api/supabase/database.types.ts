export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4";
  };
  public: {
    Tables: {
      assessment_options: {
        Row: {
          branch: Database["public"]["Enums"]["branch_type"];
          id: string;
          question_id: number;
          sort_order: number;
          text: string;
        };
        Insert: {
          branch: Database["public"]["Enums"]["branch_type"];
          id: string;
          question_id: number;
          sort_order?: number;
          text: string;
        };
        Update: {
          branch?: Database["public"]["Enums"]["branch_type"];
          id?: string;
          question_id?: number;
          sort_order?: number;
          text?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assessment_options_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "assessment_questions";
            referencedColumns: ["id"];
          },
        ];
      };
      assessment_questions: {
        Row: {
          id: number;
          question: string;
          sort_order: number;
        };
        Insert: {
          id?: number;
          question: string;
          sort_order?: number;
        };
        Update: {
          id?: number;
          question?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      challenges: {
        Row: {
          branch: Database["public"]["Enums"]["branch_type"];
          created_at: string;
          description: string;
          duration_days: number;
          id: string;
          target_count: number;
          title: string;
        };
        Insert: {
          branch: Database["public"]["Enums"]["branch_type"];
          created_at?: string;
          description?: string;
          duration_days: number;
          id: string;
          target_count: number;
          title: string;
        };
        Update: {
          branch?: Database["public"]["Enums"]["branch_type"];
          created_at?: string;
          description?: string;
          duration_days?: number;
          id?: string;
          target_count?: number;
          title?: string;
        };
        Relationships: [];
      };
      custom_goal_trees: {
        Row: {
          clusters: Json;
          created_at: string;
          goal: string;
          id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          clusters?: Json;
          created_at?: string;
          goal: string;
          id?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          clusters?: Json;
          created_at?: string;
          goal?: string;
          id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          is_read: boolean;
          title: string;
          type: Database["public"]["Enums"]["notif_type"];
          user_id: string;
        };
        Insert: {
          body?: string;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          title: string;
          type: Database["public"]["Enums"]["notif_type"];
          user_id: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          title?: string;
          type?: Database["public"]["Enums"]["notif_type"];
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          best_streak: number;
          created_at: string;
          current_xp_in_level: number;
          id: string;
          last_active_date: string | null;
          level: number;
          name: string;
          onboarding_done: boolean;
          primary_branch: Database["public"]["Enums"]["branch_type"] | null;
          shield_activated_date: string | null;
          shields_remaining: number;
          stamina: number;
          streak: number;
          total_xp: number;
          updated_at: string;
          xp_to_next_level: number;
        };
        Insert: {
          avatar_url?: string | null;
          best_streak?: number;
          created_at?: string;
          current_xp_in_level?: number;
          id: string;
          last_active_date?: string | null;
          level?: number;
          name?: string;
          onboarding_done?: boolean;
          primary_branch?: Database["public"]["Enums"]["branch_type"] | null;
          shield_activated_date?: string | null;
          shields_remaining?: number;
          stamina?: number;
          streak?: number;
          total_xp?: number;
          updated_at?: string;
          xp_to_next_level?: number;
        };
        Update: {
          avatar_url?: string | null;
          best_streak?: number;
          created_at?: string;
          current_xp_in_level?: number;
          id?: string;
          last_active_date?: string | null;
          level?: number;
          name?: string;
          onboarding_done?: boolean;
          primary_branch?: Database["public"]["Enums"]["branch_type"] | null;
          shield_activated_date?: string | null;
          shields_remaining?: number;
          stamina?: number;
          streak?: number;
          total_xp?: number;
          updated_at?: string;
          xp_to_next_level?: number;
        };
        Relationships: [];
      };
      quests: {
        Row: {
          branch: Database["public"]["Enums"]["branch_type"];
          created_at: string;
          description: string;
          difficulty: Database["public"]["Enums"]["difficulty_type"];
          duration_min: number;
          node_id: string | null;
          quest_id: string;
          title: string;
          xp_reward: number;
        };
        Insert: {
          branch: Database["public"]["Enums"]["branch_type"];
          created_at?: string;
          description?: string;
          difficulty: Database["public"]["Enums"]["difficulty_type"];
          duration_min: number;
          node_id?: string | null;
          quest_id: string;
          title: string;
          xp_reward: number;
        };
        Update: {
          branch?: Database["public"]["Enums"]["branch_type"];
          created_at?: string;
          description?: string;
          difficulty?: Database["public"]["Enums"]["difficulty_type"];
          duration_min?: number;
          node_id?: string | null;
          quest_id?: string;
          title?: string;
          xp_reward?: number;
        };
        Relationships: [
          {
            foreignKeyName: "quests_node_id_fkey";
            columns: ["node_id"];
            isOneToOne: false;
            referencedRelation: "skill_nodes";
            referencedColumns: ["node_id"];
          },
        ];
      };
      roadmap_milestones: {
        Row: {
          branch: Database["public"]["Enums"]["branch_type"];
          created_at: string;
          horizon: Database["public"]["Enums"]["time_horizon"];
          id: string;
          is_completed: boolean;
          target_date: string;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          branch: Database["public"]["Enums"]["branch_type"];
          created_at?: string;
          horizon: Database["public"]["Enums"]["time_horizon"];
          id?: string;
          is_completed?: boolean;
          target_date: string;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          branch?: Database["public"]["Enums"]["branch_type"];
          created_at?: string;
          horizon?: Database["public"]["Enums"]["time_horizon"];
          id?: string;
          is_completed?: boolean;
          target_date?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      skill_nodes: {
        Row: {
          branch: Database["public"]["Enums"]["branch_type"];
          created_at: string;
          description: string;
          node_id: string;
          quests_total: number;
          sort_order: number;
          tier: number;
          title: string;
          xp_required: number;
        };
        Insert: {
          branch: Database["public"]["Enums"]["branch_type"];
          created_at?: string;
          description?: string;
          node_id: string;
          quests_total?: number;
          sort_order?: number;
          tier: number;
          title: string;
          xp_required?: number;
        };
        Update: {
          branch?: Database["public"]["Enums"]["branch_type"];
          created_at?: string;
          description?: string;
          node_id?: string;
          quests_total?: number;
          sort_order?: number;
          tier?: number;
          title?: string;
          xp_required?: number;
        };
        Relationships: [];
      };
      user_challenges: {
        Row: {
          challenge_id: string;
          completed_at: string | null;
          ends_at: string;
          id: string;
          joined_at: string;
          progress: number;
          user_id: string;
        };
        Insert: {
          challenge_id: string;
          completed_at?: string | null;
          ends_at: string;
          id?: string;
          joined_at?: string;
          progress?: number;
          user_id: string;
        };
        Update: {
          challenge_id?: string;
          completed_at?: string | null;
          ends_at?: string;
          id?: string;
          joined_at?: string;
          progress?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_challenges_challenge_id_fkey";
            columns: ["challenge_id"];
            isOneToOne: false;
            referencedRelation: "challenges";
            referencedColumns: ["id"];
          },
        ];
      };
      user_quests: {
        Row: {
          completed_at: string;
          date: string;
          id: string;
          quest_id: string;
          user_id: string;
          xp_earned: number;
        };
        Insert: {
          completed_at?: string;
          date?: string;
          id?: string;
          quest_id: string;
          user_id: string;
          xp_earned: number;
        };
        Update: {
          completed_at?: string;
          date?: string;
          id?: string;
          quest_id?: string;
          user_id?: string;
          xp_earned?: number;
        };
        Relationships: [
          {
            foreignKeyName: "user_quests_quest_id_fkey";
            columns: ["quest_id"];
            isOneToOne: false;
            referencedRelation: "quests";
            referencedColumns: ["quest_id"];
          },
        ];
      };
      user_skill_nodes: {
        Row: {
          completed_at: string | null;
          created_at: string;
          id: string;
          node_id: string;
          quests_completed: number;
          status: Database["public"]["Enums"]["node_status"];
          unlocked_at: string | null;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          node_id: string;
          quests_completed?: number;
          status?: Database["public"]["Enums"]["node_status"];
          unlocked_at?: string | null;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          node_id?: string;
          quests_completed?: number;
          status?: Database["public"]["Enums"]["node_status"];
          unlocked_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_skill_nodes_node_id_fkey";
            columns: ["node_id"];
            isOneToOne: false;
            referencedRelation: "skill_nodes";
            referencedColumns: ["node_id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      branch_type: "career" | "finance" | "softskills" | "wellbeing";
      difficulty_type: "easy" | "medium" | "hard";
      node_status: "locked" | "in_progress" | "completed";
      notif_type:
        | "streak_reminder"
        | "quest_suggestion"
        | "level_up"
        | "challenge_complete"
        | "wellbeing_warning";
      time_horizon: "short" | "mid" | "long";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      branch_type: ["career", "finance", "softskills", "wellbeing"],
      difficulty_type: ["easy", "medium", "hard"],
      node_status: ["locked", "in_progress", "completed"],
      notif_type: [
        "streak_reminder",
        "quest_suggestion",
        "level_up",
        "challenge_complete",
        "wellbeing_warning",
      ],
      time_horizon: ["short", "mid", "long"],
    },
  },
} as const;
