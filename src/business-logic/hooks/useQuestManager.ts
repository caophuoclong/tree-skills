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
  completeQuest: (questId: string) => void;
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
  const { user } = useUserStore();
  const { addXP } = useXPEngine();
  const { xpMultiplier, canComplete, onQuestComplete } = useStaminaSystem();
  const { recordActivity } = useGrowthStreak();

  // Load or refresh quests at start of each day
  useEffect(() => {
    const today = getTodayString();
    if (lastResetDate !== today || dailyQuests.length === 0) {
      if (user) {
        const primaryBranch =
          (user as unknown as { primaryBranch?: Branch }).primaryBranch ?? 'career';
        const pool = getDailyQuestPool(primaryBranch, user.stamina);
        setDailyQuests(pool);
      }
    }
  }, [user, dailyQuests.length, lastResetDate, setDailyQuests]);

  const completeQuest = useCallback(
    (questId: string) => {
      const quest = dailyQuests.find((q) => q.quest_id === questId);
      if (!quest || quest.completed_at) return;
      if (!canComplete(quest.branch)) return;

      const xpEarned = Math.floor(quest.xp_reward * xpMultiplier);
      addXP(xpEarned);
      onQuestComplete(quest.branch);
      recordActivity();
      storeComplete(questId);
    },
    [dailyQuests, canComplete, xpMultiplier, addXP, onQuestComplete, recordActivity, storeComplete],
  );

  const completedCount = dailyQuests.filter((q) => q.completed_at !== null).length;

  return {
    quests: dailyQuests,
    completedCount,
    totalCount: dailyQuests.length,
    isLoading: dailyQuests.length === 0,
    completeQuest,
    resetQuests,
    canCompleteQuest: canComplete,
  };
}
