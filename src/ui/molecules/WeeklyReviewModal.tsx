/**
 * Weekly review modal — shown on the first open of a new week (Monday).
 * Summarizes last week's activity and previews next week's goals.
 */
import { STREAK_MILESTONES } from "@/src/business-logic/hooks/useGrowthStreak";
import { useMoodStore } from "@/src/business-logic/stores/moodStore";
import { useUserStore } from "@/src/business-logic/stores/userStore";
import { NeoBrutalBox } from "@/src/ui/atoms";
import { AppText } from "@/src/ui/atoms/Text";
import { useTheme } from "@/src/ui/tokens";
import { useEffect, useMemo } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

function getISOWeek(date: Date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum =
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7,
    );
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function WeeklyReviewModal({ visible, onClose }: Props) {
  const { colors } = useTheme();
  const user = useUserStore((s) => s.user);
  const weeklyActivity = useUserStore((s) => s.weeklyActivity);
  const markShown = useMoodStore((s) => s.markWeeklyReviewShown);

  useEffect(() => {
    if (visible) {
      markShown(getISOWeek());
    }
  }, [visible]);

  const stats = useMemo(() => {
    const thisWeek = weeklyActivity.slice(-7);
    const prevWeek = weeklyActivity.slice(-14, -7);

    const thisQuests = thisWeek.reduce((s, d) => s + d.questsCompleted, 0);
    const prevQuests = prevWeek.reduce((s, d) => s + d.questsCompleted, 0);
    const thisXP = thisWeek.reduce((s, d) => s + d.xpEarned, 0);
    const prevXP = prevWeek.reduce((s, d) => s + d.xpEarned, 0);

    const streak = user?.streak ?? 0;
    const nextMilestone = STREAK_MILESTONES.find((m) => m > streak);
    const daysToMilestone = nextMilestone ? nextMilestone - streak : null;

    const questDiff =
      prevQuests > 0
        ? Math.round(((thisQuests - prevQuests) / prevQuests) * 100)
        : null;
    const xpDiff =
      prevXP > 0 ? Math.round(((thisXP - prevXP) / prevXP) * 100) : null;

    return {
      thisQuests,
      prevQuests,
      thisXP,
      prevXP,
      questDiff,
      xpDiff,
      streak,
      nextMilestone,
      daysToMilestone,
    };
  }, [weeklyActivity, user]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.bgElevated }]}>
          <View
            style={[styles.handle, { backgroundColor: colors.glassBorder }]}
          />

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <AppText
                variant="title"
                color={colors.textPrimary}
                style={styles.title}
              >
                Tuần này của bạn
              </AppText>

              {/* Stats */}
              <View style={styles.statsRow}>
                <NeoBrutalBox
                  borderColor={colors.brandPrimary}
                  backgroundColor={colors.bgSurface}
                  shadowColor={colors.brandPrimary}
                  shadowOffsetX={3}
                  shadowOffsetY={3}
                  borderWidth={1.5}
                  borderRadius={14}
                  style={styles.statBox}
                  contentStyle={styles.statContent}
                >
                  <AppText
                    variant="displayLG"
                    color={colors.brandPrimary}
                    style={styles.statNum}
                  >
                    {stats.thisQuests}
                  </AppText>
                  <AppText variant="caption" color={colors.textMuted}>
                    Nhiệm vụ
                  </AppText>
                </NeoBrutalBox>

                <NeoBrutalBox
                  borderColor={colors.finance}
                  backgroundColor={colors.bgSurface}
                  shadowColor={colors.finance}
                  shadowOffsetX={3}
                  shadowOffsetY={3}
                  borderWidth={1.5}
                  borderRadius={14}
                  style={styles.statBox}
                  contentStyle={styles.statContent}
                >
                  <AppText
                    variant="displayLG"
                    color={colors.finance}
                    style={styles.statNum}
                  >
                    {stats.thisXP}
                  </AppText>
                  <AppText variant="caption" color={colors.textMuted}>
                    XP kiếm được
                  </AppText>
                </NeoBrutalBox>

                <NeoBrutalBox
                  borderColor={colors.warning}
                  backgroundColor={colors.bgSurface}
                  shadowColor={colors.warning}
                  shadowOffsetX={3}
                  shadowOffsetY={3}
                  borderWidth={1.5}
                  borderRadius={14}
                  style={styles.statBox}
                  contentStyle={styles.statContent}
                >
                  <AppText
                    variant="displayLG"
                    color={colors.warning}
                    style={styles.statNum}
                  >
                    {stats.streak}
                  </AppText>
                  <AppText variant="caption" color={colors.textMuted}>
                    🔥 Streak
                  </AppText>
                </NeoBrutalBox>
              </View>

              {/* Comparison with last week */}
              {(stats.questDiff !== null || stats.xpDiff !== null) && (
                <View
                  style={[
                    styles.comparison,
                    {
                      backgroundColor: colors.bgSurface,
                      borderColor: colors.glassBorder,
                    },
                  ]}
                >
                  <AppText
                    variant="caption"
                    color={colors.textSecondary}
                    style={styles.compTitle}
                  >
                    So với tuần trước:
                  </AppText>
                  {stats.questDiff !== null && (
                    <AppText
                      variant="caption"
                      color={
                        stats.questDiff >= 0 ? colors.finance : colors.danger
                      }
                    >
                      • Nhiệm vụ: {stats.thisQuests} vs {stats.prevQuests} (
                      {stats.questDiff >= 0 ? "+" : ""}
                      {stats.questDiff}%) {stats.questDiff >= 0 ? "⬆️" : "⬇️"}
                    </AppText>
                  )}
                  {stats.xpDiff !== null && (
                    <AppText
                      variant="caption"
                      color={stats.xpDiff >= 0 ? colors.finance : colors.danger}
                    >
                      • XP: {stats.thisXP} vs {stats.prevXP} (
                      {stats.xpDiff >= 0 ? "+" : ""}
                      {stats.xpDiff}%) {stats.xpDiff >= 0 ? "⬆️" : "⬇️"}
                    </AppText>
                  )}
                </View>
              )}

              {/* Next week goals */}
              <View
                style={[
                  styles.nextWeek,
                  {
                    borderColor: colors.brandPrimary + "55",
                    backgroundColor: colors.brandPrimary + "0D",
                  },
                ]}
              >
                <AppText
                  variant="caption"
                  color={colors.brandPrimary}
                  style={styles.nextWeekTitle}
                >
                  Tuần tới:
                </AppText>
                {stats.daysToMilestone !== null && (
                  <AppText variant="caption" color={colors.textSecondary}>
                    • Streak milestone: ngày {stats.nextMilestone} 🎯
                  </AppText>
                )}
                <AppText variant="caption" color={colors.textSecondary}>
                  • Mục tiêu: {Math.max(stats.thisQuests, 5)} nhiệm vụ
                </AppText>
              </View>

              <TouchableOpacity
                style={[
                  styles.closeBtn,
                  { backgroundColor: colors.brandPrimary },
                ]}
                onPress={onClose}
              >
                <AppText
                  variant="title"
                  color="#fff"
                  style={styles.closeBtnText}
                >
                  Bắt đầu tuần mới →
                </AppText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 44,
    maxHeight: "85%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    gap: 20,
    alignItems: "center",
  },
  star: {
    fontSize: 48,
  },
  title: {
    fontWeight: "900",
    fontSize: 22,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
    justifyContent: "center",
  },
  statBox: {
    flex: 1,
  },
  statContent: {
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    gap: 4,
  },
  statNum: {
    fontWeight: "900",
    fontSize: 28,
  },
  comparison: {
    width: "100%",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  compTitle: {
    fontWeight: "900",
    marginBottom: 4,
    fontSize: 12,
  },
  nextWeek: {
    width: "100%",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  nextWeekTitle: {
    fontWeight: "900",
    fontSize: 12,
    marginBottom: 4,
  },
  closeBtn: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  closeBtnText: {
    fontWeight: "900",
    letterSpacing: 0.5,
  },
});
