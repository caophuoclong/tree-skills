import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useQuestManager } from "@/src/business-logic/hooks/useQuestManager";
import { useStaminaSystem } from "@/src/business-logic/hooks/useStaminaSystem";
import { getComboMultiplier } from "@/src/business-logic/hooks/useXPEngine";
import { useUserStore } from "@/src/business-logic/stores/userStore";
import { useChallengeStore } from "@/src/business-logic/stores/challengeStore";
import { useQuestStore } from "@/src/business-logic/stores/questStore";
import type { Quest } from "@/src/business-logic/types";
import { Emoji, NeoBrutalAccent, NeoBrutalBox } from "@/src/ui/atoms";
import { ChallengeCard, ComboBar } from "@/src/ui/molecules";
import { WellbeingWarningBanner } from "@/src/ui/organisms/WellbeingWarningBanner";
import { IColors, useTheme } from "@/src/ui/tokens";

const BRANCH_LABELS: Record<string, string> = {
  career: "SỰ NGHIỆP",
  finance: "TÀI CHÍNH",
  softskills: "KỸ NĂNG MỀM",
  wellbeing: "SỨC KHỎE",
};

const DIFFICULTY_CONFIG: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  easy: { label: "DỄ", bg: "#34D399", text: "#052E16" },
  medium: { label: "TRUNG BÌNH", bg: "#FBBF24", text: "#1C1917" },
  hard: { label: "KHÓ", bg: "#F472B6", text: "#1F0914" },
};

interface QuestItemProps {
  quest: Quest;
  onComplete: (id: string) => void;
}

