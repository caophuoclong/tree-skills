import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useMemo, useRef } from "react";
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
import type { Quest } from "@/src/business-logic/types";
import { Emoji, NeoBrutalBox } from "@/src/ui/atoms";
import { IColors, useTheme } from "@/src/ui/tokens";

// ─── Branch helpers ───────────────────────────────────────────────────────────

const getBranchColors = (colors: any): Record<string, string> => ({
  career: colors.career,
  finance: colors.finance,
  softskills: colors.softskills,
  wellbeing: colors.wellbeing,
});

const BRANCH_LABELS: Record<string, string> = {
  career: "SỰ NGHIỆP",
  finance: "TÀI CHÍNH",
  softskills: "KỸ NĂNG MỀM",
  wellbeing: "SỨC KHỎE",
};

// Neobrutalism difficulty config
const DIFFICULTY_CONFIG: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  easy: { label: "DỄ", bg: "#34D399", text: "#052E16" },
  medium: { label: "TRUNG BÌNH", bg: "#FBBF24", text: "#1C1917" },
  hard: { label: "KHÓ", bg: "#F472B6", text: "#1F0914" },
};

// ─── Quest Card ───────────────────────────────────────────────────────────────

interface QuestItemProps {
  quest: Quest;
  onComplete: (id: string) => void;
}

