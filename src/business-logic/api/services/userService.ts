import type { UserProgress } from "../../types";
import { supabase } from "../supabase";

async function getAuthUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export const userService = {
  async getMe(): Promise<UserProgress | null> {
    const userId = await getAuthUserId();
    if (!userId) return null;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error || !data) return null;
    return {
      user_id: data.id,
      name: data.name,
      avatar_url: data.avatar_url,
      level: data.level,
      total_xp: data.total_xp,
      current_xp_in_level: data.current_xp_in_level,
      xp_to_next_level: data.xp_to_next_level,
      streak: data.streak,
      best_streak: data.best_streak,
      stamina: data.stamina,
      last_active_date: data.last_active_date,
      last_login_at: data.last_active_date,
      onboarding_done: data.onboarding_done,
      primary_branch: data.primary_branch,
    };
  },

  async update(patch: Partial<UserProgress>): Promise<UserProgress | null> {
    const userId = await getAuthUserId();
    if (!userId) return null;
    const dbPatch: Record<string, unknown> = {};
    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.avatar_url !== undefined) dbPatch.avatar_url = patch.avatar_url;
    if (patch.level !== undefined) dbPatch.level = patch.level;
    if (patch.total_xp !== undefined) dbPatch.total_xp = patch.total_xp;
    if (patch.current_xp_in_level !== undefined)
      dbPatch.current_xp_in_level = patch.current_xp_in_level;
    if (patch.xp_to_next_level !== undefined)
      dbPatch.xp_to_next_level = patch.xp_to_next_level;
    if (patch.streak !== undefined) dbPatch.streak = patch.streak;
    if (patch.best_streak !== undefined)
      dbPatch.best_streak = patch.best_streak;
    if (patch.stamina !== undefined) dbPatch.stamina = patch.stamina;
    if (patch.last_active_date !== undefined)
      dbPatch.last_active_date = patch.last_active_date;
    if (patch.onboarding_done !== undefined)
      dbPatch.onboarding_done = patch.onboarding_done;
    dbPatch.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("profiles")
      .update(dbPatch)
      .eq("id", userId)
      .select()
      .single();
    if (error || !data) return null;
    return {
      user_id: data.id,
      name: data.name,
      avatar_url: data.avatar_url,
      level: data.level,
      total_xp: data.total_xp,
      current_xp_in_level: data.current_xp_in_level,
      xp_to_next_level: data.xp_to_next_level,
      streak: data.streak,
      best_streak: data.best_streak,
      stamina: data.stamina,
      last_active_date: data.last_active_date,
      last_login_at: data.last_active_date,
      onboarding_done: data.onboarding_done,
      primary_branch: data.primary_branch,
    };
  },
};
