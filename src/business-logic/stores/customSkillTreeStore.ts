import { create } from 'zustand';
import type {
  Branch,
  CustomCluster,
  CustomGoalTree,
  CustomQuest,
  CustomSkillItem,
  Difficulty,
  QuestDuration,
} from '../types';
import { makeQuest } from '../data/skill-tree-defaults';

// ─── Store Types ────────────────────────────────────────────────────────────────
export type NodeGoalEntry = { goalId: string; goalTitle: string };

interface CustomSkillTreeStore {
  trees: CustomGoalTree[];
  currentDraft: CustomGoalTree | null;
  isGenerating: boolean;
  nodeGoalMap: Record<string, NodeGoalEntry>;

  setGenerating: (v: boolean) => void;
  setDraft: (tree: CustomGoalTree) => void;
  discardDraft: () => void;
  confirmDraft: (onConfirmed: (nodeIds: string[], goal: CustomGoalTree) => void) => void;
  initWithDemoData: (data: { trees: CustomGoalTree[]; nodeGoalMap: Record<string, NodeGoalEntry> }) => void;

  // Cluster mutations
  addCluster: (cluster: CustomCluster) => void;
  removeCluster: (clusterId: string) => void;
  updateCluster: (clusterId: string, updates: Partial<Pick<CustomCluster, 'title' | 'branch' | 'emoji' | 'tier'>>) => void;

  // Skill mutations
  addSkillToCluster: (clusterId: string, skill: CustomSkillItem) => void;
  removeSkill: (clusterId: string, skillId: string) => void;
  updateSkill: (clusterId: string, skillId: string, updates: Partial<Pick<CustomSkillItem, 'title' | 'description'>>) => void;
  moveSkillUp: (clusterId: string, skillId: string) => void;
  moveSkillDown: (clusterId: string, skillId: string) => void;

  // Quest mutations
  updateQuest: (clusterId: string, skillId: string, questId: string, updates: Partial<Pick<CustomQuest, 'title' | 'difficulty' | 'duration_min'>>) => void;
  addQuest: (clusterId: string, skillId: string) => void;
  removeQuest: (clusterId: string, skillId: string, questId: string) => void;
}

