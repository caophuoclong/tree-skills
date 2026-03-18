import { useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useQuestStore } from '../stores/questStore';
import { useUserStore } from '../stores/userStore';
import { questService } from '../api/services/questService';
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

  // Determine primary branch and stamina
  const primaryBranch = user
    ? ((user as unknown as { primaryBranch?: Branch }).primaryBranch ?? 'career')
    : 'career';
  const stamina = user?.stamina ?? 100;

  // Fetch quests from API via service
  const { data: fetchedQuests, isLoading } = useQuery({
    queryKey: ['quests', 'daily', primaryBranch, stamina],
    queryFn: () => questService.getDaily(primaryBranch, stamina),
    staleTime: 1000 * 60 * 5, // 5 min cache
  });

  // Load or refresh quests at start of each day
  useEffect(() => {
    const today = getTodayString();
    if (fetchedQuests && lastResetDate !== today) {
      setDailyQuests(fetchedQuests);
    }
  }, [fetchedQuests, lastResetDate, setDailyQuests]);

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
    isLoading,
    completeQuest,
    resetQuests,
    canCompleteQuest: canComplete,
  };
}
