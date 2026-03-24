import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { questService } from "../api/services/questService";
import { userService } from "../api/services/userService";
import { useQuestStore } from "../stores/questStore";
import { useUserStore } from "../stores/userStore";
import type { Branch, Quest } from "../types";
import { useGrowthStreak } from "./useGrowthStreak";
import { useStaminaSystem } from "./useStaminaSystem";
import { useXPEngine } from "./useXPEngine";

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
  const { user, incrementDailyQuestCount, isAuthenticated, sessionReady } =
    useUserStore();
  const { addXP } = useXPEngine();
  const { xpMultiplier, canComplete, onQuestComplete } = useStaminaSystem();
  const { recordActivity } = useGrowthStreak();

  // Determine primary branch and stamina
  const primaryBranch = user?.primary_branch ?? "career";
  const stamina = user?.stamina ?? 100;

  // Only fetch when authenticated and session ready
  const canFetch = isAuthenticated && sessionReady;
  const hasAssigned = useRef(false);
  const [assignmentDone, setAssignmentDone] = useState(false);

  // Assign daily quests on first load (runs once per session)
  useEffect(() => {
    if (canFetch && !hasAssigned.current) {
      hasAssigned.current = true;
      questService.assignDaily()
        .then(() => setAssignmentDone(true))
        .catch((err) => {
          if (__DEV__) console.warn("[assignDaily]", err);
          hasAssigned.current = false;
          setAssignmentDone(true); // fetch anyway
        });
    }
  }, [canFetch]);

  // Fetch quests from API via service (only after assignment is done)
  const { data: fetchedQuests, isLoading } = useQuery({
    queryKey: ["quests", "daily", primaryBranch, stamina],
    queryFn: () => questService.getDaily(primaryBranch, stamina),
    enabled: canFetch && assignmentDone,
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

      // Update streak on first activity of the day
      const today = new Date().toISOString().split("T")[0];
      const currentUser = useUserStore.getState().user;
      if (currentUser && currentUser.last_active_date !== today) {
        const yesterday = new Date(Date.now() - 86400000)
          .toISOString()
          .split("T")[0];
        const wasYesterday = currentUser.last_active_date === yesterday;
        const newStreak = wasYesterday ? currentUser.streak + 1 : 1;
        const bestStreak = Math.max(currentUser.best_streak, newStreak);

        // Update local store
        useUserStore.setState({
          user: {
            ...currentUser,
            streak: newStreak,
            best_streak: bestStreak,
            last_active_date: today,
          },
        });
      }

      // Persist quest completion to Supabase (fire-and-forget)
      questService
        .complete(questId, xpEarned)
        .catch((err) => {
          if (__DEV__) console.warn("[questService.complete]", err);
        });

      // Persist streak to Supabase (XP is handled by DB trigger on xp_history)
      const updatedUser = useUserStore.getState().user;
      if (updatedUser) {
        userService
          .update({
            streak: updatedUser.streak,
            best_streak: updatedUser.best_streak,
            last_active_date: updatedUser.last_active_date,
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
