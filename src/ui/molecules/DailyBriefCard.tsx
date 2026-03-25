/**
 * Personalized daily brief card — shown once per day at top of home screen.
 * Auto-dismisses after first quest completion or manual tap.
 */
import { AppText } from "@/src/ui/atoms/Text";
import { NeoBrutalBox } from "@/src/ui/atoms";
import { useQuestStore } from "@/src/business-logic/stores/questStore";
import { useSkillTreeStore } from "@/src/business-logic/stores/skillTreeStore";
import { useUserStore } from "@/src/business-logic/stores/userStore";
import { STREAK_MILESTONES } from "@/src/business-logic/hooks/useGrowthStreak";
import { useTheme } from "@/src/ui/tokens";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import type { Branch } from "@/src/business-logic/types";

const STORAGE_KEY = "@dailyBriefDismissedDate";

const BRANCH_LABEL: Record<Branch, string> = {
  career: "Sự nghiệp",
  finance: "Tài chính",
  softskills: "Kỹ năng mềm",
  wellbeing: "Sức khỏe",
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Chào buổi sáng";
  if (h < 17) return "Chào buổi chiều";
  return "Chào buổi tối";
}

export function DailyBriefCard() {
  const { colors } = useTheme();
  const user = useUserStore((s) => s.user);
  const nodes = useSkillTreeStore((s) => s.nodes);
  const dailyQuests = useQuestStore((s) => s.dailyQuests);
  const [dismissed, setDismissed] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored !== today) setDismissed(false);
    });
  }, [today]);

  // Auto-dismiss when any quest completed
  const anyCompleted = dailyQuests.some((q) => q.completed_at !== null);
  useEffect(() => {
    if (anyCompleted && !dismissed) handleDismiss();
  }, [anyCompleted]);

  const handleDismiss = () => {
    setDismissed(true);
    AsyncStorage.setItem(STORAGE_KEY, today).catch(() => {});
  };

  const brief = useMemo(() => {
    if (!user) return null;
    const streak = user.streak;
    const name = user.name?.split(" ").at(-1) ?? user.name ?? "";

    // Streak milestone countdown
    const nextMilestone = STREAK_MILESTONES.find((m) => m > streak);
    const daysToMilestone = nextMilestone ? nextMilestone - streak : null;

    // Most neglected branch (least quests completed)
    const branchCompletions: Record<Branch, number> = {
      career: 0,
      finance: 0,
      softskills: 0,
      wellbeing: 0,
    };
    nodes.forEach((n) => {
      branchCompletions[n.branch] =
        (branchCompletions[n.branch] ?? 0) + n.quests_completed;
    });
    const neglectedBranch = (
      Object.entries(branchCompletions) as [Branch, number][]
    ).sort(([, a], [, b]) => a - b)[0]?.[0];

    const pendingCount = dailyQuests.filter((q) => q.completed_at === null).length;

    const items: string[] = [];
    if (pendingCount > 0) items.push(`📋 ${pendingCount} nhiệm vụ đang chờ`);
    if (daysToMilestone !== null && daysToMilestone <= 3) {
      items.push(`🔥 Streak ngày ${streak} — còn ${daysToMilestone} ngày đến milestone ${nextMilestone}!`);
    } else if (streak > 0) {
      items.push(`🔥 Streak ngày thứ ${streak} — tiếp tục nhé!`);
    }
    if (neglectedBranch) {
      const label = BRANCH_LABEL[neglectedBranch];
      items.push(`💡 ${label} cần được chú ý hôm nay`);
    }

    return { name, greeting: getGreeting(), items };
  }, [user, nodes, dailyQuests]);

  if (dismissed || !brief || brief.items.length === 0) return null;

  return (
    <NeoBrutalBox
      borderColor={colors.brandPrimary}
      backgroundColor={colors.bgSurface}
      shadowColor={colors.brandPrimary}
      shadowOffsetX={4}
      shadowOffsetY={4}
      borderWidth={2}
      borderRadius={16}
      style={styles.container}
      contentStyle={styles.content}
    >
      <View style={[styles.accentBar, { backgroundColor: colors.brandPrimary }]} />
      <View style={styles.top}>
        <AppText variant="body" color={colors.textPrimary} style={styles.greeting}>
          {brief.greeting}, {brief.name}! ☀️
        </AppText>
        <TouchableOpacity onPress={handleDismiss} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <AppText variant="caption" color={colors.textMuted}>
            ✕
          </AppText>
        </TouchableOpacity>
      </View>

      <View style={styles.items}>
        {brief.items.map((item, i) => (
          <AppText key={i} variant="caption" color={colors.textSecondary} style={styles.item}>
            {item}
          </AppText>
        ))}
      </View>
    </NeoBrutalBox>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 12,
  },
  content: {
    padding: 16,
    gap: 10,
  },
  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greeting: {
    fontWeight: "900",
    flex: 1,
    fontSize: 15,
  },
  items: {
    gap: 6,
  },
  item: {
    fontSize: 12,
    lineHeight: 17,
  },
});
