import { getDemoNodes } from "@/src/business-logic/data/skill-tree-nodes";
import { useGrowthStreak } from "@/src/business-logic/hooks/useGrowthStreak";
import { useQuestManager } from "@/src/business-logic/hooks/useQuestManager";
import { useStaminaSystem } from "@/src/business-logic/hooks/useStaminaSystem";
import { useSkillTreeStore } from "@/src/business-logic/stores/skillTreeStore";
import { useUserStore } from "@/src/business-logic/stores/userStore";
import type { Branch } from "@/src/business-logic/types";
import {
  Emoji,
  NeoBrutalAccent,
  NeoBrutalBox,
  NeoBrutalCard,
} from "@/src/ui/atoms";
import { ProgressRing } from "@/src/ui/molecules/ProgressRing";
import { XPShimmerBar } from "@/src/ui/molecules/XPShimmerBar";
import { HomeHeader } from "@/src/ui/organisms/HomeHeader";
import { IColors, useTheme } from "@/src/ui/tokens";
import { router } from "expo-router";
import { useEffect, useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function useBranchProgress() {
  const { nodes } = useSkillTreeStore();
  const branches: Branch[] = ["career", "finance", "softskills", "wellbeing"];
  return branches.map((branch) => {
    const branchNodes = nodes.filter((n) => n.branch === branch);
    if (branchNodes.length === 0) return { branch, percent: 0 };
    const completed = branchNodes.filter(
      (n) => n.status === "completed",
    ).length;
    return {
      branch,
      percent: Math.round((completed / branchNodes.length) * 100),
    };
  });
}

const getBranchColors = (colors: any): Record<string, string> => ({
  career: colors.career,
  finance: colors.finance,
  softskills: colors.softskills,
  wellbeing: colors.wellbeing,
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const BRANCH_COLORS = useMemo(() => getBranchColors(colors), [colors]);

  const { user } = useUserStore();
  const { quests } = useQuestManager();
  const { streak } = useGrowthStreak();
  const { stamina } = useStaminaSystem();
  const { nodes, setNodes } = useSkillTreeStore();
  const branchProgress = useBranchProgress();

  // Seed demo progress data so rings display realistic values immediately
  useEffect(() => {
    if (nodes.length === 0) {
      setNodes(getDemoNodes());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const name = user?.name ?? "Alex Kim";
  const level = user?.level ?? 4;
  const currentXP = user?.current_xp_in_level ?? 1240;
  const targetXP = user?.xp_to_next_level ?? 1500;
  // checkDailyLogin is now handled globally in _layout.tsx via AppState

  const xpPercent = (currentXP / targetXP) * 100;
  const pendingCount = quests.filter((q) => q.completed_at === null).length;

  const careerPct =
    branchProgress.find((b) => b.branch === "career")?.percent ?? 0;
  const financePct =
    branchProgress.find((b) => b.branch === "finance")?.percent ?? 0;
  const softskillsPct =
    branchProgress.find((b) => b.branch === "softskills")?.percent ?? 0;
  const wellbeingPct =
    branchProgress.find((b) => b.branch === "wellbeing")?.percent ?? 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <HomeHeader
          name={name}
          level={level}
          onNotifications={() => router.push("/notifications")}
          onSettings={() => router.push("/settings")}
        />

        {/* ── LIFE SKILLS section ─────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>KỸ NĂNG SỐNG</Text>

          <View style={styles.bentoRow}>
            {/* Left card: 2x2 progress rings */}
            <View style={[styles.bentoCardLeft]}>
              <NeoBrutalCard shadowOffsetX={4} shadowOffsetY={4}>
                <View
                  style={[styles.ringsGrid, { backgroundColor: colors.bgBase }]}
                >
                  <ProgressRing
                    percent={careerPct}
                    color={colors.career}
                    label="Sự nghiệp"
                  />
                  <ProgressRing
                    percent={financePct}
                    color={colors.finance}
                    label="Tài chính"
                  />
                  <ProgressRing
                    percent={softskillsPct}
                    color={colors.softskills}
                    label="Kỹ năng"
                  />
                  <ProgressRing
                    percent={wellbeingPct}
                    color={colors.wellbeing}
                    label="Sức khỏe"
                  />
                </View>
              </NeoBrutalCard>
            </View>

            {/* Right column */}
            <View style={styles.bentoRight}>
              {/* Streak card — Neobrutalism */}
              <NeoBrutalCard shadowOffsetX={4} shadowOffsetY={4}>
                <View
                  style={[
                    styles.bentoCardSmall,
                    { backgroundColor: colors.bgBase },
                  ]}
                >
                  <View
                    style={[
                      styles.accentBar,
                      { backgroundColor: colors.warning, width: 6 },
                    ]}
                  />
                  <View style={styles.streakHeader}>
                    <Emoji size={16}>🔥</Emoji>
                  </View>
                  <Text style={styles.streakNumber}>{streak || 12}</Text>
                  <Text style={styles.streakLabel}>DAYS STREAK</Text>
                </View>
              </NeoBrutalCard>
              <NeoBrutalCard shadowOffsetX={4} shadowOffsetY={4}>
                <View
                  style={[
                    styles.bentoCardSmall,
                    { backgroundColor: colors.bgBase },
                  ]}
                >
                  <View
                    style={[
                      styles.accentBar,
                      { backgroundColor: colors.finance, width: 6 },
                    ]}
                  />
                  <Text style={styles.energyLabel}>ENERGY</Text>
                  <View style={styles.energyBarTrack}>
                    <View
                      style={[
                        styles.energyBarFill,
                        {
                          width: `${stamina}%` as any,
                          backgroundColor:
                            stamina < 30
                              ? colors.danger
                              : stamina < 70
                                ? colors.warning
                                : colors.finance,
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.energyInfoRow}>
                    <Text style={styles.energyLabelSmall}>STAMINA</Text>
                    <Text
                      style={[
                        styles.energyPercent,
                        {
                          color:
                            stamina < 30
                              ? colors.danger
                              : stamina < 70
                                ? colors.warning
                                : colors.finance,
                        },
                      ]}
                    >
                      {stamina}%
                    </Text>
                  </View>
                </View>
              </NeoBrutalCard>

              {/* Mental Energy card */}
            </View>
          </View>

          {/* Second bento row */}
          <View style={styles.bentoRow2}>
            {/* Quests card */}

            <NeoBrutalCard
              shadowOffsetX={4}
              shadowOffsetY={4}
              style={styles.bentoCard2Left}
            >
              <View style={[styles.bentoCard, { height: 140 }]}>
                <Text style={styles.card2Label}>NHIỆM VỤ</Text>
                <Text style={styles.card2Number}>{pendingCount || 3}</Text>
                <Text style={styles.card2Sub}>Đang chờ</Text>
                <View style={styles.dotRow}>
                  <View
                    style={[styles.dot, { backgroundColor: colors.career }]}
                  />
                  <View
                    style={[styles.dot, { backgroundColor: colors.finance }]}
                  />
                  <View
                    style={[styles.dot, { backgroundColor: colors.wellbeing }]}
                  />
                </View>
              </View>
            </NeoBrutalCard>

            {/* Experience card */}
            <NeoBrutalCard
              shadowOffsetX={4}
              shadowOffsetY={4}
              style={styles.bentoCard2Right}
            >
              <View
                style={[
                  styles.bentoCard,
                  styles.bentoCard2Right,
                  { height: 140 },
                ]}
              >
                <View
                  style={[
                    styles.accentBar,
                    { backgroundColor: colors.brandPrimary, width: 6 },
                  ]}
                />
                <View style={styles.xpHeaderRow}>
                  <Text style={styles.card2Label}>EXPERIENCE</Text>
                  <NeoBrutalAccent
                    accentColor={colors.brandPrimary}
                    strokeColor="rgba(0,0,0,0.7)"
                    shadowOffsetX={2}
                    shadowOffsetY={2}
                    borderWidth={1.5}
                    borderRadius={4}
                    contentStyle={{ paddingHorizontal: 8, paddingVertical: 4 }}
                  >
                    <Text style={styles.levelPillText}>LVL {level}</Text>
                  </NeoBrutalAccent>
                </View>
                <Text style={styles.xpValue}>
                  {currentXP.toLocaleString()} / {targetXP.toLocaleString()} XP
                </Text>
                <Text style={styles.xpNextLabel}>
                  TIẾP THEO: CẤP {level + 1}
                </Text>
                <XPShimmerBar percent={xpPercent} color={colors.brandPrimary} />
                <Text style={styles.xpUntilLabel}>
                  Còn {targetXP - currentXP} XP nữa để lên cấp
                </Text>
              </View>
            </NeoBrutalCard>
          </View>
        </View>

        {/* ── Suggested banner ────────────────────────────────── */}
        <NeoBrutalAccent
          accentColor={colors.brandGlow}
          style={{
            padding: 4,
            marginVertical: 4,
          }}
          onPress={() => router.push("/(tabs)/quests")}
        >
          <View
            style={{
              ...styles.suggestedLeft,
              padding: 12,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text style={styles.suggestedStar}>✦</Text>
            <View style={styles.suggestedText}>
              <Text style={styles.suggestedTitle}>Gợi ý: Networking</Text>
              <Text style={styles.suggestedSub}>
                Kết nối với 2 người hướng dẫn để nhận +50 XP
              </Text>
            </View>
          </View>
        </NeoBrutalAccent>

        {/* ── Today's Quests Preview (E4/B2) ─────────────────── */}
        <View style={styles.questPreviewSection}>
          <View style={styles.questPreviewHeader}>
            <Text style={styles.sectionLabel}>NHIỆM VỤ HÔM NAY</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/quests")}>
              <Text style={styles.viewAllText}>Xem tất cả →</Text>
            </TouchableOpacity>
          </View>

          {quests.slice(0, 3).map((quest) => (
            <NeoBrutalBox
              key={quest.quest_id}
              borderColor={colors.glassBorder}
              backgroundColor={colors.bgSurface}
              shadowColor="#000"
              shadowOffsetX={2}
              shadowOffsetY={2}
              borderWidth={1}
              borderRadius={12}
              style={{ marginBottom: 8 }}
              onPress={() => router.push(`/quest/${quest.quest_id}`)}
              contentStyle={{
                padding: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={styles.miniQuestContent}>
                <View
                  style={[
                    styles.miniQuestDot,
                    {
                      backgroundColor:
                        BRANCH_COLORS[quest.branch] ?? colors.brandPrimary,
                    },
                  ]}
                />
                <Text style={styles.miniQuestTitle} numberOfLines={1}>
                  {quest.title}
                </Text>
              </View>
              <View style={styles.miniQuestXP}>
                <Text style={styles.miniQuestXPText}>
                  +{quest.xp_reward} XP
                </Text>
              </View>
            </NeoBrutalBox>
          ))}
        </View>

        <View style={styles.bottomSpacer} />

        {/* ── DEV ONLY: NeoBrutalBox Demo link ─────────────── */}
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
              <Emoji size={13}>🧪</Emoji> DEV → NeoBrutalBox Demo
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (colors: IColors) =>
  StyleSheet.create({
    safeArea: {
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
      marginBottom: 20,
    },
    headerLeft: {
      flex: 1,
    },
    avatarRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    avatarCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.bgSurface,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.glassBorder,
    },
    avatarInitials: {
      fontSize: 11,
      fontFamily: "SpaceGrotesk-Bold",
      fontWeight: "700",
      color: colors.brandPrimary,
    },
    avatarMeta: {
      gap: 2,
    },
    levelLabel: {
      fontSize: 9,
      fontFamily: "SpaceGrotesk-Bold",
      fontWeight: "700",
      color: colors.brandPrimary,
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    userName: {
      fontSize: 18,
      fontFamily: "SpaceGrotesk-Bold",
      fontWeight: "700",
      color: colors.textPrimary,
    },
    headerIcons: {
      flexDirection: "row",
      gap: 4,
    },

    // Section
    section: {
      marginTop: 0,
    },
    sectionLabel: {
      fontSize: 10,
      fontWeight: "800",
      color: colors.textMuted,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      marginBottom: 12,
    },

    // Bento row 1
    bentoRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 12,
    },
    bentoCard: {
      backgroundColor: colors.bgBase,
      padding: 16,
      // No overflow:"hidden" — it clips Shadow component output
    },
    accentBar: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
      // Match parent card's borderRadius so no clipping needed
      borderTopLeftRadius: 16,
      borderBottomLeftRadius: 16,
    },
    bentoCardLeft: {
      flex: 1.4,
    },
    bentoRight: {
      flex: 1,
      gap: 12,
    },
    bentoCardSmall: {
      padding: 16,
      justifyContent: "center",
      minHeight: 110, // Ensure enough height for big numbers
    },

    // Progress rings grid
    ringsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
      justifyContent: "center",
      paddingVertical: 8,
    },
    ringWrapper: {
      alignItems: "center",
      width: "42%",
      marginBottom: 8,
    },
    ringPercent: {
      fontSize: 12,
      fontWeight: "900",
      letterSpacing: -0.3,
    },
    ringLabel: {
      fontSize: 9,
      fontWeight: "800",
      color: colors.textSecondary,
      marginTop: 8,
      textAlign: "center",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },

    // Streak card
    streakHeader: {
      marginBottom: 4,
    },
    streakFire: {
      fontSize: 16,
    },
    streakNumber: {
      fontSize: 28,
      fontWeight: "900",
      color: colors.warning,
      lineHeight: 32,
      letterSpacing: -0.5,
    },
    streakLabel: {
      fontSize: 8,
      fontWeight: "800",
      color: colors.textSecondary,
      letterSpacing: 0,
      textTransform: "uppercase",
      marginTop: 6,
    },

    // Energy card
    energyLabel: {
      fontSize: 8,
      fontWeight: "800",
      color: colors.textSecondary,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      marginBottom: 12,
    },
    energyBarTrack: {
      height: 4,
      backgroundColor: colors.bgElevated,
      borderRadius: 2,
      overflow: "hidden",
      marginBottom: 4,
    },
    energyBarFill: {
      height: 4,
      backgroundColor: colors.finance,
      borderRadius: 2,
    },
    energyPercent: {
      fontSize: 10,
      fontFamily: "SpaceGrotesk-Bold",
      fontWeight: "700",
      color: colors.finance,
    },
    energyInfoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 2,
    },
    energyLabelSmall: {
      fontSize: 8,
      fontFamily: "SpaceGrotesk-SemiBold",
      fontWeight: "600",
      color: colors.textSecondary,
    },

    // Bento row 2
    bentoRow2: {
      flexDirection: "row",
      gap: 12,
    },
    bentoCard2Left: {
      flex: 1.6,
    },
    bentoCard2Right: {
      flex: 1.6,
    },

    // Quests card
    card2Label: {
      fontSize: 10,
      fontFamily: "SpaceGrotesk-SemiBold",
      fontWeight: "600",
      color: colors.textMuted,
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 5,
    },
    card2Number: {
      fontSize: 32,
      fontWeight: "900",
      color: colors.textPrimary,
      lineHeight: 36,
      letterSpacing: -0.5,
    },
    card2Sub: {
      fontSize: 9,
      fontWeight: "800",
      color: colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginTop: 6,
    },
    dotRow: {
      flexDirection: "row",
      gap: 4,
      marginTop: 8,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },

    // XP card
    xpHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 2,
    },
    levelPillText: {
      fontSize: 10,
      fontWeight: "900",
      color: "#FFFFFF",
      letterSpacing: 0.5,
    },
    xpValue: {
      fontSize: 14,
      fontWeight: "900",
      color: colors.textPrimary,
      marginTop: 12,
      letterSpacing: -0.2,
      lineHeight: 20,
    },
    xpNextLabel: {
      fontSize: 9,
      fontFamily: "SpaceGrotesk-Bold",
      fontWeight: "700",
      color: colors.textMuted,
      marginTop: 8,
      letterSpacing: 0.5,
    },
    xpBarTrack: {
      height: 4,
      backgroundColor: colors.bgElevated,
      borderRadius: 2,
      overflow: "hidden",
      marginTop: 8,
    },
    xpBarFill: {
      height: 4,
      backgroundColor: colors.brandPrimary,
      borderRadius: 2,
    },
    xpUntilLabel: {
      fontSize: 9,
      color: colors.textMuted,
      marginTop: 6,
    },

    // Suggested banner
    suggestedBanner: {
      marginTop: 12,
      borderRadius: 16,
      padding: 16,
      backgroundColor: colors.brandPrimary,
      flexDirection: "row",
      // alignItems: "center",
      // justifyContent: "space-between",
    },
    suggestedLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      gap: 10,
    },
    suggestedStar: {
      fontSize: 18,
      color: "#FFFFFF",
    },
    suggestedText: {
      flex: 1,
    },
    suggestedTitle: {
      fontSize: 14,
      fontFamily: "SpaceGrotesk-SemiBold",
      fontWeight: "600",
      color: "#FFFFFF",
    },
    suggestedSub: {
      fontSize: 12,
      color: "rgba(255,255,255,0.75)",
      marginTop: 2,
    },

    // Quests Preview
    questPreviewSection: {
      marginTop: 24,
    },
    questPreviewHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    viewAllText: {
      fontSize: 12,
      fontFamily: "SpaceGrotesk-SemiBold",
      fontWeight: "600",
      color: colors.brandPrimary,
      marginBottom: 8,
    },
    miniQuestContent: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      gap: 10,
    },
    miniQuestDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    miniQuestTitle: {
      fontSize: 14,
      fontFamily: "SpaceGrotesk-Medium",
      fontWeight: "500",
      color: colors.textPrimary,
      flex: 1,
    },
    miniQuestXP: {
      // backgroundColor: "rgba(251,191,36,0.1)",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    miniQuestXPText: {
      fontSize: 10,
      fontFamily: "SpaceGrotesk-Bold",
      fontWeight: "700",
      color: colors.softskills,
    },

    // Bottom
    bottomSpacer: {
      height: 100,
    },
  });
