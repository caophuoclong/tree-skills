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
   * Get user's personalized daily quests
   * Only fetches quests from unlocked skill nodes
   */
  async getDaily(branch: Branch, stamina: number): Promise<Quest[]> {
    const userId = await getAuthUserId();
    if (!userId) return [];

    const today = new Date().toISOString().split("T")[0];
    const limit = dailyLimit(stamina);

    // Fetch user's quests for today with quest details
    // Only include quests from unlocked nodes
    console.log("🚀 ~ userId:", userId);
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
      // .eq("date", today)
      .limit(limit);

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
      console.error("No quest row updated — quest_id:", questId, "user_id:", userId);
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
   * Get quests for a specific skill node
   */
  async getQuestsForNode(nodeId: string): Promise<Quest[]> {
    const userId = await getAuthUserId();
    if (!userId) return [];

    const { data, error } = await supabase
      .from("user_quests")
      .select(
        `
        quest_id,
        completed_at,
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
      .eq("quests.node_id", nodeId);

    if (error) return [];

    return (data ?? []).map((row: any) => ({
      quest_id: row.quest_id,
      title: row.quests.title,
      description: row.quests.description,
      branch: row.quests.branch,
      difficulty: row.quests.difficulty,
      duration_min: row.quests.duration_min as Quest["duration_min"],
      xp_reward: row.quests.xp_reward as Quest["xp_reward"],
      completed_at: row.completed_at,
    }));
  },
};
