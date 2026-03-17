import { create } from 'zustand';
import type { Quest } from '../types';

interface QuestStore {
  dailyQuests: Quest[];
  lastResetDate: string | null;
  setDailyQuests: (quests: Quest[]) => void;
  completeQuest: (questId: string) => void;
  resetQuests: () => void;
}

export const useQuestStore = create<QuestStore>((set) => ({
  dailyQuests: [],
  lastResetDate: null,

  setDailyQuests: (quests) =>
    set({ dailyQuests: quests, lastResetDate: new Date().toISOString().split('T')[0] }),

  completeQuest: (questId) =>
    set((state) => ({
      dailyQuests: state.dailyQuests.map((q) =>
        q.quest_id === questId ? { ...q, completed_at: new Date().toISOString() } : q
      ),
    })),

  resetQuests: () => set({ dailyQuests: [], lastResetDate: null }),
}));
