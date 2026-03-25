import { useHomeScreen } from "@/src/business-logic/hooks/useHomeScreen";
import { useChallengeStore } from "@/src/business-logic/stores/challengeStore";
import { useUserStore } from "@/src/business-logic/stores/userStore";
import { StreakToast } from "@/src/ui/atoms";
import { StreakChainBar } from "@/src/ui/molecules/StreakChainBar";
import { StreakShameModal } from "@/src/ui/molecules/StreakShameModal";
import { StreakShieldModal } from "@/src/ui/molecules/StreakShieldModal";
import { WeeklyChallengesCard } from "@/src/ui/molecules/WeeklyChallengesCard";
import { HomeHeader } from "@/src/ui/organisms/HomeHeader";
import { QuestPreviewSection } from "@/src/ui/organisms/QuestPreviewSection";
import { SkillsSection } from "@/src/ui/organisms/SkillsSection";
import {
  createHomeScreenStyles,
  getBranchColors,
} from "@/src/ui/styles/homeScreenStyles";
import { useTheme } from "@/src/ui/tokens";
import { CHALLENGE_LIBRARY } from "@/src/business-logic/data/challenge-library";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createHomeScreenStyles(colors), [colors]);
  const branchColors = useMemo(() => getBranchColors(colors), [colors]);

  // Force re-render when screen gains focus (e.g., after closing quest modal)
  const [, setTick] = useState(0);
  useFocusEffect(useCallback(() => { setTick((t) => t + 1); }, []));

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

  const weeklyActivity = useUserStore((s) => s.weeklyActivity);

  // Initialise weekly challenges from library once on mount
  const setChallenges = useChallengeStore((s) => s.setChallenges);
  const challengesInitialized = useRef(false);
  useEffect(() => {
    if (!challengesInitialized.current) {
      setChallenges(CHALLENGE_LIBRARY);
      challengesInitialized.current = true;
    }
  }, []);

  // Streak shame modal: show when it's past 9pm, streak > 0, no quests done today
  const [shameModalDismissedDate, setShameModalDismissedDate] = useState<string | null>(null);
  const [showShameModal, setShowShameModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const hour = new Date().getHours();
      const today = new Date().toISOString().split("T")[0];
      const questsCompletedToday = quests.filter((q) => q.completed_at !== null).length;
      const alreadyDismissedToday = shameModalDismissedDate === today;

      if (
        hour >= 21 &&
        streak > 0 &&
        questsCompletedToday === 0 &&
        !alreadyDismissedToday &&
        !isStreakProtectedToday
      ) {
        setShowShameModal(true);
      }
    }, [streak, quests, shameModalDismissedDate, isStreakProtectedToday]),
  );

  const handleShameDismiss = () => {
    const today = new Date().toISOString().split("T")[0];
    setShameModalDismissedDate(today);
    setShowShameModal(false);
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
        onDismiss={handleShameDismiss}
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

        <QuestPreviewSection
          branchColors={branchColors}
          styles={styles}
        />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}
