import { AppText } from "@/src/ui/atoms/Text";
import { useTheme } from "@/src/ui/tokens";
import { Spacing } from "@/src/ui/tokens/spacing";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

interface Day {
  date: string;
  questsCompleted: number;
}

interface StreakChainBarProps {
  weeklyActivity: Day[];
  streak: number;
}

function getChainTier(streak: number): { label: string; color: string } {
  if (streak >= 100) return { label: "💎 Diamond Chain", color: "#b9f2ff" };
  if (streak >= 30) return { label: "🥇 Gold Chain", color: "#ffd700" };
  if (streak >= 7) return { label: "🥉 Bronze Chain", color: "#cd7f32" };
  return { label: "QUEST CHAIN", color: "#888" };
}

export function StreakChainBar({ weeklyActivity, streak }: StreakChainBarProps) {
  const { colors } = useTheme();
  const today = new Date().toISOString().split("T")[0];

  const tier = useMemo(() => getChainTier(streak), [streak]);

  const days = useMemo(() => {
    // Always render 7 slots
    return weeklyActivity.slice(-7);
  }, [weeklyActivity]);

  if (streak === 0 && days.every((d) => d.questsCompleted === 0)) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText variant="caption" color={tier.color} style={styles.label}>
          {tier.label}
        </AppText>
        <AppText variant="caption" color={colors.textMuted}>
          {streak} ngày
        </AppText>
      </View>

      <View style={styles.chain}>
        {days.map((day, i) => {
          const isToday = day.date === today;
          const active = day.questsCompleted > 0;
          const isLast = i === days.length - 1;

          return (
            <View key={day.date} style={styles.linkWrapper}>
              <View
                style={[
                  styles.link,
                  {
                    backgroundColor: active
                      ? tier.color + "33"
                      : colors.bgElevated,
                    borderColor: active ? tier.color : colors.glassBorder,
                    borderWidth: isToday && !active ? 2 : 1.5,
                    borderStyle: isToday && !active ? "dashed" : "solid",
                  },
                ]}
              >
                <AppText style={styles.linkEmoji}>
                  {active ? "🔗" : isToday ? "○" : "✕"}
                </AppText>
              </View>
              {!isLast && (
                <View
                  style={[
                    styles.connector,
                    { backgroundColor: active ? tier.color + "66" : colors.glassBorder },
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontWeight: "900",
    letterSpacing: 0.8,
    fontSize: 10,
  },
  chain: {
    flexDirection: "row",
    alignItems: "center",
  },
  linkWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  link: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  linkEmoji: {
    fontSize: 14,
  },
  connector: {
    flex: 1,
    height: 2,
    borderRadius: 1,
  },
});
