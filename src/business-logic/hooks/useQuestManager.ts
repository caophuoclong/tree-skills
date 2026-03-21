import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { questService } from "../api/services/questService";
import { userService } from "../api/services/userService";
import { useQuestStore } from "../stores/questStore";
import { useUserStore } from "../stores/userStore";
import type { Branch, Quest } from "../types";
import { useGrowthStreak } from "./useGrowthStreak";
import { useStaminaSystem } from "./useStaminaSystem";
import { useXPEngine } from "./useXPEngine";
import { queryClient } from "../api/query-client";

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

export interface QuestManagerResult {
  quests: Quest[];
  completedCount: number;
  totalCount: number;
  isLoading: boolean;
  completeQuest: (
    questId: string,
  ) => { reward: any | null; bonusXP: number; multiplier: number } | undefined;
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
  const { user, incrementDailyQuestCount, isAuthenticated, sessionReady } = useUserStore();
  const { addXP } = useXPEngine();
  const { xpMultiplier, canComplete, onQuestComplete } = useStaminaSystem();
  const { recordActivity } = useGrowthStreak();

  // Determine primary branch and stamina
  const primaryBranch = user?.primary_branch ?? "career";
  const stamina = user?.stamina ?? 100;

  // Only fetch when authenticated and session ready
  const canFetch = isAuthenticated && sessionReady;

  // Fetch quests from API via service
  const { data: fetchedQuests, isLoading } = useQuery({
    queryKey: ["quests", "daily", primaryBranch, stamina],
    queryFn: () => questService.getDaily(primaryBranch, stamina),
    enabled: canFetch,
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

      // Persist quest completion to Supabase (fire-and-forget)
      questService.complete(questId, xpEarned).then(() => {
        // After DB write completes, invalidate queries so home screen data refreshes
        queryClient.invalidateQueries({ queryKey: ["skill-tree"] });
        queryClient.invalidateQueries({ queryKey: ["quests"] });
      }).catch((err) => {
        if (__DEV__) console.warn("[questService.complete]", err);
      });

      // Persist updated profile XP/level to Supabase
      const updatedUser = useUserStore.getState().user;
      if (updatedUser) {
        userService
          .update({
            total_xp: updatedUser.total_xp,
            level: updatedUser.level,
            current_xp_in_level: updatedUser.current_xp_in_level,
            xp_to_next_level: updatedUser.xp_to_next_level,
            last_active_date: new Date().toISOString().split("T")[0],
          })
          .catch((err) => {
            if (__DEV__) console.warn("[userService.update]", err);
          });
      }

      return result;
    },
    [
      dailyQuests,
      canComplete,
      xpMultiplier,
      addXP,
      onQuestComplete,
      recordActivity,
      storeComplete,
      incrementDailyQuestCount,
    ],
  );

  const completedCount = dailyQuests.filter(
    (q) => q.completed_at !== null,
  ).length;

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