function QuestItem({ quest, onComplete }: QuestItemProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const branchColor = colors[quest.branch as keyof typeof colors] ?? colors.brandPrimary;
  const isCompleted = quest.completed_at !== null;
  const diff = DIFFICULTY_CONFIG[quest.difficulty] ?? DIFFICULTY_CONFIG.easy;
  const xpFlyY = useRef(new Animated.Value(0)).current;
  const xpFlyOpacity = useRef(new Animated.Value(0)).current;

  const triggerXPFlyUp = () => {
    xpFlyY.setValue(0);
    xpFlyOpacity.setValue(1);
    Animated.parallel([
      Animated.timing(xpFlyY, {
        toValue: -48,
        duration: 900,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(400),
        Animated.timing(xpFlyOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    onComplete(quest.quest_id);
  };

  return (
    <View style={{ position: "relative" }}>
      <Animated.Text
        style={{
          position: "absolute",
          top: 0,
          right: 16,
          fontSize: 16,
          fontWeight: "900",
          color: "#FBBF24",
          zIndex: 99,
          transform: [{ translateY: xpFlyY }],
          opacity: xpFlyOpacity,
          pointerEvents: "none",
        }}
      >
        +{quest.xp_reward} XP ✦
      </Animated.Text>

      <NeoBrutalBox
        shadowOffsetX={4}
        shadowOffsetY={4}
        contentStyle={{ padding: 12 }}
        onPress={() => router.push(`/quest/${quest.quest_id}`)}
        style={{ opacity: isCompleted ? 0.55 : 1 }}
      >
        <View style={[styles.accentBar, { backgroundColor: branchColor, width: 5 }]} />

        <View style={styles.questCardTop}>
          <View style={styles.questCardTopLeft}>
            <NeoBrutalAccent
              accentColor={branchColor}
              strokeColor="#000"
              shadowOffsetX={2}
              shadowOffsetY={2}
              borderRadius={4}
              contentStyle={styles.branchChip}
            >
              <Text style={[styles.branchChipText, { color: "#0D0D0F" }]}>
                {BRANCH_LABELS[quest.branch] ?? quest.branch}
              </Text>
            </NeoBrutalAccent>
            <NeoBrutalAccent
              accentColor={diff.bg}
              strokeColor="#000"
              shadowOffsetX={2}
              shadowOffsetY={2}
              borderRadius={4}
              contentStyle={styles.diffBadge}
            >
              <Text style={[styles.diffBadgeText, { color: diff.text }]}>
                {diff.label}
              </Text>
            </NeoBrutalAccent>
          </View>

          {isCompleted ? (
            <Ionicons name="checkmark-circle" size={22} color={colors.finance} />
          ) : (
            <TouchableOpacity
              style={[styles.checkbox, { borderColor: branchColor, borderWidth: 2 }]}
              onPress={triggerXPFlyUp}
              hitSlop={8}
            />
          )}
        </View>

        <Text style={[styles.questTitle, isCompleted && styles.questTitleDone]}>
          {quest.title}
        </Text>

        <View style={styles.questCardBottom}>
          <NeoBrutalAccent
            accentColor="#FBBF24"
            strokeColor="#92400E"
            shadowOffsetX={2}
            shadowOffsetY={2}
            borderRadius={4}
            contentStyle={styles.xpBadge}
          >
            <Text style={styles.xpBadgeText}>+{quest.xp_reward} XP</Text>
          </NeoBrutalAccent>
          <Text style={styles.durationText}>⏱ {quest.duration_min} phút</Text>
        </View>
      </NeoBrutalBox>
    </View>
  );
}

export default function QuestsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { quests, completedCount, totalCount, completeQuest } = useQuestManager();
  const { stamina } = useStaminaSystem();
  const { dailyStats } = useUserStore();
  const { challenges } = useChallengeStore();
  const { dailyQuests } = useQuestStore();
  const lastQuestTimestamp = useRef<number>(0);
  const [wellbeingDismissedDate, setWellbeingDismissedDate] = useState<string | null>(null);

  const combo = dailyStats.session_combo;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const today = new Date().toISOString().split('T')[0];

  // Show banner if no wellbeing quests completed today AND 3+ quests completed today
  const showWellbeingBanner =
    dailyStats.wellbeing_quests_today === 0 &&
    dailyStats.quests_completed_today >= 3 &&
    wellbeingDismissedDate !== today;

  // Find a random uncompleted wellbeing quest to suggest
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

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Nhiệm vụ hôm nay</Text>
          <View style={styles.headerRight}>
            <ComboBar combo={combo} />
            <View style={styles.staminaRow}>
              <Emoji size={13}>⚡</Emoji>
              <View style={styles.staminaBarTrack}>
                <View style={[styles.staminaBarFill, { width: `${stamina}%` as any }]} />
              </View>
              <Text style={styles.staminaText}>{stamina}%</Text>
            </View>
          </View>
        </View>

        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Tiến độ hoàn thành</Text>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` as any }]} />
          </View>
          <NeoBrutalAccent
            accentColor={`${colors.bgBase}`}
            strokeColor={colors.brandPrimary}
            borderWidth={1}
            shadowOffsetX={2}
            shadowOffsetY={2}
            borderRadius={9999}
            contentStyle={styles.completePill}
          >
            <Text style={styles.completePillText}>
              XONG {completedCount}/{totalCount}
            </Text>
          </NeoBrutalAccent>
        </View>

        {showWellbeingBanner && (
          <WellbeingWarningBanner
            onDismiss={() => setWellbeingDismissedDate(today)}
            onCTA={() =>
              wellbeingQuest && router.push(`/quest/${wellbeingQuest.quest_id}` as any)
            }
          />
        )}

        <View style={styles.questList}>
          {quests.length === 0 ? (
            <View style={styles.emptyState}>
              <Emoji size={48}>🌱</Emoji>
              <Text style={styles.emptyText}>
                Chưa có nhiệm vụ nào. Hãy hoàn thành onboarding để bắt đầu!
              </Text>
            </View>
          ) : (
            quests.map((quest) => (
              <QuestItem
                key={quest.quest_id}
                quest={quest}
                onComplete={handleComplete}
              />
            ))
          )}
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text style={styles.challengesTitle}>🏆 Weekly Challenges</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {challenges.map((ch) => (
              <ChallengeCard key={ch.id} challenge={ch} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (colors: IColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bgBase,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 16,
    },

    // Header
    header: {
      flexDirection: "column",
      gap: 8,
      marginBottom: 12,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.textPrimary,
    },
    headerRight: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    staminaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    staminaIcon: {
      fontSize: 13,
    },
    staminaBarTrack: {
      width: 52,
      height: 4,
      backgroundColor: colors.bgElevated,
      borderRadius: 2,
      overflow: "hidden",
    },
    staminaBarFill: {
      height: 4,
      backgroundColor: colors.finance,
      borderRadius: 2,
    },
    staminaText: {
      fontSize: 11,
      color: colors.finance,
      fontFamily: "SpaceGrotesk-SemiBold",
      fontWeight: "600",
      minWidth: 30,
    },

    // Progress row
    progressRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 20,
    },
    progressLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      flexShrink: 0,
    },
    progressBarTrack: {
      flex: 1,
      height: 4,
      backgroundColor: colors.bgElevated,
      borderRadius: 2,
      overflow: "hidden",
    },
    progressBarFill: {
      height: 4,
      backgroundColor: colors.brandPrimary,
      borderRadius: 2,
    },
    completePill: {
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    completePillText: {
      fontSize: 10,
      fontFamily: "SpaceGrotesk-Bold",
      fontWeight: "700",
      color: colors.brandPrimary,
    },


    // Quest List
    questList: {
      gap: 12,
    },
    questCard: {
      backgroundColor: colors.bgBase,
      borderRadius: 14,
      padding: 16,
      overflow: "hidden",
    },
    accentBar: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 5,
    },
    questCardTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 2,
    },
    questCardTopLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      flexShrink: 1,
      flexWrap: "wrap",
    },
    questCardBottom: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 10,
    },
    // Neobrutalism solid branch chip
    branchChip: {
      paddingHorizontal: 7,
      paddingVertical: 3,
    },
    branchChipText: {
      fontSize: 9,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    // Difficulty badge
    diffBadge: {
      paddingHorizontal: 7,
      paddingVertical: 3,
    },
    diffBadgeText: {
      fontSize: 9,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    durationText: {
      fontSize: 11,
      color: colors.textMuted,
      fontFamily: "SpaceGrotesk-SemiBold",
      fontWeight: "600",
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 4,
    },
    questTitle: {
      fontSize: 16,
      fontFamily: "SpaceGrotesk-Bold",
      fontWeight: "700",
      color: colors.textPrimary,
      marginTop: 10,
      lineHeight: 22,
    },
    questTitleDone: {
      textDecorationLine: "line-through",
      color: colors.textSecondary,
      fontFamily: "SpaceGrotesk-Medium",
      fontWeight: "500",
    },
    // Neobrutalism XP badge — solid yellow, hard shadow
    xpBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      alignSelf: "flex-start",
    },
    xpBadgeText: {
      fontSize: 12,
      fontWeight: "900",
      color: "#1C1917",
      letterSpacing: 0.3,
    },

    // Empty state
    emptyState: {
      alignItems: "center",
      paddingVertical: 40,
      gap: 8,
    },
    emptyEmoji: {
      fontSize: 48,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      paddingHorizontal: 20,
    },

    // Challenges
    challengesTitle: {
      fontSize: 16,
      marginBottom: 10,
      marginHorizontal: 20,
      fontFamily: "SpaceGrotesk-Bold",
      color: colors.textPrimary,
    },

    // Bottom
    bottomSpacer: {
      height: 100,
    },
  });
