import type { Branch, RoadmapMilestone, TimeHorizon } from "../../types";
import { supabase } from "../supabase";

async function getAuthUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Not authenticated");
  return user.id;
}

function toHorizonDate(horizon: TimeHorizon): string {
  const days = horizon === "short" ? 90 : horizon === "mid" ? 365 : 1095;
  return new Date(Date.now() + days * 86400000).toISOString().split("T")[0];
}

function toMilestone(row: {
  id: string;
  title: string;
  branch: string;
  horizon: string;
  is_completed: boolean;
  target_date: string;
  created_at: string;
}): RoadmapMilestone {
  return {
    id: row.id,
    title: row.title,
    branch: row.branch as Branch,
    horizon: row.horizon as TimeHorizon,
    isCompleted: row.is_completed,
    targetDate: row.target_date,
    createdAt: row.created_at,
  };
}

export const roadmapService = {
  async getAll(): Promise<RoadmapMilestone[]> {
    const userId = await getAuthUserId();
    const { data, error } = await supabase
      .from("roadmap_milestones")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toMilestone);
  },

  async create(
    title: string,
    branch: Branch,
    horizon: TimeHorizon,
  ): Promise<RoadmapMilestone> {
    const userId = await getAuthUserId();
    const { data, error } = await supabase
      .from("roadmap_milestones")
      .insert({
        user_id: userId,
        title,
        branch,
        horizon,
        target_date: toHorizonDate(horizon),
        is_completed: false,
      })
      .select()
      .single();
    if (error) throw error;
    return toMilestone(data);
  },

  async update(
    id: string,
    patch: Partial<RoadmapMilestone>,
  ): Promise<RoadmapMilestone> {
    const dbPatch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (patch.isCompleted !== undefined)
      dbPatch.is_completed = patch.isCompleted;
    if (patch.title !== undefined) dbPatch.title = patch.title;
    if (patch.targetDate !== undefined) dbPatch.target_date = patch.targetDate;

    const { data, error } = await supabase
      .from("roadmap_milestones")
      .update(dbPatch)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return toMilestone(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("roadmap_milestones")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};
