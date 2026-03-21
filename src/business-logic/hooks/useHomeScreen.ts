/**
 * useHomeScreen — centralized logic for home screen state and handlers
 *
 * Manages:
 * - Streak tracking and milestone toasts
 * - Streak protection (shield) modal state
 * - Daily login checks
 * - Branch progress calculations
 * - XP/stamina display logic
 */

import { useEffect, useRef, useState } from "react";
import { useGrowthStreak } from "./useGrowthStreak";
import { useQuestManager } from "./useQuestManager";
import { useStaminaSystem } from "./useStaminaSystem";
import { useSkillTreeStore } from "@/src/business-logic/stores/skillTreeStore";
import { useUserStore } from "@/src/business-logic/stores/userStore";
import { useNotificationStore } from "@/src/business-logic/stores/notificationStore";
import type { Branch, MoodScore } from "@/src/business-logic/types";
import * as Haptics from "expo-haptics";

const MILESTONE_STREAKS = [7, 14, 30];

interface BranchProgress {
  branch: Branch;
  percent: number;
}

export function useHomeScreen() {
  const { user } = useUserStore();
  const { quests } = useQuestManager();
  const { streak } = useGrowthStreak();
  const { stamina } = useStaminaSystem();
  const { nodes, setNodes } = useSkillTreeStore();
  const { streakShield, activateStreakShield, isStreakProtectedToday } =
    useUserStore();
  const unreadCount = useNotificationStore(
    (s) => s.notifications.filter((n) => !n.read).length
  );

  // State
  const [showShieldModal, setShowShieldModal] = useState(false);
  const [showStreakToast, setShowStreakToast] = useState(false);
  const [toastStreak, setToastStreak] = useState(0);
  const prevStreak = useRef(streak ?? 0);

  // Nodes are populated by useSkillTree (via skillTreeStore.setNodes after API fetch)
  // No local fallback needed — loading state shown until nodes arrive

  // Handle streak milestone toast + haptics
  useEffect(() => {
    const currentStreak = streak ?? 0;
    if (currentStreak > prevStreak.current) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (MILESTONE_STREAKS.includes(currentStreak)) {
        setToastStreak(currentStreak);
        setShowStreakToast(true);
      }
    }
    prevStreak.current = currentStreak;
  }, [streak]);

  // Detect if streak at risk (yesterday login after 8pm)
  const streakAtRisk = (() => {
    if (!streak || streak === 0) return false;
    const { lastLoginDate } = useUserStore.getState();
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const hour = new Date().getHours();
    return lastLoginDate === yesterday && hour >= 20;
  })();

  // Calculate branch progress
  const branchProgress = (() => {
    const branches: Branch[] = [
      "career",
      "finance",
      "softskills",
      "wellbeing",
    ];
    return branches.map((branch) => {
      const branchNodes = nodes.filter((n) => n.branch === branch);
      if (branchNodes.length === 0) return { branch, percent: 0 };
      const completed = branchNodes.filter(
        (n) => n.status === "completed"
      ).length;
      return {
        branch,
        percent: Math.round((completed / branchNodes.length) * 100),
      };
    });
  })();

  // Derived values — no hardcoded fallbacks, use null when data isn't loaded
  const name = user?.name ?? null;
  const level = user?.level ?? null;
  const currentXP = user?.current_xp_in_level ?? null;
  const targetXP = user?.xp_to_next_level ?? null;
  const xpPercent = currentXP !== null && targetXP !== null ? (currentXP / targetXP) * 100 : 0;
  const pendingCount = quests.filter((q) => q.completed_at === null).length;

  // Branch progress — 0% when no nodes loaded yet
  const careerPct =
    branchProgress.find((b) => b.branch === "career")?.percent ?? 0;
  const financePct =
    branchProgress.find((b) => b.branch === "finance")?.percent ?? 0;
  const softskillsPct =
    branchProgress.find((b) => b.branch === "softskills")?.percent ?? 0;
  const wellbeingPct =
    branchProgress.find((b) => b.branch === "wellbeing")?.percent ?? 0;

  // Handlers
  const handleShieldActivate = (mood: MoodScore) => {
    activateStreakShield();
  };

  return {
    // User data
    user,
    name,
    level,
    currentXP,
    targetXP,
    xpPercent,

    // Streak & protection
    streak: streak ?? 0,
    streakAtRisk,
    streakShield,
    isStreakProtectedToday: isStreakProtectedToday(),
    showShieldModal,
    setShowShieldModal,

    // Toast
    showStreakToast,
    setShowStreakToast,
    toastStreak,

    // Progress
    branchProgress,
    careerPct,
    financePct,
    softskillsPct,
    wellbeingPct,

    // Stamina & XP
    stamina,
    pendingCount,
    quests,

    // Notifications
    unreadCount,

    // Handlers
    handleShieldActivate,
  };
}
