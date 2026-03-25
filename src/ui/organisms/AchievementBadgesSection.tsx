/**
 * AchievementBadgesSection — collectible badge showcase for the profile screen.
 *
 * Badge categories:
 *  - Streak: based on user.streak / best_streak
 *  - Branch: based on quests_completed sum per branch (from skillTreeStore nodes)
 *  - XP: based on user.total_xp
 *  - Special: perfectionist (all daily quests done), etc.
 */

import { NeoBrutalBox } from "@/src/ui/atoms";
import { AppText } from "@/src/ui/atoms/Text";
import { useSkillTreeStore } from "@/src/business-logic/stores/skillTreeStore";
import { useUserStore } from "@/src/business-logic/stores/userStore";
import { useTheme } from "@/src/ui/tokens";
import { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

interface Badge {
  id: string;
  emoji: string;
  title: string;
  description: string;
  unlocked: boolean;
  color: string;
  category: "streak" | "branch" | "xp" | "special";
}

function useBadges(): Badge[] {
  const user = useUserStore((s) => s.user);
  const dailyStats = useUserStore((s) => s.dailyStats);
  const nodes = useSkillTreeStore((s) => s.nodes);
  const { colors } = useTheme();

  return useMemo(() => {
    const streak = user?.streak ?? 0;
    const bestStreak = user?.best_streak ?? 0;
    const totalXP = user?.total_xp ?? 0;

    // Per-branch quests completed from skill tree nodes
    const careerDone = nodes
      .filter((n) => n.branch === "career")
      .reduce((s, n) => s + n.quests_completed, 0);
    const financeDone = nodes
      .filter((n) => n.branch === "finance")
      .reduce((s, n) => s + n.quests_completed, 0);
    const wellbeingDone = nodes
      .filter((n) => n.branch === "wellbeing")
      .reduce((s, n) => s + n.quests_completed, 0);
    const softDone = nodes
      .filter((n) => n.branch === "softskills")
      .reduce((s, n) => s + n.quests_completed, 0);

    // Total daily quests assigned today (as denominator for Perfectionist)
    const questsDoneToday = dailyStats.quests_completed_today;

    return [
      // ── Streak ──────────────────────────────────────────────────────────
      {
        id: "streak_seedling",
        emoji: "🌱",
        title: "Seedling",
        description: "Ngày đầu tiên",
        unlocked: bestStreak >= 1,
        color: "#4ade80",
        category: "streak" as const,
      },
      {
        id: "streak_on_fire",
        emoji: "🔥",
        title: "On Fire",
        description: "Streak 7 ngày",
        unlocked: bestStreak >= 7,
        color: "#f97316",
        category: "streak" as const,
      },
      {
        id: "streak_grinder",
        emoji: "💪",
        title: "Grinder",
        description: "Streak 30 ngày",
        unlocked: bestStreak >= 30,
        color: "#eab308",
        category: "streak" as const,
      },
      {
        id: "streak_legend",
        emoji: "👑",
        title: "Legend",
        description: "Streak 100 ngày",
        unlocked: bestStreak >= 100,
        color: "#ffd700",
        category: "streak" as const,
      },

      // ── Branch ──────────────────────────────────────────────────────────
      {
        id: "branch_career",
        emoji: "💼",
        title: "Career Climber",
        description: "10 career quests",
        unlocked: careerDone >= 10,
        color: colors.career,
        category: "branch" as const,
      },
      {
        id: "branch_finance",
        emoji: "💰",
        title: "Money Moves",
        description: "10 finance quests",
        unlocked: financeDone >= 10,
        color: colors.finance,
        category: "branch" as const,
      },
      {
        id: "branch_wellbeing",
        emoji: "🧘",
        title: "Zen Master",
        description: "10 wellbeing quests",
        unlocked: wellbeingDone >= 10,
        color: colors.wellbeing,
        category: "branch" as const,
      },
      {
        id: "branch_soft",
        emoji: "🎤",
        title: "People Person",
        description: "10 soft skills quests",
        unlocked: softDone >= 10,
        color: colors.softskills,
        category: "branch" as const,
      },

      // ── XP ──────────────────────────────────────────────────────────────
      {
        id: "xp_first_blood",
        emoji: "⚡",
        title: "First Blood",
        description: "Đạt 100 XP",
        unlocked: totalXP >= 100,
        color: "#facc15",
        category: "xp" as const,
      },
      {
        id: "xp_rocket",
        emoji: "🚀",
        title: "Rocket",
        description: "Đạt 1,000 XP",
        unlocked: totalXP >= 1000,
        color: "#60a5fa",
        category: "xp" as const,
      },
      {
        id: "xp_diamond",
        emoji: "💎",
        title: "Diamond",
        description: "Đạt 10,000 XP",
        unlocked: totalXP >= 10000,
        color: "#a78bfa",
        category: "xp" as const,
      },

      // ── Special ─────────────────────────────────────────────────────────
      {
        id: "special_perfectionist",
        emoji: "🎯",
        title: "Perfectionist",
        description: "Hoàn thành tất cả quests trong 1 ngày",
        unlocked: questsDoneToday >= 5,
        color: "#ec4899",
        category: "special" as const,
      },
      {
        id: "special_comeback",
        emoji: "🔄",
        title: "Comeback",
        description: "Quay lại sau 7+ ngày",
        unlocked: bestStreak >= 1 && streak === 1 && (user?.last_active_date
          ? (Date.now() - new Date(user.last_active_date).getTime()) > 7 * 86400000
          : false),
        color: "#fb923c",
        category: "special" as const,
      },
    ];
  }, [user, nodes, dailyStats, colors]);
}

export function AchievementBadgesSection() {
  const { colors } = useTheme();
  const badges = useBadges();
  const unlocked = badges.filter((b) => b.unlocked).length;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <AppText style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          ACHIEVEMENT BADGES
        </AppText>
        <AppText variant="caption" color={colors.textMuted}>
          {unlocked}/{badges.length}
        </AppText>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {badges.map((badge) => (
          <View key={badge.id} style={{ opacity: badge.unlocked ? 1 : 0.45 }}>
          <NeoBrutalBox
            borderColor={badge.unlocked ? badge.color : colors.glassBorder}
            backgroundColor={colors.bgSurface}
            shadowColor={badge.unlocked ? badge.color : "#000"}
            shadowOffsetX={badge.unlocked ? 5 : 2}
            shadowOffsetY={badge.unlocked ? 5 : 2}
            borderWidth={2}
            borderRadius={18}
            style={styles.badgeBox}
            contentStyle={styles.badgeContent}
          >
            {badge.unlocked && (
              <View
                style={[styles.accentBar, { backgroundColor: badge.color }]}
              />
            )}
            <AppText style={styles.badgeEmoji}>{badge.emoji}</AppText>
            <AppText
              variant="caption"
              style={[
                styles.badgeTitle,
                { color: badge.unlocked ? colors.textPrimary : colors.textMuted },
              ]}
              numberOfLines={1}
            >
              {badge.title}
            </AppText>
            <AppText
              variant="caption"
              color={colors.textMuted}
              style={styles.badgeDesc}
              numberOfLines={2}
            >
              {badge.description}
            </AppText>
            {badge.unlocked && (
              <View
                style={[styles.unlockedDot, { backgroundColor: badge.color }]}
              />
            )}
          </NeoBrutalBox>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 28 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  list: {
    paddingLeft: 20,
    paddingRight: 10,
    gap: 12,
    flexDirection: "row",
    paddingBottom: 8,
  },
  badgeBox: {
    width: 110,
    height: 130,
  },
  badgeContent: {
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    gap: 4,
    height: "100%",
  },
  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  badgeEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  badgeTitle: {
    fontWeight: "900",
    fontSize: 10,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  badgeDesc: {
    fontSize: 9,
    textAlign: "center",
    lineHeight: 12,
  },
  unlockedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
  },
});
