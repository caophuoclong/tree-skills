import type { Challenge } from "../../data/challenge-library";
import { supabase } from "../supabase";

async function getAuthUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export const challengeService = {
  async getAll(): Promise<Challenge[]> {
    const userId = await getAuthUserId();

    const { data: challenges, error } = await supabase
      .from("challenges")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;

    // Fetch this user's joined challenges to derive endDate
    const userChallengesResult = userId
      ? await supabase
          .from("user_challenges")
          .select("challenge_id, ends_at, joined_at")
          .eq("user_id", userId)
      : { data: [] };
    const joinedMap = new Map(
      (
        (userChallengesResult.data ?? []) as {
          challenge_id: string;
          ends_at: string;
        }[]
      ).map((uc) => [uc.challenge_id, uc.ends_at]),
    );

    return (challenges ?? []).map((ch) => {
      const endsAt =
        joinedMap.get(ch.id) ??
        new Date(
          new Date(ch.created_at).getTime() + ch.duration_days * 86400000,
        ).toISOString();
      return {
        id: ch.id,
        title: ch.title,
        description: ch.description,
        branch: ch.branch,
        targetCount: ch.target_count,
        durationDays: ch.duration_days,
        endDate: endsAt,
      };
    });
  },
};
