import type { SkillNode } from "../../types";
import { supabase } from "../supabase";

async function getAuthUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export const skillTreeService = {
  /**
   * Get user's personalized skill nodes
   * Fetches from user_skill_nodes joined with skill_nodes
   */
  async getNodes(): Promise<SkillNode[]> {
    const userId = await getAuthUserId();
    if (!userId) return [];

    // Fetch user's skill nodes with skill node details
    const { data, error } = await supabase
      .from("user_skill_nodes")
      .select(`
        node_id,
        status,
        quests_completed,
        unlocked_at,
        completed_at,
        skill_nodes (
          branch,
          tier,
          title,
          description,
          xp_required,
          quests_total,
          sort_order
        )
      `)
      .eq("user_id", userId)
      .order("skill_nodes(sort_order)", { ascending: true });

    if (error) {
      console.error("Error fetching user skill nodes:", error);
      return [];
    }

    return (data ?? []).map((row: any) => ({
      node_id: row.node_id,
      branch: row.skill_nodes.branch,
      tier: row.skill_nodes.tier as SkillNode["tier"],
      title: row.skill_nodes.title,
      description: row.skill_nodes.description,
      xp_required: row.skill_nodes.xp_required,
      quests_total: row.skill_nodes.quests_total,
      status: row.status,
      quests_completed: row.quests_completed,
    }));
  },

  async updateNode(
    nodeId: string,
    patch: Partial<SkillNode>,
  ): Promise<SkillNode | null> {
    const userId = await getAuthUserId();
    if (!userId) return null;
    const dbPatch: Record<string, unknown> = {};
    if (patch.status !== undefined) dbPatch.status = patch.status;
    if (patch.quests_completed !== undefined)
      dbPatch.quests_completed = patch.quests_completed;
    if (patch.status === "completed")
      dbPatch.completed_at = new Date().toISOString();
    if (patch.status === "in_progress")
      dbPatch.unlocked_at = new Date().toISOString();

    const { error } = await supabase
      .from("user_skill_nodes")
      .upsert(
        { node_id: nodeId, user_id: userId, ...dbPatch },
        { onConflict: "user_id,node_id" },
      );
    if (error) throw error;

    // Return the updated node
    const nodes = await skillTreeService.getNodes();
    const updated = nodes.find((n) => n.node_id === nodeId);
    return updated ?? null;
  },
};
