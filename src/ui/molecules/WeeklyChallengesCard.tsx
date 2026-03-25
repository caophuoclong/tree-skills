import { AppText } from "@/src/ui/atoms/Text";
import { useChallengeStore } from "@/src/business-logic/stores/challengeStore";
import { NeoBrutalBox } from "@/src/ui/atoms";
import { useTheme } from "@/src/ui/tokens";
import { Spacing } from "@/src/ui/tokens/spacing";
import { useMemo } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

const BRANCH_COLORS: Record<string, string> = {
  career: "#3b82f6",
  finance: "#22c55e",
  softskills: "#f59e0b",
  wellbeing: "#a855f7",
};

const BRANCH_EMOJI: Record<string, string> = {
  career: "💼",
  finance: "💰",
  softskills: "🎤",
  wellbeing: "🧘",
};

function getTimeLeft(endDate: string): string {
  const ms = new Date(endDate).getTime() - Date.now();
  if (ms <= 0) return "Ended";
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h left`;
  return `${hours}h left`;
}

export function WeeklyChallengesCard() {
  const { colors } = useTheme();
  const challenges = useChallengeStore((s) => s.challenges);
  const activeChallenges = useChallengeStore((s) => s.activeChallenges);
  const getProgress = useChallengeStore((s) => s.getProgress);
  const isCompleted = useChallengeStore((s) => s.isCompleted);
  const joinChallenge = useChallengeStore((s) => s.joinChallenge);
  const leaveChallenge = useChallengeStore((s) => s.leaveChallenge);

  const active = useMemo(
    () => challenges.filter((c) => new Date(c.endDate).getTime() > Date.now()),
    [challenges],
  );

  if (active.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <AppText variant="caption" color={colors.textPrimary} style={styles.sectionTitle}>
          WEEKLY CHALLENGES
        </AppText>
        <AppText variant="caption" color={colors.textMuted}>
          🎯 {activeChallenges.length} joined
        </AppText>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {active.map((ch) => {
          const progress = getProgress(ch.id);
          const done = isCompleted(ch.id);
          const joined = activeChallenges.includes(ch.id);
          const pct = Math.min((progress / ch.targetCount) * 100, 100);
          const branchColor = BRANCH_COLORS[ch.branch] ?? colors.brandPrimary;
          const emoji = BRANCH_EMOJI[ch.branch] ?? "🎯";

          return (
            <NeoBrutalBox
              key={ch.id}
              borderColor={done ? branchColor : joined ? branchColor : colors.glassBorder}
              backgroundColor={colors.bgSurface}
              shadowColor={done ? branchColor : "#000"}
              shadowOffsetX={done ? 4 : 3}
              shadowOffsetY={done ? 4 : 3}
              borderWidth={2}
              borderRadius={16}
              style={{ width: 200, opacity: done ? 0.85 : 1 }}
              contentStyle={styles.card}
            >
              {/* Accent bar */}
              <View style={[styles.accentBar, { backgroundColor: branchColor }]} />

              {/* Header row */}
              <View style={styles.cardHeader}>
                <AppText style={styles.emoji}>{emoji}</AppText>
                <View style={styles.cardMeta}>
                  <AppText
                    variant="caption"
                    color={done ? branchColor : colors.textPrimary}
                    style={styles.cardTitle}
                    numberOfLines={1}
                  >
                    {done ? "✅ " : ""}
                    {ch.title}
                  </AppText>
                  <AppText variant="caption" color={colors.textMuted} style={styles.timeLeft}>
                    {getTimeLeft(ch.endDate)}
                  </AppText>
                </View>
              </View>

              {/* Description */}
              <AppText
                variant="caption"
                color={colors.textSecondary}
                style={styles.desc}
                numberOfLines={2}
              >
                {ch.description}
              </AppText>

              {/* Progress bar */}
              <View style={[styles.progressBg, { backgroundColor: colors.bgElevated }]}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${pct}%` as any, backgroundColor: branchColor },
                  ]}
                />
              </View>
              <AppText variant="caption" color={colors.textMuted} style={styles.progressLabel}>
                {progress}/{ch.targetCount} quests
              </AppText>

              {/* Join/Leave button */}
              {!done && (
                <TouchableOpacity
                  style={[
                    styles.joinBtn,
                    {
                      backgroundColor: joined ? branchColor + "22" : branchColor,
                      borderColor: branchColor,
                    },
                  ]}
                  onPress={() =>
                    joined ? leaveChallenge(ch.id) : joinChallenge(ch.id)
                  }
                  activeOpacity={0.8}
                >
                  <AppText
                    variant="caption"
                    color={joined ? branchColor : "#fff"}
                    style={styles.joinText}
                  >
                    {joined ? "✓ Joined" : "Join →"}
                  </AppText>
                </TouchableOpacity>
              )}
            </NeoBrutalBox>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontWeight: "900",
    letterSpacing: 1.2,
    fontSize: 11,
  },
  list: {
    paddingLeft: 20,
    paddingRight: 10,
    gap: 14,
    flexDirection: "row",
    paddingBottom: 6,
  },
  card: {
    padding: 14,
    gap: 8,
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  emoji: {
    fontSize: 22,
  },
  cardMeta: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 0.2,
  },
  timeLeft: {
    fontSize: 9,
  },
  desc: {
    fontSize: 10,
    lineHeight: 14,
  },
  progressBg: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 9,
    marginTop: -2,
  },
  joinBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    marginTop: 2,
  },
  joinText: {
    fontWeight: "900",
    fontSize: 10,
    letterSpacing: 0.5,
  },
});
