export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ai_providers: {
        Row: {
          api_base_url: string
          api_key_env: string
          config: Json
          created_at: string
          default_model: string
          display_name: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          api_base_url: string
          api_key_env: string
          config?: Json
          created_at?: string
          default_model: string
          display_name: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          api_base_url?: string
          api_key_env?: string
          config?: Json
          created_at?: string
          default_model?: string
          display_name?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      assessment_options: {
        Row: {
          branch: Database["public"]["Enums"]["branch_type"]
          id: string
          question_id: number
          sort_order: number
          text: string
        }
        Insert: {
          branch: Database["public"]["Enums"]["branch_type"]
          id: string
          question_id: number
          sort_order?: number
          text: string
        }
        Update: {
          branch?: Database["public"]["Enums"]["branch_type"]
          id?: string
          question_id?: number
          sort_order?: number
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "assessment_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_questions: {
        Row: {
          id: number
          question: string
          sort_order: number
        }
        Insert: {
          id?: number
          question: string
          sort_order?: number
        }
        Update: {
          id?: number
          question?: string
          sort_order?: number
        }
        Relationships: []
      }
      branches: {
        Row: {
          color: string
          emoji: string
          icon: string
          id: Database["public"]["Enums"]["branch_type"]
          label: string
          label_en: string
          sort_order: number
        }
        Insert: {
          color: string
          emoji: string
          icon: string
          id: Database["public"]["Enums"]["branch_type"]
          label: string
          label_en: string
          sort_order?: number
        }
        Update: {
          color?: string
          emoji?: string
          icon?: string
          id?: Database["public"]["Enums"]["branch_type"]
          label?: string
          label_en?: string
          sort_order?: number
        }
        Relationships: []
      }
      challenges: {
        Row: {
          branch: Database["public"]["Enums"]["branch_type"]
          created_at: string
          description: string
          duration_days: number
          id: string
          target_count: number
          title: string
        }
        Insert: {
          branch: Database["public"]["Enums"]["branch_type"]
          created_at?: string
          description?: string
          duration_days: number
          id: string
          target_count: number
          title: string
        }
        Update: {
          branch?: Database["public"]["Enums"]["branch_type"]
          created_at?: string
          description?: string
          duration_days?: number
          id?: string
          target_count?: number
          title?: string
        }
        Relationships: []
      }
      custom_goal_trees: {
        Row: {
          clusters: Json
          created_at: string
          goal: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          clusters?: Json
          created_at?: string
          goal: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          clusters?: Json
          created_at?: string
          goal?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_bonuses: {
        Row: {
          bonus_date: string
          created_at: string
          id: string
          streak_day: number
          user_id: string
          xp_earned: number
        }
        Insert: {
          bonus_date?: string
          created_at?: string
          id?: string
          streak_day?: number
          user_id: string
          xp_earned: number
        }
        Update: {
          bonus_date?: string
          created_at?: string
          id?: string
          streak_day?: number
          user_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      daily_stats: {
        Row: {
          career_finance_quests: number
          created_at: string
          date: string
          id: string
          quests_completed: number
          quests_total: number
          stamina_end: number
          stamina_start: number
          streak_day: number
          updated_at: string
          user_id: string
          wellbeing_quests: number
          xp_earned: number
        }
        Insert: {
          career_finance_quests?: number
          created_at?: string
          date: string
          id?: string
          quests_completed?: number
          quests_total?: number
          stamina_end?: number
          stamina_start?: number
          streak_day?: number
          updated_at?: string
          user_id: string
          wellbeing_quests?: number
          xp_earned?: number
        }
        Update: {
          career_finance_quests?: number
          created_at?: string
          date?: string
          id?: string
          quests_completed?: number
          quests_total?: number
          stamina_end?: number
          stamina_start?: number
          streak_day?: number
          updated_at?: string
          user_id?: string
          wellbeing_quests?: number
          xp_earned?: number
        }
        Relationships: []
      }
      generation_tracking: {
        Row: {
          completed_at: string | null
          current_step: string | null
          error_message: string | null
          id: string
          progress: number
          quests_count: number
          quests_done: boolean
          skills_count: number
          skills_done: boolean
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          current_step?: string | null
          error_message?: string | null
          id?: string
          progress?: number
          quests_count?: number
          quests_done?: boolean
          skills_count?: number
          skills_done?: boolean
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          current_step?: string | null
          error_message?: string | null
          id?: string
          progress?: number
          quests_count?: number
          quests_done?: boolean
          skills_count?: number
          skills_done?: boolean
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      master_data: {
        Row: {
          created_at: string
          data: Json
          description: string
          id: string
          is_active: boolean
          key: string
          multiple: boolean
          sort_order: number
          type: string
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          data?: Json
          description?: string
          id?: string
          is_active?: boolean
          key: string
          multiple?: boolean
          sort_order?: number
          type: string
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          data?: Json
          description?: string
          id?: string
          is_active?: boolean
          key?: string
          multiple?: boolean
          sort_order?: number
          type?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          is_read: boolean
          title: string
          type: Database["public"]["Enums"]["notif_type"]
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean
          title: string
          type: Database["public"]["Enums"]["notif_type"]
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean
          title?: string
          type?: Database["public"]["Enums"]["notif_type"]
          user_id?: string
        }
        Relationships: []
      }
      onboarding_steps: {
        Row: {
          id: number
          master_type: string | null
          multiple: boolean
          required: boolean
          sort_order: number
          step_key: string
          subtitle: string
          title: string
        }
        Insert: {
          id?: number
          master_type?: string | null
          multiple?: boolean
          required?: boolean
          sort_order?: number
          step_key: string
          subtitle: string
          title: string
        }
        Update: {
          id?: number
          master_type?: string | null
          multiple?: boolean
          required?: boolean
          sort_order?: number
          step_key?: string
          subtitle?: string
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          best_streak: number
          created_at: string
          current_xp_in_level: number
          id: string
          last_active_date: string | null
          level: number
          localization: Json
          name: string
          onboarding_done: boolean
          primary_branch: Database["public"]["Enums"]["branch_type"] | null
          shield_activated_date: string | null
          shields_remaining: number
          stamina: number
          streak: number
          total_xp: number
          updated_at: string
          xp_to_next_level: number
        }
        Insert: {
          avatar_url?: string | null
          best_streak?: number
          created_at?: string
          current_xp_in_level?: number
          id: string
          last_active_date?: string | null
          level?: number
          localization?: Json
          name?: string
          onboarding_done?: boolean
          primary_branch?: Database["public"]["Enums"]["branch_type"] | null
          shield_activated_date?: string | null
          shields_remaining?: number
          stamina?: number
          streak?: number
          total_xp?: number
          updated_at?: string
          xp_to_next_level?: number
        }
        Update: {
          avatar_url?: string | null
          best_streak?: number
          created_at?: string
          current_xp_in_level?: number
          id?: string
          last_active_date?: string | null
          level?: number
          localization?: Json
          name?: string
          onboarding_done?: boolean
          primary_branch?: Database["public"]["Enums"]["branch_type"] | null
          shield_activated_date?: string | null
          shields_remaining?: number
          stamina?: number
          streak?: number
          total_xp?: number
          updated_at?: string
          xp_to_next_level?: number
        }
        Relationships: []
      }
      prompt_executions: {
        Row: {
          ai_response: string | null
          duration_ms: number | null
          edge_function: string
          error_message: string | null
          executed_at: string
          filled_prompt: string
          id: string
          model: string | null
          parsed_data: Json | null
          prompt_name: string
          prompt_version: number
          provider: string | null
          success: boolean
          tokens_used: number | null
          user_id: string | null
          variables: Json
        }
        Insert: {
          ai_response?: string | null
          duration_ms?: number | null
          edge_function: string
          error_message?: string | null
          executed_at?: string
          filled_prompt: string
          id?: string
          model?: string | null
          parsed_data?: Json | null
          prompt_name: string
          prompt_version?: number
          provider?: string | null
          success?: boolean
          tokens_used?: number | null
          user_id?: string | null
          variables?: Json
        }
        Update: {
          ai_response?: string | null
          duration_ms?: number | null
          edge_function?: string
          error_message?: string | null
          executed_at?: string
          filled_prompt?: string
          id?: string
          model?: string | null
          parsed_data?: Json | null
          prompt_name?: string
          prompt_version?: number
          provider?: string | null
          success?: boolean
          tokens_used?: number | null
          user_id?: string | null
          variables?: Json
        }
        Relationships: []
      }
      quests: {
        Row: {
          branch: Database["public"]["Enums"]["branch_type"]
          created_at: string
          description: string
          difficulty: Database["public"]["Enums"]["difficulty_type"]
          duration_min: number
          node_id: string | null
          quest_id: string
          title: string
          xp_reward: number
        }
        Insert: {
          branch: Database["public"]["Enums"]["branch_type"]
          created_at?: string
          description?: string
          difficulty: Database["public"]["Enums"]["difficulty_type"]
          duration_min: number
          node_id?: string | null
          quest_id: string
          title: string
          xp_reward: number
        }
        Update: {
          branch?: Database["public"]["Enums"]["branch_type"]
          created_at?: string
          description?: string
          difficulty?: Database["public"]["Enums"]["difficulty_type"]
          duration_min?: number
          node_id?: string | null
          quest_id?: string
          title?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "quests_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "skill_nodes"
            referencedColumns: ["node_id"]
          },
        ]
      }
      roadmap_milestones: {
        Row: {
          branch: Database["public"]["Enums"]["branch_type"]
          created_at: string
          horizon: Database["public"]["Enums"]["time_horizon"]
          id: string
          is_completed: boolean
          target_date: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          branch: Database["public"]["Enums"]["branch_type"]
          created_at?: string
          horizon: Database["public"]["Enums"]["time_horizon"]
          id?: string
          is_completed?: boolean
          target_date: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          branch?: Database["public"]["Enums"]["branch_type"]
          created_at?: string
          horizon?: Database["public"]["Enums"]["time_horizon"]
          id?: string
          is_completed?: boolean
          target_date?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      skill_node_dependencies: {
        Row: {
          node_id: string
          requires_node: string
        }
        Insert: {
          node_id: string
          requires_node: string
        }
        Update: {
          node_id?: string
          requires_node?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_node_dependencies_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "skill_nodes"
            referencedColumns: ["node_id"]
          },
          {
            foreignKeyName: "skill_node_dependencies_requires_node_fkey"
            columns: ["requires_node"]
            isOneToOne: false
            referencedRelation: "skill_nodes"
            referencedColumns: ["node_id"]
          },
        ]
      }
      skill_nodes: {
        Row: {
          branch: Database["public"]["Enums"]["branch_type"]
          created_at: string
          description: string
          node_id: string
          quests_total: number
          sort_order: number
          tier: number
          tier_order: number
          title: string
          xp_required: number
        }
        Insert: {
          branch: Database["public"]["Enums"]["branch_type"]
          created_at?: string
          description?: string
          node_id: string
          quests_total?: number
          sort_order?: number
          tier: number
          tier_order?: number
          title: string
          xp_required?: number
        }
        Update: {
          branch?: Database["public"]["Enums"]["branch_type"]
          created_at?: string
          description?: string
          node_id?: string
          quests_total?: number
          sort_order?: number
          tier?: number
          tier_order?: number
          title?: string
          xp_required?: number
        }
        Relationships: []
      }
      stamina_history: {
        Row: {
          amount: number
          created_at: string
          id: string
          source: string
          stamina_after: number
          stamina_before: number
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          source: string
          stamina_after: number
          stamina_before: number
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          source?: string
          stamina_after?: number
          stamina_before?: number
          user_id?: string
        }
        Relationships: []
      }
      streak_history: {
        Row: {
          created_at: string
          date: string
          id: string
          quests_completed: number
          shield_used: boolean
          streak_day: number
          user_id: string
          xp_earned: number
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          quests_completed?: number
          shield_used?: boolean
          streak_day: number
          user_id: string
          xp_earned?: number
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          quests_completed?: number
          shield_used?: boolean
          streak_day?: number
          user_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      system_prompts: {
        Row: {
          created_at: string
          description: string
          id: string
          is_active: boolean
          model: string | null
          name: string
          prompt: string
          provider_id: string | null
          updated_at: string
          variables: Json
          version: number
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          model?: string | null
          name: string
          prompt: string
          provider_id?: string | null
          updated_at?: string
          variables?: Json
          version?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          model?: string | null
          name?: string
          prompt?: string
          provider_id?: string | null
          updated_at?: string
          variables?: Json
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "system_prompts_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "ai_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_challenges: {
        Row: {
          challenge_id: string
          completed_at: string | null
          ends_at: string
          id: string
          joined_at: string
          progress: number
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          ends_at: string
          id?: string
          joined_at?: string
          progress?: number
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          ends_at?: string
          id?: string
          joined_at?: string
          progress?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_onboardings: {
        Row: {
          answers: Json
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_quests: {
        Row: {
          completed_at: string | null
          date: string
          id: string
          quest_id: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          completed_at?: string | null
          date?: string
          id?: string
          quest_id: string
          user_id: string
          xp_earned: number
        }
        Update: {
          completed_at?: string | null
          date?: string
          id?: string
          quest_id?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_quests_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["quest_id"]
          },
        ]
      }
      user_skill_nodes: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          node_id: string
          quests_completed: number
          status: Database["public"]["Enums"]["node_status"]
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          node_id: string
          quests_completed?: number
          status?: Database["public"]["Enums"]["node_status"]
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          node_id?: string
          quests_completed?: number
          status?: Database["public"]["Enums"]["node_status"]
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_skill_nodes_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "skill_nodes"
            referencedColumns: ["node_id"]
          },
        ]
      }
      xp_history: {
        Row: {
          amount: number
          created_at: string
          id: string
          multiplier: number
          source: string
          source_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          multiplier?: number
          source: string
          source_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          multiplier?: number
          source?: string
          source_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_unlock_node: {
        Args: { p_node_id: string; p_user_id: string }
        Returns: boolean
      }
      empty_user_data: { Args: { p_user_id: string }; Returns: undefined }
      generate_tier_dependencies: { Args: never; Returns: undefined }
      get_locked_quests: {
        Args: { p_user_id: string }
        Returns: {
          branch: string
          node_id: string
          node_tier: number
          node_title: string
          quest_id: string
          title: string
        }[]
      }
      get_unlocked_nodes: {
        Args: { p_user_id: string }
        Returns: {
          branch: string
          description: string
          is_locked: boolean
          node_id: string
          quests_completed: number
          quests_total: number
          status: string
          tier: number
          title: string
          xp_required: number
        }[]
      }
      is_node_unlocked: {
        Args: { p_node_id: string; p_user_id: string }
        Returns: boolean
      }
      onboarding_detail_data: {
        Args: { p_user_id: string }
        Returns: {
          description: string
          key: string
          label: string
          step_key: string
          type: string
        }[]
      }
      recalc_user_xp: { Args: { p_user_id: string }; Returns: undefined }
    }
    Enums: {
      branch_type: "career" | "finance" | "softskills" | "wellbeing"
      difficulty_type: "easy" | "medium" | "hard"
      generation_status: "pending" | "generating" | "completed" | "failed"
      node_status: "locked" | "in_progress" | "completed" | "todo"
      notif_type:
        | "streak_reminder"
        | "quest_suggestion"
        | "level_up"
        | "challenge_complete"
        | "wellbeing_warning"
      time_horizon: "short" | "mid" | "long"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      branch_type: ["career", "finance", "softskills", "wellbeing"],
      difficulty_type: ["easy", "medium", "hard"],
      generation_status: ["pending", "generating", "completed", "failed"],
      node_status: ["locked", "in_progress", "completed", "todo"],
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
} as const
