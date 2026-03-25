/**
 * Persistent streak milestone countdown banner.
 * Shows when user is 1–3 days from a streak milestone (7, 14, 30, 60, 100).
 */
import { AppText } from "@/src/ui/atoms/Text";
import { STREAK_MILESTONES } from "@/src/business-logic/hooks/useGrowthStreak";
import { useMoodStore } from "@/src/business-logic/stores/moodStore";
import { useTheme } from "@/src/ui/tokens";
import { StyleSheet, View } from "react-native";

interface Props {
  streak: number;
}

export function StreakMilestonePreview({ streak }: Props) {
  const { colors } = useTheme();
  const graceDayActive = useMoodStore((s) => s.graceDayActive);

  // Grace day warning takes precedence
  if (graceDayActive) {
    return (
      <View
        style={[
          styles.banner,
          { backgroundColor: colors.warning + "18", borderColor: colors.warning },
        ]}
      >
        <AppText style={styles.emoji}>😅</AppText>
        <AppText variant="caption" color={colors.warning} style={styles.text}>
          Streak ơi ngủ quên hôm qua — hoàn thành 2 nhiệm vụ hôm nay để cứu streak!
        </AppText>
      </View>
    );
  }

  const nextMilestone = STREAK_MILESTONES.find((m) => m > streak);
  if (!nextMilestone) return null;

  const daysLeft = nextMilestone - streak;
  if (daysLeft > 3) return null;

  return (
    <View
      style={[
        styles.banner,
        { backgroundColor: colors.warning + "15", borderColor: colors.warning + "88" },
      ]}
    >
      <AppText style={styles.emoji}>🎯</AppText>
      <AppText variant="caption" color={colors.warning} style={styles.text}>
        Còn {daysLeft} ngày nữa là streak {nextMilestone} ngày! Đừng bỏ cuộc nhé
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 10,
  },
  emoji: {
    fontSize: 18,
  },
  text: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },
});