function QuestItem({ quest, onComplete }: QuestItemProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const BRANCH_COLORS = useMemo(() => getBranchColors(colors), [colors]);
  const branchColor = BRANCH_COLORS[quest.branch] ?? colors.brandPrimary;
  const isCompleted = quest.completed_at !== null;
  const diff = DIFFICULTY_CONFIG[quest.difficulty] ?? DIFFICULTY_CONFIG.easy;

  // XP fly-up animation
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
      {/* XP fly-up label */}
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
        style={{
          opacity: isCompleted ? 0.55 : 1,
        }}
      >
        <View
          style={[styles.accentBar, { backgroundColor: branchColor, width: 5 }]}
        />

        {/* Top row */}
        <View style={styles.questCardTop}>
          <View style={styles.questCardTopLeft}>
            {/* Branch chip — solid fill, neobrutalism */}
            <View
              style={[
                styles.branchChip,
                {
                  backgroundColor: branchColor,
                  shadowColor: branchColor,
                  shadowOffset: { width: 2, height: 2 },
                  shadowOpacity: 0.7,
                  shadowRadius: 0,
                },
              ]}
            >
              <Text style={[styles.branchChipText, { color: "#0D0D0F" }]}>
                {BRANCH_LABELS[quest.branch] ?? quest.branch}
              </Text>
            </View>
            {/* Difficulty badge */}

            <View
              style={[
                styles.diffBadge,
                {
                  backgroundColor: diff.bg,
                  shadowColor: "#000",
                  shadowOffset: { width: 2, height: 2 },
                  shadowOpacity: 0.5,
                  shadowRadius: 0,
                },
              ]}
            >
              <Text style={[styles.diffBadgeText, { color: diff.text }]}>
                {diff.label}
              </Text>
            </View>
          </View>

          {isCompleted ? (
            <Ionicons
              name="checkmark-circle"
              size={22}
              color={colors.finance}
            />
          ) : (
            <TouchableOpacity
              style={[
                styles.checkbox,
                {
                  borderColor: branchColor,
                  borderWidth: 2,
                  shadowColor: branchColor,
                  shadowOffset: { width: 2, height: 2 },
                  shadowOpacity: 0.5,
                  shadowRadius: 0,
                },
              ]}
              onPress={triggerXPFlyUp}
              hitSlop={8}
            />
          )}
        </View>

        {/* Title */}
        <Text style={[styles.questTitle, isCompleted && styles.questTitleDone]}>
          {quest.title}
        </Text>

        {/* Bottom row: XP badge + duration */}
        <View style={styles.questCardBottom}>
          {/* XP badge — neobrutalism: solid yellow, black text, hard shadow */}
          <View
            style={[
              styles.xpBadge,
              {
                shadowColor: "#92400E",
                shadowOffset: { width: 2, height: 2 },
                shadowOpacity: 0.8,
                shadowRadius: 0,
              },
            ]}
          >
            <Text style={styles.xpBadgeText}>+{quest.xp_reward} XP</Text>
          </View>
          <Text style={styles.durationText}>⏱ {quest.duration_min} phút</Text>
        </View>
      </NeoBrutalBox>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function QuestsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { quests, completedCount, totalCount, completeQuest } =
    useQuestManager();
  const { stamina } = useStaminaSystem();
  const { dailyStats } = useUserStore();
  const combo = dailyStats.session_combo;
  const multiplier = getComboMultiplier(combo);
  const comboActive = combo >= 3;

  const handleComplete = useCallback(
    (questId: string) => {
      completeQuest(questId);
    },
    [completeQuest],
  );

  const progressPercent =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Nhiệm vụ hôm nay</Text>
          <View style={styles.staminaRow}>
            <Emoji size={13}>⚡</Emoji>
            <View style={styles.staminaBarTrack}>
              <View
                style={[styles.staminaBarFill, { width: `${stamina}%` as any }]}
              />
            </View>
            <Text style={styles.staminaText}>{stamina}%</Text>
          </View>
        </View>

        {/* ── Progress row ───────────────────────────────────── */}
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Tiến độ hoàn thành</Text>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressPercent}%` as any },
              ]}
            />
          </View>
          <View style={styles.completePill}>
            <Text style={styles.completePillText}>
              XONG {completedCount}/{totalCount}
            </Text>
          </View>
        </View>

        {/* ── Combo Banner ───────────────────────────────────── */}
        {comboActive && (
          <View
            style={[
              styles.comboBanner,
              {
                borderColor: combo >= 5 ? colors.softskills : colors.career,
                // Neobrutalism hard offset shadow
                shadowColor: "#000",
                shadowOffset: { width: 4, height: 4 },
                shadowOpacity: 0.9,
                shadowRadius: 0,
                elevation: 6,
              },
            ]}
          >
            <Emoji size={22}>
              {combo >= 5 ? "🔥🔥🔥" : combo >= 4 ? "🔥🔥" : "🔥"}
            </Emoji>
            <View style={styles.comboTextGroup}>
              <Text style={styles.comboLabel}>COMBO ĐANG HOẠT ĐỘNG</Text>
              <Text style={styles.comboValue}>
                {combo} quest liên tiếp · XP x{multiplier.toFixed(2)}
              </Text>
            </View>
            <View
              style={[
                styles.comboMultiplierPill,
                {
                  backgroundColor:
                    combo >= 5
                      ? `${colors.softskills}25`
                      : `${colors.career}25`,
                },
              ]}
            >
              <Text
                style={[
                  styles.comboMultiplierText,
                  {
                    color: combo >= 5 ? colors.softskills : colors.career,
                  },
                ]}
              >
                x{multiplier.toFixed(2)}
              </Text>
            </View>
          </View>
        )}

        {/* ── Quest Cards ────────────────────────────────────── */}
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

        {/* ── Active Challenges ──────────────────────────────── */}
        <View style={styles.challengesSection}>
          <View style={styles.challengesHeader}>
            <Emoji size={20}>🏆</Emoji>
            <Text style={styles.challengesTitle}>Thử thách đang chạy</Text>
          </View>

          <NeoBrutalBox
            style={{
              ...styles.challengeCard,
            }}
            // shadowColor={`${colors.wellbeing}40`}
            contentStyle={{
              padding: 16,
            }}
            shadowOffsetX={6}
            shadowOffsetY={6}
          >
            <View
              style={[styles.accentBar, { backgroundColor: colors.wellbeing }]}
            />
            <View style={styles.challengeCardMain}>
              <View style={styles.challengeTag}>
                <Text style={styles.challengeTagText}>SỰ KIỆN CÓ HẠN</Text>
              </View>
              <Text style={styles.challengeTitle}>7 Ngày Kỷ luật Thép</Text>
              <View style={styles.challengeStats}>
                <Ionicons
                  name="people-outline"
                  size={14}
                  color={colors.textMuted}
                />
                <Text style={styles.challengeSubtitle}>
                  2.4k người đang tham gia
                </Text>
              </View>
            </View>

            <View style={styles.challengeProgressWrapper}>
              <View style={styles.challengeProgressHeader}>
                <Text style={styles.challengeProgressLabel}>Ngày 3/7</Text>
                <View style={styles.challengeRewards}>
                  <Ionicons
                    name="gift-outline"
                    size={14}
                    color={colors.softskills}
                  />
                  <Text style={styles.challengeRewardText}>+500 XP</Text>
                </View>
              </View>
              <View style={styles.challengeProgressBarTrack}>
                <View
                  style={[styles.challengeProgressBarFill, { width: "42%" }]}
                />
              </View>
            </View>
          </NeoBrutalBox>
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
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.textPrimary,
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
      backgroundColor: "rgba(124,106,247,0.15)",
      borderWidth: 1,
      borderColor: colors.brandPrimary,
      borderRadius: 9999,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    completePillText: {
      fontSize: 10,
      fontWeight: "700",
      color: colors.brandPrimary,
    },

    // Combo Banner — neobrutalism: solid bg + hard offset shadow
    comboBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: "#1A1A2E",
      borderRadius: 8,
      borderWidth: 2,
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginBottom: 16,
    },
    comboFire: {
      fontSize: 22,
    },
    comboTextGroup: {
      flex: 1,
      gap: 2,
    },
    comboLabel: {
      fontSize: 9,
      fontWeight: "800",
      color: "rgba(255,255,255,0.5)",
      letterSpacing: 1.5,
    },
    comboValue: {
      fontSize: 13,
      fontWeight: "700",
      color: "#FFFFFF",
    },
    comboMultiplierPill: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
    },
    comboMultiplierText: {
      fontSize: 16,
      fontWeight: "800",
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
      borderRadius: 4,
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
      borderRadius: 4,
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
      fontWeight: "600",
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 4,
    },
    questTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.textPrimary,
      marginTop: 10,
      lineHeight: 22,
    },
    questTitleDone: {
      textDecorationLine: "line-through",
      color: colors.textSecondary,
      fontWeight: "500",
    },
    // Neobrutalism XP badge — solid yellow, hard shadow
    xpBadge: {
      backgroundColor: "#FBBF24",
      borderRadius: 4,
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

    // Active Challenges
    challengesSection: {
      marginTop: 28,
    },
    challengesHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 12,
    },
    challengesTrophyEmoji: {
      fontSize: 20,
    },
    challengesTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    challengeCard: {
      overflow: "hidden",
    },
    challengeCardMain: {
      marginBottom: 16,
    },
    challengeTag: {
      backgroundColor: "rgba(244,114,182,0.1)",
      alignSelf: "flex-start",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      marginBottom: 8,
    },
    challengeTagText: {
      fontSize: 9,
      fontWeight: "800",
      color: colors.wellbeing,
      letterSpacing: 1.5,
    },
    challengeTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.textPrimary,
      marginBottom: 6,
    },
    challengeStats: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    challengeSubtitle: {
      fontSize: 12,
      color: colors.textMuted,
    },
    challengeProgressWrapper: {
      gap: 8,
    },
    challengeProgressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    challengeProgressLabel: {
      fontSize: 11,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    challengeRewards: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    challengeRewardText: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.softskills,
    },
    challengeProgressBarTrack: {
      height: 6,
      backgroundColor: colors.bgElevated,
      borderRadius: 3,
      overflow: "hidden",
    },
    challengeProgressBarFill: {
      height: 6,
      backgroundColor: colors.brandPrimary,
      borderRadius: 3,
    },

    // Bottom
    bottomSpacer: {
      height: 100,
    },
  });
