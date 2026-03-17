import { create } from 'zustand';
import type { SkillNode, Branch } from '../types';

interface SkillTreeStore {
  nodes: SkillNode[];
  activeBranch: Branch;
  setNodes: (nodes: SkillNode[]) => void;
  setActiveBranch: (branch: Branch) => void;
  updateNodeStatus: (nodeId: string, status: SkillNode['status']) => void;
  incrementNodeQuests: (nodeId: string) => void;
}

export const useSkillTreeStore = create<SkillTreeStore>((set) => ({
  nodes: [],
  activeBranch: 'career',

  setNodes: (nodes) => set({ nodes }),

  setActiveBranch: (branch) => set({ activeBranch: branch }),

  updateNodeStatus: (nodeId, status) =>
    set((state) => ({
      nodes: state.nodes.map((n) => (n.node_id === nodeId ? { ...n, status } : n)),
    })),

  incrementNodeQuests: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.node_id === nodeId ? { ...n, quests_completed: n.quests_completed + 1 } : n
      ),
    })),
}));