// ─── Store Implementation ────────────────────────────────────────────────────────
export const useCustomSkillTreeStore = create<CustomSkillTreeStore>((set) => ({
  trees: [],
  currentDraft: null,
  isGenerating: false,
  nodeGoalMap: {},

  setGenerating: (v) => set({ isGenerating: v }),
  setDraft: (tree) => set({ currentDraft: tree, isGenerating: false }),
  discardDraft: () => set({ currentDraft: null }),
  initWithDemoData: (data) =>
    set((state) =>
      state.trees.length === 0
        ? { trees: data.trees, nodeGoalMap: data.nodeGoalMap }
        : state
    ),

  confirmDraft: (onConfirmed) =>
    set((state) => {
      if (!state.currentDraft) return state;
      const draft = state.currentDraft;

      const newGoalMap: Record<string, NodeGoalEntry> = {};
      const nodeIds: string[] = [];
      for (const cluster of draft.clusters) {
        for (const skill of cluster.skills) {
          const nodeId = `custom_${skill.id}`;
          nodeIds.push(nodeId);
          newGoalMap[nodeId] = { goalId: draft.id, goalTitle: draft.goal };
        }
      }

      onConfirmed(nodeIds, draft);
      return {
        trees: [...state.trees, draft],
        currentDraft: null,
        nodeGoalMap: { ...state.nodeGoalMap, ...newGoalMap },
      };
    }),

  addCluster: (cluster) =>
    set((state) => {
      if (!state.currentDraft) return state;
      return { currentDraft: { ...state.currentDraft, clusters: [...state.currentDraft.clusters, cluster] } };
    }),

  removeCluster: (clusterId) =>
    set((state) => {
      if (!state.currentDraft) return state;
      return { currentDraft: { ...state.currentDraft, clusters: state.currentDraft.clusters.filter((c) => c.id !== clusterId) } };
    }),

  updateCluster: (clusterId, updates) =>
    set((state) => {
      if (!state.currentDraft) return state;
      return {
        currentDraft: {
          ...state.currentDraft,
          clusters: state.currentDraft.clusters.map((c) => c.id === clusterId ? { ...c, ...updates } : c),
        },
      };
    }),

  addSkillToCluster: (clusterId, skill) =>
    set((state) => {
      if (!state.currentDraft) return state;
      return {
        currentDraft: {
          ...state.currentDraft,
          clusters: state.currentDraft.clusters.map((c) =>
            c.id === clusterId ? { ...c, skills: [...c.skills, skill] } : c,
          ),
        },
      };
    }),

  removeSkill: (clusterId, skillId) =>
    set((state) => {
      if (!state.currentDraft) return state;
      return {
        currentDraft: {
          ...state.currentDraft,
          clusters: state.currentDraft.clusters.map((c) =>
            c.id === clusterId ? { ...c, skills: c.skills.filter((s) => s.id !== skillId) } : c,
          ),
        },
      };
    }),

  updateSkill: (clusterId, skillId, updates) =>
    set((state) => {
      if (!state.currentDraft) return state;
      return {
        currentDraft: {
          ...state.currentDraft,
          clusters: state.currentDraft.clusters.map((c) =>
            c.id === clusterId
              ? { ...c, skills: c.skills.map((s) => s.id === skillId ? { ...s, ...updates } : s) }
              : c,
          ),
        },
      };
    }),

  moveSkillUp: (clusterId, skillId) =>
    set((state) => {
      if (!state.currentDraft) return state;
      return {
        currentDraft: {
          ...state.currentDraft,
          clusters: state.currentDraft.clusters.map((c) => {
            if (c.id !== clusterId) return c;
            const idx = c.skills.findIndex((s) => s.id === skillId);
            if (idx <= 0) return c;
            const s = [...c.skills];
            [s[idx - 1], s[idx]] = [s[idx], s[idx - 1]];
            return { ...c, skills: s };
          }),
        },
      };
    }),

  moveSkillDown: (clusterId, skillId) =>
    set((state) => {
      if (!state.currentDraft) return state;
      return {
        currentDraft: {
          ...state.currentDraft,
          clusters: state.currentDraft.clusters.map((c) => {
            if (c.id !== clusterId) return c;
            const idx = c.skills.findIndex((s) => s.id === skillId);
            if (idx < 0 || idx >= c.skills.length - 1) return c;
            const s = [...c.skills];
            [s[idx], s[idx + 1]] = [s[idx + 1], s[idx]];
            return { ...c, skills: s };
          }),
        },
      };
    }),

  updateQuest: (clusterId, skillId, questId, updates) =>
    set((state) => {
      if (!state.currentDraft) return state;
      return {
        currentDraft: {
          ...state.currentDraft,
          clusters: state.currentDraft.clusters.map((c) =>
            c.id === clusterId
              ? {
                  ...c,
                  skills: c.skills.map((s) =>
                    s.id === skillId
                      ? { ...s, quests: s.quests.map((q) => q.id === questId ? { ...q, ...updates } : q) }
                      : s,
                  ),
                }
              : c,
          ),
        },
      };
    }),

  addQuest: (clusterId, skillId) =>
    set((state) => {
      if (!state.currentDraft) return state;
      return {
        currentDraft: {
          ...state.currentDraft,
          clusters: state.currentDraft.clusters.map((c) =>
            c.id === clusterId
              ? {
                  ...c,
                  skills: c.skills.map((s) =>
                    s.id === skillId
                      ? { ...s, quests: [...s.quests, makeQuest('Nhiệm vụ mới', 'easy', 15)] }
                      : s,
                  ),
                }
              : c,
          ),
        },
      };
    }),

  removeQuest: (clusterId, skillId, questId) =>
    set((state) => {
      if (!state.currentDraft) return state;
      return {
        currentDraft: {
          ...state.currentDraft,
          clusters: state.currentDraft.clusters.map((c) =>
            c.id === clusterId
              ? {
                  ...c,
                  skills: c.skills.map((s) =>
                    s.id === skillId
                      ? { ...s, quests: s.quests.filter((q) => q.id !== questId) }
                      : s,
                  ),
                }
              : c,
          ),
        },
      };
    }),
}));
