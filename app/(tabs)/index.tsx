import { CHALLENGE_LIBRARY } from "@/src/business-logic/data/challenge-library";
import { useHomeScreen } from "@/src/business-logic/hooks/useHomeScreen";
import { scheduleLocalNotifications } from "@/src/business-logic/hooks/useLocalNotifications";
import { useChallengeStore } from "@/src/business-logic/stores/challengeStore";
import { useMoodStore } from "@/src/business-logic/stores/moodStore";
import { useUserStore } from "@/src/business-logic/stores/userStore";
import { StreakToast } from "@/src/ui/atoms";
import { DailyBriefCard } from "@/src/ui/molecules/DailyBriefCard";
import { DailyMoodCheckIn } from "@/src/ui/molecules/DailyMoodCheckIn";
import { QuickQuestBanner } from "@/src/ui/molecules/QuickQuestBanner";
import { QuickQuestModal } from "@/src/ui/molecules/QuickQuestModal";
import { StreakChainBar } from "@/src/ui/molecules/StreakChainBar";
import { StreakMilestonePreview } from "@/src/ui/molecules/StreakMilestonePreview";
import { StreakShameModal } from "@/src/ui/molecules/StreakShameModal";
import { StreakShieldModal } from "@/src/ui/molecules/StreakShieldModal";
import { WeeklyChallengesCard } from "@/src/ui/molecules/WeeklyChallengesCard";
import { WeeklyReviewModal } from "@/src/ui/molecules/WeeklyReviewModal";
import { HomeHeader } from "@/src/ui/organisms/HomeHeader";
import { QuestPreviewSection } from "@/src/ui/organisms/QuestPreviewSection";
import { SkillsSection } from "@/src/ui/organisms/SkillsSection";
import {
  createHomeScreenStyles,
  getBranchColors,
} from "@/src/ui/styles/homeScreenStyles";
import { useTheme } from "@/src/ui/tokens";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function getISOWeek(date: Date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum =
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7,
    );
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createHomeScreenStyles(colors), [colors]);
  const branchColors = useMemo(() => getBranchColors(colors), [colors]);

  const [, setTick] = useState(0);
  useFocusEffect(
    useCallback(() => {
      setTick((t) => t + 1);
    }, []),
  );

  const {
    name,
    level,
    currentXP,
    targetXP,
    xpPercent,
    streak,
    streakAtRisk,
    streakShield,
    isStreakProtectedToday,
    showShieldModal,
    setShowShieldModal,
    showStreakToast,
    setShowStreakToast,
    toastStreak,
    careerPct,
    financePct,
    softskillsPct,
    wellbeingPct,
    stamina,
    pendingCount,
    quests,
    unreadCount,
    dailyBonusAvailable,
    handleShieldActivate,
  } = useHomeScreen();

  const user = useUserStore((s) => s.user);
  const weeklyActivity = useUserStore((s) => s.weeklyActivity);

  // Challenges init
  const setChallenges = useChallengeStore((s) => s.setChallenges);
  const challengesInitialized = useRef(false);
  useEffect(() => {
    if (!challengesInitialized.current) {
      setChallenges(CHALLENGE_LIBRARY);
      challengesInitialized.current = true;
    }
  }, []);

  // ── Streak shame modal ─────────────────────────────────────────────────
  const [shameModalDismissedDate, setShameModalDismissedDate] = useState<
    string | null
  >(null);
  const [showShameModal, setShowShameModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const hour = new Date().getHours();
      const today = new Date().toISOString().split("T")[0];
      const questsCompletedToday = quests.filter(
        (q) => q.completed_at !== null,
      ).length;
      if (
        hour >= 21 &&
        streak > 0 &&
        questsCompletedToday === 0 &&
        shameModalDismissedDate !== today &&
        !isStreakProtectedToday
      ) {
        // Delay so it shows after splash screen hides
        const t = setTimeout(() => setShowShameModal(true), 1500);
        return () => clearTimeout(t);
      }
    }, [streak, quests, shameModalDismissedDate, isStreakProtectedToday]),
  );

  // ── Mood check-in ──────────────────────────────────────────────────────
  const checkInShownDate = useMoodStore((s) => s.checkInShownDate);
  const [showMoodCheckIn, setShowMoodCheckIn] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const today = new Date().toISOString().split("T")[0];
      if (checkInShownDate !== today && quests.length > 0) {
        // Delay slightly so screen loads first
        const t = setTimeout(() => setShowMoodCheckIn(true), 600);
        return () => clearTimeout(t);
      }
    }, [checkInShownDate, quests.length]),
  );

  // ── Quick Quest modal ─────────────────────────────────────────────────
  const [showQuickQuest, setShowQuickQuest] = useState(false);

  // ── Weekly Review modal ───────────────────────────────────────────────
  const weeklyReviewShownWeek = useMoodStore((s) => s.weeklyReviewShownWeek);
  const [showWeeklyReview, setShowWeeklyReview] = useState(false);

  useEffect(() => {
    const isMonday = new Date().getDay() === 1;
    const currentWeek = getISOWeek();
    if (isMonday && weeklyReviewShownWeek !== currentWeek && user) {
      const t = setTimeout(() => setShowWeeklyReview(true), 1500);
      return () => clearTimeout(t);
    }
  }, [user, weeklyReviewShownWeek]);

  // ── Schedule local notifications once per session ─────────────────────
  const notificationsScheduled = useRef(false);
  useEffect(() => {
    if (!user || notificationsScheduled.current) return;
    notificationsScheduled.current = true;
    const questsCompletedToday = quests.filter(
      (q) => q.completed_at !== null,
    ).length;
    scheduleLocalNotifications({
      streak: user.streak,
      questsCompletedToday,
      userName: user.name?.split(" ").at(-1) ?? user.name ?? "bạn",
      pendingQuestCount: pendingCount,
    }).catch(() => {});
  }, [user]);

  const handleCompleteQuick = (questId: string) => {
    // Delegate to quest manager via store event — QuestPreviewSection will handle
    // We just close the modal and let normal flow complete
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StreakToast
        streak={toastStreak}
        visible={showStreakToast}
        onHide={() => setShowStreakToast(false)}
      />
      <StreakShieldModal
        visible={showShieldModal}
        streak={streak}
        onActivate={handleShieldActivate}
        onClose={() => setShowShieldModal(false)}
      />
      <StreakShameModal
        visible={showShameModal}
        streak={streak}
        onDismiss={() => {
          const today = new Date().toISOString().split("T")[0];
          setShameModalDismissedDate(today);
          setShowShameModal(false);
        }}
      />
      <DailyMoodCheckIn
        visible={showMoodCheckIn}
        onClose={() => setShowMoodCheckIn(false)}
      />
      <WeeklyReviewModal
        visible={showWeeklyReview}
        onClose={() => setShowWeeklyReview(false)}
      />
      <QuickQuestModal
        visible={showQuickQuest}
        onClose={() => setShowQuickQuest(false)}
        onComplete={handleCompleteQuick}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader
          name={name}
          level={level}
          unreadCount={unreadCount}
          dailyBonusAvailable={dailyBonusAvailable}
          onNotifications={() => router.push("/notifications")}
          onSettings={() => router.push("/settings")}
          onDailyBonus={() => useUserStore.getState().checkDailyLogin()}
          streakAtRisk={streakAtRisk}
        />

        <DailyBriefCard />

        <StreakMilestonePreview streak={streak} />

        <QuickQuestBanner onPress={() => setShowQuickQuest(true)} />

        <SkillsSection
          careerPct={careerPct}
          financePct={financePct}
          softskillsPct={softskillsPct}
          wellbeingPct={wellbeingPct}
          streak={streak}
          stamina={stamina}
          pendingCount={pendingCount}
          level={level}
          currentXP={currentXP}
          targetXP={targetXP}
          xpPercent={xpPercent}
          streakShield={streakShield}
          isStreakProtectedToday={isStreakProtectedToday}
          onShieldModal={() => setShowShieldModal(true)}
          styles={styles}
        />

        <StreakChainBar weeklyActivity={weeklyActivity} streak={streak} />

        <WeeklyChallengesCard />

        <QuestPreviewSection branchColors={branchColors} styles={styles} />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}
