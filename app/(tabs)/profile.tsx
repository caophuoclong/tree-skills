import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useRef } from "react";
import {
  Alert,
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSkillTreeStore } from "@/src/business-logic/stores/skillTreeStore";
import { useUserStore } from "@/src/business-logic/stores/userStore";
import type { Branch } from "@/src/business-logic/types";
import {
  Emoji,
  NeoBrutalAccent,
  NeoBrutalBox,
  NeoBrutalThemed,
  ProgressBar,
} from "@/src/ui/atoms";
import {
  BranchProgressList,
  ProfileHeader,
  ProfileStatsRow,
  WeeklyChart,
} from "@/src/ui/molecules";
import { IColors, useTheme } from "@/src/ui/tokens";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  const bn = nodes.filter((n) => n.branch === branch);
  if (bn.length === 0) return 0;
  return Math.round(
    (bn.filter((n) => n.status === "completed").length / bn.length) * 100,
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { colors } = useTheme();
  const user = useUserStore((s) => s.user);
  const logout = useUserStore((s) => s.logout);
  const weeklyActivity = useUserStore((s) => s.weeklyActivity);
  const nodes = useSkillTreeStore((s) => s.nodes);
  const premiumShimmer = useRef(new Animated.Value(-1)).current;
  const styles = createStyles(colors);

  const name = user?.name ?? "Alex Kim";
  const level = user?.level ?? 4;
  const currentXP = user?.current_xp_in_level ?? 1240;
  const streak = user?.streak ?? 12;
  const bestStreak = user?.best_streak ?? 19;
  const initials = getInitials(name);

  const careerPct = getBranchPercent(nodes, "career") || 80;
  const financePct = getBranchPercent(nodes, "finance") || 60;
  const softPct = getBranchPercent(nodes, "softskills") || 40;
  const wellPct = getBranchPercent(nodes, "wellbeing") || 30;

  const milestones = useMemo(
    () => [
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
        unlocked: softPct >= 100,
        color: colors.softskills,
      },
      {
        id: 8,
        title: "Bậc thầy Sức khỏe",
        description: "Hoàn thành nhánh Sức khỏe",
        icon: "pulse",
        unlocked: wellPct >= 100,
        color: colors.wellbeing,
      },
    ],
    [streak, careerPct, financePct, softPct, wellPct, colors],
  );

  const STATS = useMemo(
    () => [
      { value: "47", label: "QUESTS\nDONE" },
      { value: "23", label: "ACTIVE\nDAYS" },
      { value: bestStreak, label: "BEST\nSTREAK" },
      { value: "3/4", label: "BRANCHES\nDONE" },
    ],
    [bestStreak],
  );

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

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(premiumShimmer, {
        toValue: 2,
        duration: 2300,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();

    return () => loop.stop();
  }, [premiumShimmer]);

  const premiumShimmerTranslateX = premiumShimmer.interpolate({
    inputRange: [-1, 2],
    outputRange: [-140, 260],
  });

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.bgBase }]}
      edges={["top"]}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Avatar header ─────────────────────────────────────────────────── */}
        <ProfileHeader
          name={name}
          level={level}
          totalXP={currentXP}
          initials={initials}
        />

        {/* ── Premium banner ────────────────────────────────────────────────── */}
        <NeoBrutalBox
          borderColor={colors.brandPrimary}
          shadowColor="#000"
          shadowOffsetX={4}
          shadowOffsetY={4}
          borderWidth={2}
          style={{ marginHorizontal: 20 }}
          contentStyle={styles.premiumContent}
          onPress={() => {}}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              styles.premiumShimmer,
              {
                transform: [
                  { translateX: premiumShimmerTranslateX },
                  { skewX: "-18deg" },
                ],
              },
            ]}
          />
          <Text style={[styles.premiumStar, { color: colors.brandPrimary }]}>
            ✦
          </Text>
          <Text style={[styles.premiumTitle, { color: colors.textPrimary }]}>
            PREMIUM PLAN · ACTIVE
          </Text>
          <Text style={[styles.premiumRenew, { color: colors.textMuted }]}>
            Expires 17 Apr
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </NeoBrutalBox>

        {/* ── Streak card ───────────────────────────────────────────────────── */}
        <NeoBrutalBox
          borderColor={colors.warning}
          backgroundColor={colors.bgElevated}
          shadowColor={colors.warning}
          shadowOffsetX={5}
          shadowOffsetY={5}
          borderWidth={2}
          borderRadius={16}
          style={{ marginHorizontal: 20, marginTop: 16 }}
          contentStyle={styles.streakContent}
        >
          {/* Left accent bar */}
          <View
            style={[styles.accentBar, { backgroundColor: colors.warning }]}
          />
          <Text style={[styles.streakTitle, { color: colors.textPrimary }]}>
            <Emoji size={18}>🔥</Emoji> STREAK: {streak} DAYS
          </Text>
          <Text style={[styles.streakBest, { color: colors.textSecondary }]}>
            Best record: {bestStreak} days
          </Text>
        </NeoBrutalBox>

        {/* ── Stats row ─────────────────────────────────────────────────────── */}
        <ProfileStatsRow stats={STATS} />

        {/* ── Milestone Badges ──────────────────────────────────────────────── */}
        <View style={styles.milestoneSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            MILESTONE BADGES
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.milestoneList}
          >
            {milestones.map((m) => (
              <NeoBrutalBox
                key={m.id}
                borderColor={m.unlocked ? m.color : colors.glassBorder}
                backgroundColor={colors.bgSurface}
                shadowColor={m.unlocked ? m.color : "#000"}
                shadowOffsetX={m.unlocked ? 5 : 3}
                shadowOffsetY={m.unlocked ? 5 : 3}
                borderWidth={2}
                borderRadius={20}
                style={{
                  width: 160,
                  opacity: m.unlocked ? 1 : 0.55,
                  height: 130,
                }}
                contentStyle={styles.milestoneContent}
              >
                {/* Color accent bar on unlocked */}
                {m.unlocked && (
                  <View
                    style={[styles.accentBar, { backgroundColor: m.color }]}
                  />
                )}
                <View
                  style={{
                    height: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
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
                      {
                        color: m.unlocked
                          ? colors.textPrimary
                          : colors.textMuted,
                      },
                    ]}
                  >
                    {m.title}
                  </Text>
                  <Text
                    style={[styles.milestoneDesc, { color: colors.textMuted }]}
                    numberOfLines={1}
                  >
                    {m.description}
                  </Text>
                </View>
              </NeoBrutalBox>
            ))}
          </ScrollView>
        </View>

        {/* ── Weekly Activity Chart ─────────────────────────────────────────── */}
        <View style={{ marginHorizontal: 20, marginTop: 24 }}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            THIS WEEK
          </Text>
          <NeoBrutalThemed
            shadowOffsetX={4}
            shadowOffsetY={4}
            borderWidth={2}
            borderRadius={16}
            contentStyle={{ paddingVertical: 20, paddingHorizontal: 16 }}
          >
            <WeeklyChart data={weeklyActivity} />
          </NeoBrutalThemed>
        </View>

        {/* ── Skill Branch Progress ─────────────────────────────────────────── */}
        <BranchProgressList
          branches={[
            {
              label: "Sự nghiệp",
              percent: careerPct,
              color: colors.career,
              emoji: "💼",
            },
            {
              label: "Tài chính",
              percent: financePct,
              color: colors.finance,
              emoji: "💰",
            },
            {
              label: "Kỹ năng mềm",
              percent: softPct,
              color: colors.softskills,
              emoji: "💬",
            },
            {
              label: "Sức khỏe",
              percent: wellPct,
              color: colors.wellbeing,
              emoji: "🧘",
            },
          ]}
        />

        {/* ── Navigation rows ───────────────────────────────────────────────── */}
        <View style={styles.navSection}>
          <NeoBrutalBox
            borderColor={colors.glassBorder}
            backgroundColor={colors.bgSurface}
            shadowColor="#000"
            shadowOffsetX={3}
            shadowOffsetY={3}
            borderWidth={1.5}
            borderRadius={14}
            onPress={() => router.push("/roadmap")}
            contentStyle={styles.navContent}
          >
            <Ionicons
              name="map-outline"
              size={20}
              color={colors.textPrimary}
            />
            <Text style={[styles.navText, { color: colors.textPrimary }]}>
              Lộ Trình Dài Hạn
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.textMuted}
            />
          </NeoBrutalBox>

          <NeoBrutalBox
            borderColor={colors.glassBorder}
            backgroundColor={colors.bgSurface}
            shadowColor="#000"
            shadowOffsetX={3}
            shadowOffsetY={3}
            borderWidth={1.5}
            borderRadius={14}
            onPress={() => router.push("/settings")}
            contentStyle={styles.navContent}
          >
            <Ionicons
              name="settings-outline"
              size={20}
              color={colors.textPrimary}
            />
            <Text style={[styles.navText, { color: colors.textPrimary }]}>
              Cài đặt
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.textMuted}
            />
          </NeoBrutalBox>

          <NeoBrutalBox
            borderColor={colors.glassBorder}
            backgroundColor={colors.bgSurface}
            shadowColor="#000"
            shadowOffsetX={3}
            shadowOffsetY={3}
            borderWidth={1.5}
            borderRadius={14}
            onPress={() => router.push("/leaderboard")}
            contentStyle={styles.navContent}
          >
            <Ionicons
              name="trophy-outline"
              size={20}
              color={colors.textPrimary}
            />
            <Text style={[styles.navText, { color: colors.textPrimary }]}>
              Bảng xếp hạng
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.textMuted}
            />
          </NeoBrutalBox>

          {/* Logout — danger accent */}
          <NeoBrutalAccent
            accentColor={`${colors.danger}`}
            strokeColor={colors.textPrimary}
            shadowOffsetX={3}
            shadowOffsetY={3}
            borderWidth={1.5}
            borderRadius={14}
            onPress={handleLogout}
            contentStyle={styles.navContent}
          >
            <Ionicons
              name="log-out-outline"
              size={20}
              color={colors.textPrimary}
            />
            <Text style={[styles.navText, { color: colors.textPrimary }]}>
              Đăng xuất
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={`${colors.danger}80`}
            />
          </NeoBrutalAccent>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (colors: IColors) =>
  StyleSheet.create({
    container: { flex: 1 },
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 40 },

    // Premium banner
    premiumContent: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 8,
      position: "relative",
      overflow: "hidden",
    },
    premiumShimmer: {
      position: "absolute",
      top: -8,
      bottom: -8,
      width: 72,
      backgroundColor: `${colors.brandPrimary}22`,
    },
    premiumStar: { fontSize: 16 },
    premiumTitle: {
      fontSize: 12,
      fontWeight: "900",
      flex: 1,
      letterSpacing: 0.5,
    },
    premiumRenew: {
      fontSize: 10,
      fontFamily: "SpaceGrotesk-SemiBold",
      fontWeight: "600",
    },

    // Streak
    streakContent: {
      alignItems: "center",
      paddingVertical: 20,
      paddingHorizontal: 20,
    },
    accentBar: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 6,
    },
    streakTitle: { fontSize: 18, fontWeight: "900", letterSpacing: 0.5 },
    streakBest: {
      fontSize: 10,
      fontFamily: "SpaceGrotesk-SemiBold",
      fontWeight: "600",
      marginTop: 6,
    },

    // Milestones
    milestoneSection: { marginTop: 32 },
    milestoneList: {
      paddingLeft: 20,
      paddingRight: 10,
      gap: 14,
      flexDirection: "row",
      paddingBottom: 8,
    },
    milestoneContent: { alignItems: "center", padding: 16 },
    milestoneIcon: {
      width: 52,
      height: 52,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    milestoneTitle: {
      fontSize: 11,
      fontWeight: "900",
      textAlign: "center",
      marginBottom: 5,
      letterSpacing: 0.2,
    },
    milestoneDesc: {
      fontSize: 9,
      fontFamily: "SpaceGrotesk-Medium",
      fontWeight: "500",
      textAlign: "center",
      lineHeight: 12,
    },

    // Navigation rows
    navSection: { marginHorizontal: 20, marginTop: 24, gap: 10 },
    navContent: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 12,
    },
    navText: {
      fontSize: 14,
      fontFamily: "SpaceGrotesk-SemiBold",
      fontWeight: "600",
      flex: 1,
    },

    // Section title
    sectionTitle: {
      fontSize: 13,
      fontWeight: "900",
      marginBottom: 14,
      letterSpacing: 1.2,
      paddingHorizontal: 20,
    },
  });
