import { supabase } from "../supabase";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

async function getAuthUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export const dailyBonusService = {
  /**
   * Record a daily login bonus for the user.
   * Returns true if bonus was recorded, false if already claimed today.
   */
  async recordBonus(xpEarned: number, streakDay: number): Promise<boolean> {
    const userId = await getAuthUserId();
    if (!userId) return false;

    const today = new Date().toISOString().split("T")[0];

    // Check if already claimed today
    const { data: existing } = await db
      .from("daily_bonuses")
      .select("id")
      .eq("user_id", userId)
      .eq("bonus_date", today)
      .single();

    if (existing) return false;

    // Insert new bonus record
    const { error } = await db.from("daily_bonuses").insert({
      user_id: userId,
      bonus_date: today,
      xp_earned: xpEarned,
      streak_day: streakDay,
    });

    return !error;
  },

  /**
   * Get the last bonus date for the user.
   */
  async getLastBonusDate(): Promise<string | null> {
    const userId = await getAuthUserId();
    if (!userId) return null;

    const { data } = await db
      .from("daily_bonuses")
      .select("bonus_date")
      .eq("user_id", userId)
      .order("bonus_date", { ascending: false })
      .limit(1)
      .single();

    return data?.bonus_date ?? null;
  },

  /**
   * Get all bonuses for the user.
   */
  async getAll(): Promise<
    Array<{
      id: string;
      bonus_date: string;
      xp_earned: number;
      streak_day: number;
    }>
  > {
    const userId = await getAuthUserId();
    if (!userId) return [];

    const { data, error } = await db
      .from("daily_bonuses")
      .select("*")
      .eq("user_id", userId)
      .order("bonus_date", { ascending: false });

    if (error) return [];
    return data ?? [];
  },
};
