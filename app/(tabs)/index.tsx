import { StreakToast } from "@/src/ui/atoms";
import { StreakShieldModal } from "@/src/ui/molecules/StreakShieldModal";
import { HomeHeader } from "@/src/ui/organisms/HomeHeader";
import { SkillsSection } from "@/src/ui/organisms/SkillsSection";
import { QuestPreviewSection } from "@/src/ui/organisms/QuestPreviewSection";
import { useHomeScreen } from "@/src/business-logic/hooks/useHomeScreen";
import { useTheme } from "@/src/ui/tokens";
import { router } from "expo-router";
import { useMemo, Pressable } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  createHomeScreenStyles,
  getBranchColors,
} from "@/src/ui/styles/homeScreenStyles";

export default function HomeScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createHomeScreenStyles(colors), [colors]);
  const branchColors = useMemo(() => getBranchColors(colors), [colors]);

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
    branchProgress,
    careerPct,
    financePct,
    softskillsPct,
    wellbeingPct,
    stamina,
    pendingCount,
    quests,
    unreadCount,
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
          onNotifications={() => router.push("/notifications")}
          onSettings={() => router.push("/settings")}
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
          quests={quests}
          branchColors={branchColors}
          styles={styles}
        />

        <View style={styles.bottomSpacer} />

        {__DEV__ && (
          <Pressable
            onPress={() => router.push("/neo-brutal-demo" as any)}
            style={{
              margin: 16,
              padding: 12,
              borderRadius: 8,
              borderWidth: 2,
              borderStyle: "dashed",
              borderColor: "#7C6AF7",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#7C6AF7",
                fontFamily: "SpaceGrotesk-Bold",
                fontWeight: "700",
                fontSize: 13,
              }}
            >
              🧪 DEV → NeoBrutalBox Demo
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
