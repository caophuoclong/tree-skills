import type { SkillNode } from "../../types";
import { supabase } from "../supabase";

async function getAuthUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Not authenticated");
  return user.id;
}

export const skillTreeService = {
  async getNodes(): Promise<SkillNode[]> {
    const userId = await getAuthUserId();

    // Fetch all skill nodes (catalogue)
    const { data: nodes, error: nodesErr } = await supabase
      .from("skill_nodes")
      .select("*")
      .order("sort_order", { ascending: true });
    if (nodesErr) throw nodesErr;

    // Fetch this user's progress for each node
    const { data: userNodes } = await supabase
      .from("user_skill_nodes")
      .select("*")
      .eq("user_id", userId);
    const userNodeMap = new Map(
      (userNodes ?? []).map((un) => [un.node_id, un]),
    );

    return (nodes ?? []).map((n) => {
      const un = userNodeMap.get(n.node_id);
      return {
        node_id: n.node_id,
        branch: n.branch,
        tier: n.tier as SkillNode["tier"],
        title: n.title,
        description: n.description,
        xp_required: n.xp_required,
        quests_total: n.quests_total,
        status: un?.status ?? "locked",
        quests_completed: un?.quests_completed ?? 0,
      };
    });
  },

  async updateNode(
    nodeId: string,
    patch: Partial<SkillNode>,
  ): Promise<SkillNode> {
    const userId = await getAuthUserId();
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

    // Return the full merged node
    const nodes = await skillTreeService.getNodes();
    const updated = nodes.find((n) => n.node_id === nodeId);
    if (!updated) throw new Error(`Node ${nodeId} not found`);
    return updated;
  },
};
