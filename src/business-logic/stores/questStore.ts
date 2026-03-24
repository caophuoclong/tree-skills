import { create } from 'zustand';
import type { Quest } from '../types';

interface QuestStore {
  dailyQuests: Quest[];
  lastResetDate: string | null;
  setDailyQuests: (quests: Quest[]) => void;
  completeQuest: (questId: string) => void;
  resetQuests: () => void;
  addQuestToDaily: (quest: Quest) => void;
  removeQuestFromDaily: (questId: string) => void;
}

export const useQuestStore = create<QuestStore>((set) => ({
  dailyQuests: [],
  lastResetDate: null,

  setDailyQuests: (quests) =>
    set((state) => ({
      // Merge server data with local state — preserve local completed_at so a
      // background refetch (stamina key change) cannot un-complete a quest that
      // was already marked done locally.
      dailyQuests: quests.map((serverQuest) => {
        const local = state.dailyQuests.find(
          (q) => q.quest_id === serverQuest.quest_id,
        );
        return {
          ...serverQuest,
          completed_at: local?.completed_at ?? serverQuest.completed_at,
        };
      }),
      lastResetDate: new Date().toISOString().split('T')[0],
    })),

  completeQuest: (questId) =>
    set((state) => ({
      dailyQuests: state.dailyQuests.map((q) =>
        q.quest_id === questId ? { ...q, completed_at: new Date().toISOString() } : q
      ),
    })),

  resetQuests: () => set({ dailyQuests: [], lastResetDate: null }),

  addQuestToDaily: (quest) =>
    set((state) => {
      const alreadyIn = state.dailyQuests.some((q) => q.quest_id === quest.quest_id);
      if (alreadyIn) return state;
      return { dailyQuests: [...state.dailyQuests, quest] };
    }),

  removeQuestFromDaily: (questId) =>
    set((state) => ({
      dailyQuests: state.dailyQuests.filter(
        (q) => !(q.quest_id === questId && q.completed_at === null),
      ),
    })),
}));
