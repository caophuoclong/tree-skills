import type { SkillNode } from "../../types";
import { supabase } from "../supabase";

// Cast for RPC and new tables

const db = supabase;

async function getAuthUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export const skillTreeService = {
  /**
   * Get user's personalized skill nodes with lock status
   * Fetches all nodes for user's branch and checks dependencies
   */
  async getNodes(): Promise<SkillNode[]> {
    const userId = await getAuthUserId();
    if (!userId) return [];

    // Use the database function to get unlocked nodes
    const { data, error } = await db.rpc("get_unlocked_nodes", {
      p_user_id: userId,
    });

    if (error) {
      console.error("Error fetching unlocked nodes:", error);
      // Fallback: fetch nodes manually
      return await this.getNodesManually(userId);
    }

    return (data ?? []).map((row: any) => ({
      node_id: row.node_id,
      branch: row.branch,
      tier: row.tier as SkillNode["tier"],
      title: row.title,
      description: row.description,
      xp_required: row.xp_required,
      quests_total: row.quests_total,
      status: row.status,
      quests_completed: row.quests_completed,
      isLocked: row.is_locked,
      tier_order: row.tier_order ?? 0,
    }));
  },

  /**
   * Fallback: Fetch nodes manually if RPC fails
   */
  async getNodesManually(userId: string): Promise<SkillNode[]> {
    // Fetch all skill nodes
    const { data: allNodes } = await supabase
      .from("skill_nodes")
      .select("*")
      .order("tier", { ascending: true })
      .order("tier_order", { ascending: true });

    // Fetch user's progress
    const { data: userNodes } = await supabase
      .from("user_skill_nodes")
      .select("*")
      .eq("user_id", userId);

    const userNodeMap = new Map(
      (userNodes ?? []).map((un: any) => [un.node_id, un]),
    );

    // Fetch dependencies
    const { data: deps } = await db.from("skill_node_dependencies").select("*");

    const depsMap = new Map<string, string[]>();
    for (const dep of deps ?? []) {
      if (!depsMap.has(dep.node_id)) {
        depsMap.set(dep.node_id, []);
      }
      depsMap.get(dep.node_id)!.push(dep.requires_node);
    }

    // Check completed nodes
    const completedNodes = new Set(
      (userNodes ?? [])
        .filter((un: any) => un.status === "completed")
        .map((un: any) => un.node_id),
    );

    // Determine isLocked for each node
    return (allNodes ?? []).map((node: any) => {
      const userNode = userNodeMap.get(node.node_id);
      const requiredDeps = depsMap.get(node.node_id) ?? [];
      const isLocked = requiredDeps.some((depId) => !completedNodes.has(depId));

      return {
        node_id: node.node_id,
        branch: node.branch,
        tier: node.tier as SkillNode["tier"],
        title: node.title,
        description: node.description,
        xp_required: node.xp_required,
        quests_total: node.quests_total,
        status: userNode?.status ?? "locked",
        quests_completed: userNode?.quests_completed ?? 0,
        isLocked,
        tier_order: node.tier_order ?? 0,
      };
    });
  },

  /**
   * Check if a node can be unlocked
   */
  async canUnlock(nodeId: string): Promise<boolean> {
    const userId = await getAuthUserId();
    if (!userId) return false;

    const { data, error } = await db.rpc("can_unlock_node", {
      p_user_id: userId,
      p_node_id: nodeId,
    });

    return !error && data === true;
  },

  /**
   * Get locked quests for user (from locked nodes)
   */
  async getLockedQuests(): Promise<
    {
      quest_id: string;
      title: string;
      branch: string;
      node_id: string;
      node_title: string;
      node_tier: number;
    }[]
  > {
    const userId = await getAuthUserId();
    if (!userId) return [];

    const { data, error } = await db.rpc("get_locked_quests", {
      p_user_id: userId,
    });

    if (error) return [];
    return data ?? [];
  },

  /**
   * Update node status
   */
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
