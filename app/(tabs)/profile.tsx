import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSkillTreeStore } from "@/src/business-logic/stores/skillTreeStore";
import { useUserStore } from "@/src/business-logic/stores/userStore";
import type { Branch } from "@/src/business-logic/types";
import { useTheme } from "@/src/ui/tokens";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getBranchPercent(
  nodes: ReturnType<typeof useSkillTreeStore.getState>["nodes"],
  branch: Branch,
): number {
  const branchNodes = nodes.filter((n) => n.branch === branch);
  if (branchNodes.length === 0) return 0;
  const completed = branchNodes.filter((n) => n.status === "completed").length;
  return Math.round((completed / branchNodes.length) * 100);
}

// ─── Branch progress row ─────────────────────────────────────────────────────

interface BranchRowProps {
  label: string;
  percent: number;
  color: string;
}

function BranchProgressRow({ label, percent, color }: BranchRowProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.branchRow}>
      <Text style={styles.branchLabel}>{label}</Text>
      <Text style={styles.branchPercent}>{percent}%</Text>
      <View style={styles.branchBarTrack}>
        <View
          style={[
            styles.branchBarFill,
            { width: `${percent}%` as any, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const user = useUserStore((s) => s.user);
  const logout = useUserStore((s) => s.logout);
  const nodes = useSkillTreeStore((s) => s.nodes);

  const name = user?.name ?? "Alex Kim";
  const level = user?.level ?? 4;
  const currentXP = user?.current_xp_in_level ?? 1240;
  const streak = user?.streak ?? 12;
  const bestStreak = user?.best_streak ?? 19;
  const initials = getInitials(name);

  const careerPct = getBranchPercent(nodes, "career") || 80;
  const financePct = getBranchPercent(nodes, "finance") || 60;
  const softskillsPct = getBranchPercent(nodes, "softskills") || 40;
  const wellbeingPct = getBranchPercent(nodes, "wellbeing") || 30;

  const milestones = [
    {
      id: 1,
      title: "Tân binh",
      description: "Đạt 3 ngày liên tiếp",
      icon: "medal-outline",
      unlocked: streak >= 3,
      color: colors.career,
    },
    {
      id: 2,
      title: "Kiên trì",
      description: "Đạt 7 ngày liên tiếp",
      icon: "ribbon-outline",
      unlocked: streak >= 7,
      color: colors.finance,
    },
    {
      id: 3,
      title: "Kỷ luật",
      description: "Đạt 14 ngày liên tiếp",
      icon: "shield-checkmark-outline",
      unlocked: streak >= 14,
      color: colors.softskills,
    },
    {
      id: 4,
      title: "Huyền thoại",
      description: "Đạt 30 ngày liên tiếp",
      icon: "star-outline",
      unlocked: streak >= 30,
      color: colors.wellbeing,
    },
    {
      id: 5,
      title: "Bậc thầy Sự nghiệp",
      description: "Hoàn thành nhánh Sự nghiệp",
      icon: "briefcase",
      unlocked: careerPct >= 100,
      color: colors.career,
    },
    {
      id: 6,
      title: "Bậc thầy Tài chính",
      description: "Hoàn thành nhánh Tài chính",
      icon: "wallet",
      unlocked: financePct >= 100,
      color: colors.finance,
    },
    {
      id: 7,
      title: "Bậc thầy Kỹ năng",
      description: "Hoàn thành nhánh Kỹ năng mềm",
      icon: "people",
      unlocked: softskillsPct >= 100,
      color: colors.softskills,
    },
    {
      id: 8,
      title: "Bậc thầy Sức khỏe",
      description: "Hoàn thành nhánh Sức khỏe",
      icon: "pulse",
      unlocked: wellbeingPct >= 100,
      color: colors.wellbeing,
    },
  ];

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/(auth)/welcome");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Avatar header ──────────────────────────────── */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>LVL {level}</Text>
            </View>
          </View>
          <Text style={styles.userName}>{name}</Text>
          <Text style={styles.userSubtitle}>
            Level {level} · {currentXP.toLocaleString()} XP
          </Text>
        </View>

        {/* ── Premium banner ─────────────────────────────── */}
        <View style={styles.premiumBannerWrapper}>
          <View style={styles.premiumBanner}>
            <Text style={styles.premiumStar}>✦</Text>
            <Text style={styles.premiumTitle}>PREMIUM PLAN · ACTIVE</Text>
            <Text style={styles.premiumRenew}>Expires 17 Apr</Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.textMuted}
              style={styles.premiumChevron}
            />
          </View>
        </View>

        {/* ── Streak card ────────────────────────────────── */}
        <View style={styles.streakCardWrapper}>
          <View style={styles.streakCard}>
            <View
              style={[styles.accentBar, { backgroundColor: colors.warning }]}
            />
            <Text style={styles.streakTitle}>🔥 STREAK: {streak} DAYS</Text>
            <Text style={styles.streakBest}>
              Best record: {bestStreak} days
            </Text>
          </View>
        </View>

        {/* ── Stats row ──────────────────────────────────── */}
        <View style={styles.statsRow}>
          {[
            { value: "47", label: "QUESTS DONE" },
            { value: "23", label: "ACTIVE DAYS" },
            { value: bestStreak, label: "BEST STREAK" },
            { value: "3/4", label: "BRANCHES" },
          ].map((stat, i) => (
            <View key={i} style={styles.statCardWrapper}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Milestone Badges ─────────────────────────── */}
        <View style={styles.milestoneSection}>
          <Text style={styles.sectionTitle}>MILESTONE BADGES</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.milestoneList}
          >
            {milestones.map((m) => (
              <View key={m.id} style={styles.milestoneCardWrapper}>
                <View
                  style={[
                    styles.milestoneCard,
                    !m.unlocked && styles.milestoneLocked,
                    m.unlocked && { borderColor: m.color },
                  ]}
                >
                  {m.unlocked && (
                    <View
                      style={[styles.accentBar, { backgroundColor: m.color }]}
                    />
                  )}
                  <View
                    style={[
                      styles.milestoneIcon,
                      {
                        backgroundColor: m.unlocked
                          ? `${m.color}20`
                          : colors.bgElevated,
                      },
                    ]}
                  >
                    <Ionicons
                      name={m.icon as any}
                      size={24}
                      color={m.unlocked ? m.color : colors.textMuted}
                    />
                  </View>
                  <Text
                    style={[
                      styles.milestoneTitle,
                      !m.unlocked && { color: colors.textMuted },
                    ]}
                  >
                    {m.title}
                  </Text>
                  <Text style={styles.milestoneDesc}>{m.description}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── Skill Branch Progress ──────────────────────── */}
        <View style={styles.branchSection}>
          <Text style={styles.sectionTitle}>SKILL BRANCH PROGRESS</Text>
          <View style={styles.branchRows}>
            <BranchProgressRow
              label="Sự nghiệp"
              percent={careerPct}
              color={colors.career}
            />
            <BranchProgressRow
              label="Tài chính"
              percent={financePct}
              color={colors.finance}
            />
            <BranchProgressRow
              label="Kỹ năng mềm"
              percent={softskillsPct}
              color={colors.softskills}
            />
            <BranchProgressRow
              label="Sức khỏe"
              percent={wellbeingPct}
              color={colors.wellbeing}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.settingsRow}
          onPress={() => router.push("/settings")}
          activeOpacity={0.8}
        >
          <Ionicons
            name="settings-outline"
            size={18}
            color={colors.textPrimary}
          />
          <Text style={styles.settingsText}>Cài đặt</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </TouchableOpacity>

        {/* ── Leaderboard row ────────────────────────────── */}
        <TouchableOpacity
          style={styles.settingsRow}
          onPress={() => router.push("/leaderboard")}
          activeOpacity={0.8}
        >
          <Ionicons
            name="trophy-outline"
            size={18}
            color={colors.textPrimary}
          />
          <Text style={styles.settingsText}>Bảng xếp hạng</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </TouchableOpacity>

        {/* ── Logout row ─────────────────────────────────── */}
        <TouchableOpacity
          style={[styles.settingsRow, { marginTop: 8 }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text style={[styles.settingsText, { color: colors.danger }]}>
            Đăng xuất
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bgBase,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 40,
    },

    // Avatar section
    avatarSection: {
      alignItems: "center",
      paddingVertical: 24,
      paddingHorizontal: 20,
    },
    avatarContainer: {
      position: "relative",
      marginBottom: 12,
    },
    avatarCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.bgSurface,
      borderWidth: 3,
      borderColor: colors.brandPrimary,
      alignItems: "center",
      justifyContent: "center",
      // Neobrutalism shadow
      shadowColor: "#000000",
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
    },
    avatarInitials: {
      fontSize: 24,
      fontWeight: "800", // Display bold
      color: colors.textPrimary,
      textShadowColor: "rgba(0,0,0,0.4)",
      textShadowOffset: { width: 1.5, height: 1.5 },
      textShadowRadius: 0,
    },
    levelBadge: {
      position: "absolute",
      bottom: -2,
      right: -2,
      backgroundColor: colors.bgSurface,
      borderRadius: 9999,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderWidth: 2,
      borderColor: colors.brandPrimary,
      // Neobrutalism shadow
      shadowColor: "#000000",
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 2,
    },
    levelBadgeText: {
      fontSize: 10,
      fontWeight: "800",
      color: colors.brandPrimary,
      letterSpacing: 0.5,
      textShadowColor: "rgba(0,0,0,0.3)",
      textShadowOffset: { width: 0.5, height: 0.5 },
      textShadowRadius: 0,
    },
    userName: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.textPrimary,
      marginBottom: 4,
    },
    userSubtitle: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.textSecondary,
      marginTop: 4,
    },

    // Premium banner
    premiumBannerWrapper: {
      marginHorizontal: 20,
      backgroundColor: "#000000",
      borderRadius: 12,
    },
    premiumBanner: {
      backgroundColor: colors.bgSurface,
      borderRadius: 12,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 2,
      borderColor: colors.brandPrimary,
      transform: [{ translateX: -4 }, { translateY: -4 }],
    },
    premiumStar: {
      fontSize: 16,
      color: colors.brandPrimary,
      marginRight: 8,
    },
    premiumTitle: {
      fontSize: 12,
      fontWeight: "800",
      color: colors.textPrimary,
      flex: 1,
      letterSpacing: 0.5,
    },
    premiumRenew: {
      fontSize: 10,
      fontWeight: "600",
      color: colors.textMuted,
      marginRight: 4,
    },
    premiumChevron: {
      marginLeft: 4,
    },

    // Streak card
    streakCardWrapper: {
      marginHorizontal: 20,
      marginTop: 16,
      backgroundColor: "#000000",
      borderRadius: 16,
    },
    streakCard: {
      backgroundColor: colors.bgElevated,
      borderRadius: 16,
      padding: 20,
      alignItems: "center",
      borderWidth: 2,
      borderColor: colors.warning,
      overflow: "hidden",
      transform: [{ translateX: -4 }, { translateY: -4 }],
    },
    accentBar: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 6,
    },
    streakTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: colors.textPrimary,
      letterSpacing: 0.5,
    },
    streakBest: {
      fontSize: 10,
      fontWeight: "600",
      color: colors.textSecondary,
      marginTop: 6,
    },

    // Stats row
    statsRow: {
      flexDirection: "row",
      gap: 12,
      marginHorizontal: 20,
      marginTop: 16,
    },
    statCardWrapper: {
      flex: 1,
      backgroundColor: "#000000",
      borderRadius: 12,
    },
    statCard: {
      backgroundColor: colors.bgSurface,
      borderRadius: 12,
      padding: 12,
      alignItems: "center",
      borderWidth: 2,
      borderColor: colors.glassBorder,
      transform: [{ translateX: -3 }, { translateY: -3 }],
    },
    statValue: {
      fontSize: 16,
      fontWeight: "800",
      color: colors.textPrimary,
      textShadowColor: "rgba(0,0,0,0.3)",
      textShadowOffset: { width: 1.5, height: 1.5 },
      textShadowRadius: 0,
    },
    statLabel: {
      fontSize: 8,
      fontWeight: "700",
      color: colors.textMuted,
      textAlign: "center",
      marginTop: 6,
      lineHeight: 10,
      letterSpacing: 0.2,
    },

    // Branch section
    branchSection: {
      marginHorizontal: 20,
      marginTop: 24,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "800",
      color: colors.textPrimary,
      marginBottom: 16,
      letterSpacing: 1,
    },
    branchRows: {
      gap: 12,
    },

    // Milestones
    milestoneSection: {
      marginTop: 32,
    },
    milestoneList: {
      paddingLeft: 20,
      paddingRight: 10,
      gap: 16,
      flexDirection: "row",
      paddingBottom: 8,
    },
    milestoneCardWrapper: {
      width: 140,
      backgroundColor: "#000000",
      borderRadius: 20,
    },
    milestoneCard: {
      backgroundColor: colors.bgSurface,
      borderRadius: 20,
      padding: 16,
      alignItems: "center",
      borderWidth: 2,
      borderColor: colors.glassBorder,
      overflow: "hidden",
      transform: [{ translateX: -4 }, { translateY: -4 }],
    },
    milestoneLocked: {
      opacity: 0.7,
      borderColor: colors.glassBorder,
    },
    milestoneIcon: {
      width: 52,
      height: 52,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
      borderWidth: 1.5,
      borderColor: "transparent",
    },
    milestoneTitle: {
      fontSize: 11,
      fontWeight: "800",
      color: colors.textPrimary,
      textAlign: "center",
      marginBottom: 6,
      letterSpacing: 0.2,
    },
    milestoneDesc: {
      fontSize: 9,
      fontWeight: "500",
      color: colors.textMuted,
      textAlign: "center",
      lineHeight: 12,
    },
    branchRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    branchLabel: {
      fontSize: 13,
      color: colors.textPrimary,
      flex: 1,
    },
    branchPercent: {
      fontSize: 13,
      color: colors.textMuted,
      width: 36,
      textAlign: "right",
    },
    branchBarTrack: {
      flex: 2,
      height: 6,
      backgroundColor: "rgba(255,255,255,0.08)",
      borderRadius: 3,
      overflow: "hidden",
    },
    branchBarFill: {
      height: 6,
      borderRadius: 3,
    },

    // Settings rows
    settingsRow: {
      marginHorizontal: 20,
      marginTop: 8,
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      borderRadius: 12,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.08)",
    },
    settingsText: {
      fontSize: 14,
      color: colors.textPrimary,
      flex: 1,
    },

    // Bottom
    bottomSpacer: {
      height: 100,
    },
  });
