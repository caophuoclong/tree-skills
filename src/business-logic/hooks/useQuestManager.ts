import { useCallback, useEffect } from 'react';
import { useQuestStore } from '../stores/questStore';
import { useUserStore } from '../stores/userStore';
import { getDailyQuestPool } from '../data/quest-library';
import { useXPEngine } from './useXPEngine';
import { useStaminaSystem } from './useStaminaSystem';
import { useGrowthStreak } from './useGrowthStreak';
import type { Quest, Branch } from '../types';

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export interface QuestManagerResult {
  quests: Quest[];
  completedCount: number;
  totalCount: number;
  isLoading: boolean;
  completeQuest: (questId: string) => { reward: any | null; bonusXP: number; multiplier: number } | undefined;
  resetQuests: () => void;
  canCompleteQuest: (branch: Branch) => boolean;
}

export function useQuestManager(): QuestManagerResult {
  const {
    dailyQuests,
    lastResetDate,
    setDailyQuests,
    completeQuest: storeComplete,
    resetQuests,
  } = useQuestStore();
  const { user, incrementDailyQuestCount } = useUserStore();
  const { addXP } = useXPEngine();
  const { xpMultiplier, canComplete, onQuestComplete } = useStaminaSystem();
  const { recordActivity } = useGrowthStreak();

  // Load or refresh quests at start of each day
  useEffect(() => {
    const today = getTodayString();
    if (lastResetDate !== today || dailyQuests.length === 0) {
      // Use user's branch if available, fall back to 'career' for demo/guests
      const primaryBranch = user
        ? ((user as unknown as { primaryBranch?: Branch }).primaryBranch ?? 'career')
        : 'career';
      const stamina = user?.stamina ?? 100;
      const pool = getDailyQuestPool(primaryBranch, stamina);
      setDailyQuests(pool);
    }
  }, [user, dailyQuests.length, lastResetDate, setDailyQuests]);

  const completeQuest = useCallback(
    (questId: string) => {
      const quest = dailyQuests.find((q) => q.quest_id === questId);
      if (!quest || quest.completed_at) return;
      if (!canComplete(quest.branch)) return;

      const xpEarned = Math.floor(quest.xp_reward * xpMultiplier);
      incrementDailyQuestCount(quest.branch);
      const result = addXP(xpEarned);
      
      onQuestComplete(quest.branch);
      recordActivity();
      storeComplete(questId);

      // We could return result here if we want the UI to show a toast
      return result;
    },
    [dailyQuests, canComplete, xpMultiplier, addXP, onQuestComplete, recordActivity, storeComplete, incrementDailyQuestCount],
  );

  const completedCount = dailyQuests.filter((q) => q.completed_at !== null).length;

  return {
    quests: dailyQuests,
    completedCount,
    totalCount: dailyQuests.length,
    isLoading: dailyQuests.length === 0 && !lastResetDate,
    completeQuest,
    resetQuests,
    canCompleteQuest: canComplete,
  };
}
