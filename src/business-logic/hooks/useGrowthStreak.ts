import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { useUserStore } from '../stores/userStore';

export const STREAK_MILESTONES = [7, 14, 30, 60, 100] as const;
export type StreakMilestone = (typeof STREAK_MILESTONES)[number];

export interface StreakInfo {
  streak: number;
  bestStreak: number;
  isMilestone: boolean;
  milestoneReached: StreakMilestone | null;
  recordActivity: () => void;
  getStreakLabel: () => string;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getMilestoneReached(newStreak: number, prevStreak: number): StreakMilestone | null {
  for (const milestone of STREAK_MILESTONES) {
    if (newStreak >= milestone && prevStreak < milestone) {
      return milestone;
    }
  }
  return null;
}

export function useGrowthStreak(): StreakInfo {
  const { user, updateStreak } = useUserStore();

  const streak = user?.streak ?? 0;
  const bestStreak = user?.best_streak ?? 0;
  const lastActive = user?.last_active_date ?? null;

  const milestoneReached = getMilestoneReached(streak, streak - 1);
  const isMilestone = STREAK_MILESTONES.includes(streak as StreakMilestone);

  const recordActivity = useCallback(() => {
    // Read fresh data from store (avoid stale closures)
    const currentUser = useUserStore.getState().user;
    if (!currentUser) return;

    const today = formatDate(new Date());
    const yesterday = formatDate(new Date(Date.now() - 86400000));
    const currentStreak = currentUser.streak;
    const currentLastActive = currentUser.last_active_date;

    // Only skip if we already have a streak for today
    if (currentLastActive === today && currentStreak > 0) {
      console.log("[streak] Already recorded today with streak", currentStreak);
      return;
    }

    let newStreak: number;
    if (currentLastActive === yesterday) {
      newStreak = currentStreak + 1;
      console.log("[streak] Consecutive day →", newStreak);
    } else if (!currentLastActive || currentStreak === 0) {
      newStreak = 1;
      console.log("[streak] First activity → 1");
    } else {
      newStreak = 1;
      console.log("[streak] Broken (last:", currentLastActive, ") → 1");
    }

    updateStreak(newStreak);

    const milestone = getMilestoneReached(newStreak, currentStreak);
    if (milestone) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (newStreak > 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [updateStreak]);

  const getStreakLabel = useCallback((): string => {
    if (streak === 0) return 'Chưa bắt đầu';
    if (streak === 1) return '1 ngày';
    if (streak < 7) return `${streak} ngày`;
    if (streak < 30) return `${streak} ngày 🔥`;
    if (streak < 60) return `${streak} ngày 🔥🔥`;
    return `${streak} ngày 🔥🔥🔥`;
  }, [streak]);

  return {
    streak,
    bestStreak,
    isMilestone,
    milestoneReached,
    recordActivity,
    getStreakLabel,
  };
}
