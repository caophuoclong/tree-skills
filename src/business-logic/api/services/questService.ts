import type { Branch, Quest } from "../../types";
import { supabase } from "../supabase";

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
  async getDaily(branch: Branch, stamina: number): Promise<Quest[]> {
    const userId = await getAuthUserId();
    if (!userId) return [];

    const today = new Date().toISOString().split("T")[0];
    const limit = dailyLimit(stamina);

    // Fetch quest catalog for this branch
    const { data: quests, error: qErr } = await supabase
      .from("quests")
      .select("*")
      .eq("branch", branch)
      .limit(limit * 3); // fetch extra pool so we can sample
    if (qErr) return [];

    // Fetch today's completions for this user
    const { data: completions } = await supabase
      .from("user_quests")
      .select("quest_id, completed_at")
      .eq("user_id", userId)
      .eq("date", today);
    const completedMap = new Map(
      (completions ?? []).map((c) => [c.quest_id, c.completed_at]),
    );

    // Deterministically pick `limit` quests based on today's date seed
    const dateSeed = parseInt(today.replace(/-/g, ""), 10);
    const shuffled = [...(quests ?? [])].sort(
      (a, b) =>
        ((dateSeed ^ a.quest_id.charCodeAt(0)) % 100) -
        ((dateSeed ^ b.quest_id.charCodeAt(0)) % 100),
    );

    return shuffled.slice(0, limit).map((q) => ({
      quest_id: q.quest_id,
      title: q.title,
      description: q.description,
      branch: q.branch,
      difficulty: q.difficulty,
      duration_min: q.duration_min as Quest["duration_min"],
      xp_reward: q.xp_reward as Quest["xp_reward"],
      completed_at: completedMap.get(q.quest_id) ?? null,
    }));
  },

  async complete(questId: string, xpEarned: number): Promise<void> {
    const userId = await getAuthUserId();
    if (!userId) return;
    const today = new Date().toISOString().split("T")[0];
    await supabase.from("user_quests").insert({
      quest_id: questId,
      user_id: userId,
      xp_earned: xpEarned,
      date: today,
      completed_at: new Date().toISOString(),
    });
  },
};
