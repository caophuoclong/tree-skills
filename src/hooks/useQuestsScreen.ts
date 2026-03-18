import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useQuestManager } from '@/src/business-logic/hooks/useQuestManager';
import { useStaminaSystem } from '@/src/business-logic/hooks/useStaminaSystem';
import { useUserStore } from '@/src/business-logic/stores/userStore';
import { useQuestStore } from '@/src/business-logic/stores/questStore';

export function useQuestsScreen() {
  const { quests, completedCount, totalCount, completeQuest } = useQuestManager();
  const { stamina } = useStaminaSystem();
  const { dailyStats } = useUserStore();
  const { dailyQuests } = useQuestStore();
  const lastQuestTimestamp = useRef<number>(0);
  const [wellbeingDismissedDate, setWellbeingDismissedDate] = useState<string | null>(null);

  const combo = dailyStats.session_combo;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const today = new Date().toISOString().split('T')[0];

  const showWellbeingBanner =
    dailyStats.wellbeing_quests_today === 0 &&
    dailyStats.quests_completed_today >= 3 &&
    wellbeingDismissedDate !== today;

  const wellbeingQuest = dailyQuests.find(
    (q) => q.branch === 'wellbeing' && !q.completed_at
  );

  useFocusEffect(
    useCallback(() => {
      if (Date.now() - lastQuestTimestamp.current > 30 * 60 * 1000) {
        const userStore = useUserStore.getState();
        userStore.resetDailyStats?.();
      }
    }, [])
  );

  const handleComplete = useCallback(
    (questId: string) => {
      completeQuest(questId);
      lastQuestTimestamp.current = Date.now();
    },
    [completeQuest]
  );

  return {
    quests,
    completedCount,
    totalCount,
    stamina,
    combo,
    progressPercent,
    showWellbeingBanner,
    wellbeingQuest,
    today,
    handleComplete,
    setWellbeingDismissedDate,
  };
}
