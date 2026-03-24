import { useHomeScreen } from "@/src/business-logic/hooks/useHomeScreen";
import { useUserStore } from "@/src/business-logic/stores/userStore";
import { StreakToast } from "@/src/ui/atoms";
import { StreakShieldModal } from "@/src/ui/molecules/StreakShieldModal";
import { HomeHeader } from "@/src/ui/organisms/HomeHeader";
import { QuestPreviewSection } from "@/src/ui/organisms/QuestPreviewSection";
import { SkillsSection } from "@/src/ui/organisms/SkillsSection";
import {
  createHomeScreenStyles,
  getBranchColors,
} from "@/src/ui/styles/homeScreenStyles";
import { useTheme } from "@/src/ui/tokens";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
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
    unreadCount,
    dailyBonusAvailable,
    handleShieldActivate,
  } = useHomeScreen();

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

        <QuestPreviewSection
          branchColors={branchColors}
          styles={styles}
        />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}
