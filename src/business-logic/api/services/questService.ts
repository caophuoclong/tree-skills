import type { Branch, Quest } from "../../types";
import { supabase } from "../supabase";

// Cast for tables not in generated types

const db = supabase as any;

async function getAuthUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** Number of daily quests offered, scaled by stamina */
function dailyLimit(stamina: number): number {
  if (stamina >= 80) return 5;
  if (stamina >= 50) return 4;
  return 3;
}

export const questService = {
  /**
   * Get a single quest by ID from the server
   */
  async getById(questId: string): Promise<Quest | null> {
    const userId = await getAuthUserId();
    if (!userId) return null;

    // Fetch quest details
    const { data: questData, error: questError } = await supabase
      .from("quests")
      .select("quest_id, title, description, branch, difficulty, duration_min, xp_reward, node_id")
      .eq("quest_id", questId)
      .single();

    if (questError || !questData) return null;

    // Fetch completion status
    const { data: userQuest } = await supabase
      .from("user_quests")
      .select("completed_at")
      .eq("user_id", userId)
      .eq("quest_id", questId)
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle();

    return {
      quest_id: questData.quest_id,
      title: questData.title,
      description: questData.description,
      branch: questData.branch as Quest["branch"],
      difficulty: questData.difficulty as Quest["difficulty"],
      duration_min: questData.duration_min as Quest["duration_min"],
      xp_reward: questData.xp_reward as Quest["xp_reward"],
      completed_at: userQuest?.completed_at ?? null,
      node_id: questData.node_id ?? undefined,
    };
  },

  /**
   * Get user's personalized daily quests
   * Only fetches quests from unlocked skill nodes
   */
  async getDaily(branch: Branch, stamina: number): Promise<Quest[]> {
    const userId = await getAuthUserId();
    if (!userId) return [];

    // Fetch user's assigned quests with quest details
    const { data, error } = await supabase
      .from("user_quests")
      .select(
        `
        quest_id,
        completed_at,
        date,
        quests (
          quest_id,
          title,
          description,
          branch,
          difficulty,
          duration_min,
          xp_reward,
          node_id
        )
      `,
      )
      .eq("user_id", userId)
      .eq("assigned", true);

    if (error) {
      console.error("Error fetching user quests:", error);
      return [];
    }

    return (data ?? []).map((row: any) => ({
      quest_id: row.quest_id,
      title: row.quests.title,
      description: row.quests.description,
      branch: row.quests.branch,
      difficulty: row.quests.difficulty,
      duration_min: row.quests.duration_min as Quest["duration_min"],
      xp_reward: row.quests.xp_reward as Quest["xp_reward"],
      completed_at: row.completed_at,
      node_id: row.quests.node_id,
    }));
  },

  /**
   * Mark a quest as completed
   * The database trigger will automatically update skill node progress
   */
  async complete(questId: string, xpEarned: number): Promise<void> {
    const userId = await getAuthUserId();
    if (!userId) return;

    // Get current stamina before
    const { data: profile } = await supabase
      .from("profiles")
      .select("stamina")
      .eq("id", userId)
      .single();

    const staminaBefore = profile?.stamina ?? 100;

    // Get quest details for stamina calculation
    const { data: quest } = await supabase
      .from("quests")
      .select("branch, difficulty")
      .eq("quest_id", questId)
      .single();

    // Calculate stamina change
    let staminaChange = 0;
    if (quest) {
      if (quest.branch === "wellbeing") {
        staminaChange = 15; // Wellbeing restores stamina
      } else if (quest.branch === "career" || quest.branch === "finance") {
        staminaChange =
          quest.difficulty === "hard"
            ? -10
            : quest.difficulty === "medium"
              ? -7
              : -5;
      }
    }

    const staminaAfter = Math.max(
      0,
      Math.min(100, staminaBefore + staminaChange),
    );

    // Debug: check current row state before update
    const { data: existingRow } = await supabase
      .from("user_quests")
      .select("*")
      .eq("user_id", userId)
      .eq("quest_id", questId)
      .maybeSingle();
    console.log(
      "[questService.complete] Existing row:",
      JSON.stringify(existingRow, null, 2),
    );
    console.log("[questService.complete] Update params:", {
      userId,
      questId,
      xpEarned,
      completed_at_filter: "IS NULL",
      userId_type: typeof userId,
    });

    // Update quest completion
    const { data: updated, error } = await supabase
      .from("user_quests")
      .update({
        completed_at: new Date().toISOString(),
        xp_earned: xpEarned,
      })
      .eq("user_id", userId)
      .eq("quest_id", questId)
      .is("completed_at", null)
      .select();

    if (error) {
      console.error("Error completing quest:", error);
      throw error;
    }

    if (!updated || updated.length === 0) {
      throw new Error("Quest not found or already completed");
    }

    // Record XP history
    await db.from("xp_history").insert({
      user_id: userId,
      amount: xpEarned,
      source: "quest",
      source_id: questId,
      multiplier: 1.0,
    });

    // Record stamina history
    await db.from("stamina_history").insert({
      user_id: userId,
      amount: staminaChange,
      source: quest?.branch === "wellbeing" ? "wellbeing" : "quest_complete",
      stamina_before: staminaBefore,
      stamina_after: staminaAfter,
    });

    // Update user stamina
    await supabase
      .from("profiles")
      .update({ stamina: staminaAfter })
      .eq("id", userId);

    // Update daily stats
    const { data: existingStats } = await db
      .from("daily_stats")
      .select(
        "id, quests_completed, xp_earned, wellbeing_quests, career_finance_quests",
      )
      .eq("user_id", userId)
      .eq("date", new Date().toISOString().split("T")[0])
      .single();

    if (existingStats) {
      await db
        .from("daily_stats")
        .update({
          quests_completed: (existingStats.quests_completed || 0) + 1,
          xp_earned: (existingStats.xp_earned || 0) + xpEarned,
          wellbeing_quests:
            (existingStats.wellbeing_quests || 0) +
            (quest?.branch === "wellbeing" ? 1 : 0),
          career_finance_quests:
            (existingStats.career_finance_quests || 0) +
            (quest?.branch === "career" || quest?.branch === "finance" ? 1 : 0),
          stamina_end: staminaAfter,
        })
        .eq("id", existingStats.id);
    } else {
      await db.from("daily_stats").insert({
        user_id: userId,
        date: new Date().toISOString().split("T")[0],
        quests_completed: 1,
        xp_earned: xpEarned,
        wellbeing_quests: quest?.branch === "wellbeing" ? 1 : 0,
        career_finance_quests:
          quest?.branch === "career" || quest?.branch === "finance" ? 1 : 0,
        stamina_start: staminaBefore,
        stamina_end: staminaAfter,
      });
    }

    // Note: Skill node progress is updated by the database trigger
    // The trigger `on_quest_complete` automatically updates user_skill_nodes
  },

  /**
   * Get all quests for a specific skill node
   * Returns all quests from the node, regardless of user_quests status
   */
  async getQuestsForNode(nodeId: string): Promise<Quest[]> {
    const userId = await getAuthUserId();
    if (!userId) return [];

    // Get all quests for this node
    const { data: nodeQuests, error } = await supabase
      .from("quests")
      .select(
        `
        quest_id,
        title,
        description,
        branch,
        difficulty,
        duration_min,
        xp_reward,
        node_id
      `,
      )
      .eq("node_id", nodeId);

    if (error || !nodeQuests) return [];

    // Get user's completion status for these quests
    const questIds = nodeQuests.map((q: any) => q.quest_id);
    const { data: userQuests } = await supabase
      .from("user_quests")
      .select("quest_id, completed_at")
      .eq("user_id", userId)
      .in("quest_id", questIds);

    const completionMap = new Map(
      (userQuests ?? []).map((uq: any) => [uq.quest_id, uq.completed_at]),
    );

    return nodeQuests.map((q: any) => ({
      quest_id: q.quest_id,
      title: q.title,
      description: q.description,
      branch: q.branch,
      difficulty: q.difficulty,
      duration_min: q.duration_min as Quest["duration_min"],
      xp_reward: q.xp_reward as Quest["xp_reward"],
      completed_at: completionMap.get(q.quest_id) ?? null,
      node_id: q.node_id,
    }));
  },

  /**
   * Call DB function to assign daily quests based on master_data rules
   */
  async assignDaily(): Promise<void> {
    const userId = await getAuthUserId();
    if (!userId) return;

    await (supabase as any).rpc("assign_daily_quests", { p_user_id: userId });
  },

  /**
   * Select a quest for today by setting assigned = true
   */
  async selectForToday(questIds: string[]): Promise<void> {
    const userId = await getAuthUserId();
    if (!userId || questIds.length === 0) return;

    const today = new Date().toISOString().split("T")[0];

    // Get quest details for xp_reward
    const { data: quests } = await supabase
      .from("quests")
      .select("quest_id, xp_reward")
      .in("quest_id", questIds);

    if (!quests) return;

    const rows = quests.map((q: any) => ({
      user_id: userId,
      quest_id: q.quest_id,
      date: today,
      xp_earned: q.xp_reward,
      assigned: true,
      completed_at: null,
    }));

    await supabase.from("user_quests").upsert(rows, {
      onConflict: "user_id,quest_id",
    });
  },

  /**
   * Remove a quest from today's assigned list (set assigned = false)
   */
  async removeFromToday(questId: string): Promise<void> {
    const userId = await getAuthUserId();
    if (!userId) return;

    await (supabase as any)
      .from("user_quests")
      .update({ assigned: false })
      .eq("user_id", userId)
      .eq("quest_id", questId)
      .is("completed_at", null);
  },

  /**
   * Generate quests for a specific node via edge function
   */
  async generateForNode(nodeId: string): Promise<Quest[]> {
    const { data, error } = await supabase.functions.invoke("generate-quests", {
      body: { node_id: nodeId },
    });
    console.log("🚀 ~ error:", error);

    if (error || !data?.data?.quests) return [];

    // Return the generated quests
    return data.data.quests.map((q: any) => ({
      quest_id: q.quest_id,
      title: q.title,
      description: q.description,
      branch: q.branch,
      difficulty: q.difficulty,
      duration_min: q.duration_min as Quest["duration_min"],
      xp_reward: q.xp_reward as Quest["xp_reward"],
      completed_at: null,
      node_id: nodeId,
    }));
  },
};
