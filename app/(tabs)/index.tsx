import { getDemoNodes } from "@/src/business-logic/data/skill-tree-nodes";
import { useGrowthStreak } from "@/src/business-logic/hooks/useGrowthStreak";
import { useQuestManager } from "@/src/business-logic/hooks/useQuestManager";
import { useStaminaSystem } from "@/src/business-logic/hooks/useStaminaSystem";
import { useSkillTreeStore } from "@/src/business-logic/stores/skillTreeStore";
import { useUserStore } from "@/src/business-logic/stores/userStore";
import type { Branch } from "@/src/business-logic/types";
import { IColors, useTheme } from "@/src/ui/tokens";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Alert,
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Shadow } from "react-native-shadow-2";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

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

// ─── Progress Ring ────────────────────────────────────────────────────────────

interface ProgressRingProps {
  percent: number;
  color: string;
  label: string;
}

function ProgressRing({ percent, color, label }: ProgressRingProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.ringWrapper}>
      <Shadow
        distance={2}
        startColor="#00000099"
        offset={[2, 2]}
        style={{ borderRadius: 24 }}
      >
        <View
          style={[
            styles.ring,
            {
              borderColor: color,
              backgroundColor: `${color}15`,
            },
          ]}
        >
          <Text style={[styles.ringPercent, { color }]}>{percent}%</Text>
        </View>
      </Shadow>
      <Text style={styles.ringLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

// ─── XP Shimmer Bar ───────────────────────────────────────────────────────────

function XPShimmerBar({ percent, color }: { percent: number; color: string }) {
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 2,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [-1, 2],
    outputRange: [-120, 120],
  });

  return (
    <View
      style={{
        height: 6,
        backgroundColor: "rgba(255,255,255,0.08)",
        borderRadius: 3,
        overflow: "hidden",
        marginTop: 8,
      }}
    >
      {/* Fill */}
      <View
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: `${percent}%`,
          backgroundColor: color,
          borderRadius: 3,
        }}
      />
      {/* Shimmer overlay — only visible over the filled portion */}
      <Animated.View
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: `${percent}%`,
          overflow: "hidden",
          borderRadius: 3,
        }}
      >
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: 60,
            backgroundColor: "rgba(255,255,255,0.35)",
            transform: [{ translateX }, { skewX: "-20deg" }],
          }}
        />
      </Animated.View>
    </View>
  );
}

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
  const [notifVisible, setNotifVisible] = React.useState(false);
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
  const checkDailyLogin = useUserStore((s) => s.checkDailyLogin);

  useEffect(() => {
    checkDailyLogin();
  }, [checkDailyLogin]);

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

  // Mock notifications
  const notifications = [
    {
      id: 1,
      title: "Chuỗi mới!",
      body: "Bạn đã đạt chuỗi 3 ngày liên tiếp. Tiếp tục phát huy nhé!",
      time: "2h trước",
      icon: "flame",
      color: colors.warning,
    },
    {
      id: 2,
      title: "Nhiệm vụ mới",
      body: "3 nhiệm vụ Sự nghiệp đã được làm mới.",
      time: "5h trước",
      icon: "flash",
      color: colors.career,
    },
    {
      id: 3,
      title: "Nhắc nhở",
      body: "Đừng quên check-in tâm trạng hôm nay.",
      time: "1 ngày trước",
      icon: "happy",
      color: colors.wellbeing,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitials}>{getInitials(name)}</Text>
              </View>
              <View style={styles.avatarMeta}>
                <Text style={styles.levelLabel}>CẤP {level}</Text>
                <Text style={styles.userName}>{name}</Text>
              </View>
            </View>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => setNotifVisible(true)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="notifications-outline"
                size={22}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() =>
                Alert.alert("Cài đặt", "Tính năng đang được phát triển.")
              }
              activeOpacity={0.7}
            >
              <Ionicons
                name="settings-outline"
                size={22}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── LIFE SKILLS section ─────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>KỸ NĂNG SỐNG</Text>

          <View style={styles.bentoRow}>
            {/* Left card: 2x2 progress rings */}
            <View style={[styles.bentoCard, styles.bentoCardLeft]}>
              <Shadow distance={1} startColor={`#00000099`} offset={[3, 3]}>
                <View
                  style={[
                    styles.ringsGrid,
                    { backgroundColor: colors.bgBase, borderRadius: 16 },
                  ]}
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
              </Shadow>
            </View>

            {/* Right column */}
            <View style={styles.bentoRight}>
              {/* Streak card — Neobrutalism */}
              <Shadow
                style={{ width: "100%" }}
                distance={3}
                startColor={`#00000099`}
                offset={[3, 3]}
              >
                <View
                  style={[
                    styles.bentoCard,
                    styles.bentoCardSmall,
                    {
                      borderColor: colors.warning,
                      borderWidth: 2,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.accentBar,
                      { backgroundColor: colors.warning, width: 6 },
                    ]}
                  />
                  <View style={styles.streakHeader}>
                    <Text style={styles.streakFire}>🔥</Text>
                  </View>
                  <Text style={styles.streakNumber}>{streak || 12}</Text>
                  <Text style={styles.streakLabel}>DAYS STREAK</Text>
                </View>
              </Shadow>
              <Shadow
                style={{ width: "100%" }}
                distance={1}
                startColor={`#000`}
                offset={[3, 3]}
              >
                <View style={[styles.bentoCard, styles.bentoCardSmall]}>
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
              </Shadow>

              {/* Mental Energy card */}
            </View>
          </View>

          {/* Second bento row */}
          <View style={styles.bentoRow2}>
            {/* Quests card */}

            <View style={[styles.bentoCard, styles.bentoCard2Left]}>
              <Shadow
                style={[{ width: "100%" }]}
                distance={1}
                startColor={`#00000099`}
                offset={[3, 3]}
              >
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
              </Shadow>
            </View>

            {/* Experience card */}
            <Shadow
              distance={3}
              startColor="#00000099"
              offset={[3, 3]}
              style={{ flex: 1.6 }}
            >
              <View
                style={[
                  styles.bentoCard,
                  styles.bentoCard2Right,
                  {
                    borderColor: colors.brandPrimary,
                    borderWidth: 2,
                  },
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
                  <Shadow
                    distance={2}
                    startColor="#00000099"
                    offset={[2, 2]}
                    style={{ borderRadius: 4 }}
                  >
                    <View style={styles.levelPill}>
                      <Text style={styles.levelPillText}>LVL {level}</Text>
                    </View>
                  </Shadow>
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
            </Shadow>
          </View>
        </View>

        {/* ── Suggested banner ────────────────────────────────── */}
        <TouchableOpacity
          style={styles.suggestedBanner}
          onPress={() => router.push("/(tabs)/quests")}
          activeOpacity={0.9}
        >
          <View style={styles.suggestedLeft}>
            <Text style={styles.suggestedStar}>✦</Text>
            <View style={styles.suggestedText}>
              <Text style={styles.suggestedTitle}>Gợi ý: Networking</Text>
              <Text style={styles.suggestedSub}>
                Kết nối với 2 người hướng dẫn để nhận +50 XP
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>

        {/* ── Today's Quests Preview (E4/B2) ─────────────────── */}
        <View style={styles.questPreviewSection}>
          <View style={styles.questPreviewHeader}>
            <Text style={styles.sectionLabel}>NHIỆM VỤ HÔM NAY</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/quests")}>
              <Text style={styles.viewAllText}>Xem tất cả →</Text>
            </TouchableOpacity>
          </View>

          {quests.slice(0, 3).map((quest) => (
            <TouchableOpacity
              key={quest.quest_id}
              style={styles.miniQuestCard}
              onPress={() => router.push(`/quest/${quest.quest_id}`)}
              activeOpacity={0.7}
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
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* ── Notification Center Modal (E7) ───────────────── */}
      <Modal
        visible={notifVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNotifVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setNotifVisible(false)}
        >
          <View style={styles.notifContent}>
            <View style={styles.notifHeader}>
              <Text style={styles.notifHeaderTitle}>Thông báo</Text>
              <TouchableOpacity onPress={() => setNotifVisible(false)}>
                <Ionicons
                  name="close-circle"
                  size={28}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {notifications.map((notif) => (
                <View key={notif.id} style={styles.notifItem}>
                  <View
                    style={[
                      styles.notifIcon,
                      { backgroundColor: `${notif.color}20` },
                    ]}
                  >
                    <Ionicons
                      name={notif.icon as any}
                      size={20}
                      color={notif.color}
                    />
                  </View>
                  <View style={styles.notifText}>
                    <Text style={styles.notifTitle}>{notif.title}</Text>
                    <Text style={styles.notifBody}>{notif.body}</Text>
                    <Text style={styles.notifTime}>{notif.time}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
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
      fontWeight: "700",
      color: colors.brandPrimary,
    },
    avatarMeta: {
      gap: 2,
    },
    levelLabel: {
      fontSize: 9,
      fontWeight: "700",
      color: colors.brandPrimary,
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    userName: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    headerIcons: {
      flexDirection: "row",
      gap: 4,
    },
    iconBtn: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
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
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.08)",
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
    ring: {
      width: 48,
      height: 48,
      borderRadius: 24,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
    },
    ringPercent: {
      fontSize: 11,
      fontWeight: "900",
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
      color: colors.textMuted,
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
      fontWeight: "600",
      color: colors.textMuted,
    },

    // Bento row 2
    bentoRow2: {
      flexDirection: "row",
      gap: 12,
    },
    bentoCard2Left: {
      flex: 1,
    },
    bentoCard2Right: {
      flex: 1.6,
    },

    // Quests card
    card2Label: {
      fontSize: 10,
      fontWeight: "600",
      color: colors.textMuted,
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 4,
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
    // Neobrutalism level pill — sharp corners, shadow via Shadow component
    levelPill: {
      backgroundColor: colors.brandPrimary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
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
      alignItems: "center",
      justifyContent: "space-between",
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
      fontWeight: "600",
      color: colors.brandPrimary,
      marginBottom: 8,
    },
    miniQuestCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.bgSurface,
      padding: 12,
      borderRadius: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.glassBorder,
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
      fontWeight: "500",
      color: colors.textPrimary,
      flex: 1,
    },
    miniQuestXP: {
      backgroundColor: "rgba(251,191,36,0.1)",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    miniQuestXPText: {
      fontSize: 10,
      fontWeight: "700",
      color: colors.softskills,
    },

    // Bottom
    bottomSpacer: {
      height: 100,
    },
    // Modal / Notifications
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    notifContent: {
      backgroundColor: colors.bgSurface,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      padding: 24,
      maxHeight: "80%",
      borderWidth: 1,
      borderColor: colors.glassBorder,
    },
    notifHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    notifHeaderTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.textPrimary,
    },
    notifItem: {
      flexDirection: "row",
      gap: 16,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255,255,255,0.05)",
    },
    notifIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    notifText: {
      flex: 1,
      gap: 4,
    },
    notifTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    notifBody: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    notifTime: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 2,
    },
  });
