/**
 * GitHub-style activity heatmap for the profile screen.
 * Queries streak_history from Supabase (28 days), falls back to weeklyActivity.
 */
import { AppText } from "@/src/ui/atoms/Text";
import { supabase } from "@/src/business-logic/api/supabase";
import { useUserStore } from "@/src/business-logic/stores/userStore";
import { useTheme } from "@/src/ui/tokens";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface DayData {
  date: string;
  questsCompleted: number;
  xpEarned: number;
}

function getDayColor(count: number, baseColor: string): string {
  if (count === 0) return "transparent";
  if (count >= 3) return baseColor;
  if (count >= 2) return baseColor + "BB";
  return baseColor + "66";
}

function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

const DOW_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function buildGrid(days: DayData[]): DayData[][] {
  // Build a 4+ week grid (Mon–Sun columns)
  if (days.length === 0) return [];

  // Find the earliest Monday on or before the first day
  const first = new Date(days[0].date);
  const dayOfWeek = (first.getDay() + 6) % 7; // Mon=0
  const gridStart = new Date(first);
  gridStart.setDate(gridStart.getDate() - dayOfWeek);

  const last = new Date(days[days.length - 1].date);
  const totalDays = Math.ceil(
    (last.getTime() - gridStart.getTime()) / 86400000,
  ) + 1;

  const dateMap = new Map<string, DayData>();
  days.forEach((d) => dateMap.set(d.date, d));

  const grid: DayData[][] = [];
  let week: DayData[] = [];

  for (let i = 0; i < totalDays + ((7 - (totalDays % 7)) % 7); i++) {
    const d = new Date(gridStart);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    week.push(
      dateMap.get(dateStr) ?? { date: dateStr, questsCompleted: 0, xpEarned: 0 },
    );
    if (week.length === 7) {
      grid.push(week);
      week = [];
    }
  }
  if (week.length > 0) grid.push(week);
  return grid;
}

export function HabitHeatmap() {
  const { colors } = useTheme();
  const user = useUserStore((s) => s.user);
  const weeklyActivity = useUserStore((s) => s.weeklyActivity);
  const [days, setDays] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<DayData | null>(null);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!user?.user_id) {
      // Fallback to local weeklyActivity
      setDays(
        weeklyActivity.map((d) => ({
          date: d.date,
          questsCompleted: d.questsCompleted,
          xpEarned: d.xpEarned,
        })),
      );
      setLoading(false);
      return;
    }

    // Query last 28 days from streak_history
    const since = new Date();
    since.setDate(since.getDate() - 27);
    const sinceStr = since.toISOString().split("T")[0];

    (supabase as any)
      .from("streak_history")
      .select("date, quests_completed, xp_earned")
      .eq("user_id", user.user_id)
      .gte("date", sinceStr)
      .order("date", { ascending: true })
      .then(({ data, error }: any) => {
        if (error || !data) {
          // Fallback to local
          setDays(weeklyActivity.map((d) => ({
            date: d.date,
            questsCompleted: d.questsCompleted,
            xpEarned: d.xpEarned,
          })));
        } else {
          setDays(
            data.map((r: any) => ({
              date: r.date,
              questsCompleted: r.quests_completed ?? 0,
              xpEarned: r.xp_earned ?? 0,
            })),
          );
        }
        setLoading(false);
      });
  }, [user?.user_id]);

  const grid = useMemo(() => buildGrid(days), [days]);

  const totalQuests = days.reduce((s, d) => s + d.questsCompleted, 0);
  const activeDays = days.filter((d) => d.questsCompleted > 0).length;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <AppText style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          HABIT HEATMAP
        </AppText>
        <AppText variant="caption" color={colors.textMuted}>
          {activeDays} ngày hoạt động · {totalQuests} quests
        </AppText>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.brandPrimary} style={{ marginTop: 20 }} />
      ) : (
        <View style={[styles.heatmapCard, { backgroundColor: colors.bgSurface, borderColor: colors.glassBorder }]}>
          {/* Day of week labels */}
          <View style={styles.dowRow}>
            {DOW_LABELS.map((label) => (
              <AppText
                key={label}
                variant="caption"
                color={colors.textMuted}
                style={styles.dowLabel}
              >
                {label}
              </AppText>
            ))}
          </View>

          {/* Grid */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.gridContainer}
          >
            <View style={styles.grid}>
              {grid.map((week, wi) => (
                <View key={wi} style={styles.week}>
                  {week.map((day) => {
                    const isToday = day.date === today;
                    const isFuture = day.date > today;
                    return (
                      <TouchableOpacity
                        key={day.date}
                        style={[
                          styles.cell,
                          {
                            backgroundColor: isFuture
                              ? "transparent"
                              : getDayColor(
                                  day.questsCompleted,
                                  colors.brandPrimary,
                                ),
                            borderWidth: isToday ? 1.5 : 0,
                            borderColor: isToday ? colors.brandPrimary : "transparent",
                          },
                        ]}
                        onPress={() => !isFuture && setSelected(day)}
                        activeOpacity={0.7}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Legend */}
          <View style={styles.legend}>
            <AppText variant="caption" color={colors.textMuted}>Ít</AppText>
            {[0, 1, 2, 3].map((level) => (
              <View
                key={level}
                style={[
                  styles.legendCell,
                  {
                    backgroundColor: level === 0
                      ? colors.bgElevated
                      : getDayColor(level, colors.brandPrimary),
                  },
                ]}
              />
            ))}
            <AppText variant="caption" color={colors.textMuted}>Nhiều</AppText>
          </View>
        </View>
      )}

      {/* Day detail tooltip */}
      {selected && (
        <View
          style={[
            styles.tooltip,
            { backgroundColor: colors.bgElevated, borderColor: colors.glassBorder },
          ]}
        >
          <AppText variant="caption" color={colors.textPrimary} style={styles.tooltipDate}>
            {formatDayLabel(selected.date)}
          </AppText>
          <AppText variant="caption" color={colors.textSecondary}>
            {selected.questsCompleted} nhiệm vụ · +{selected.xpEarned} XP
          </AppText>
          <TouchableOpacity onPress={() => setSelected(null)}>
            <AppText variant="caption" color={colors.textMuted}>✕</AppText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 28,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  heatmapCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    gap: 8,
  },
  dowRow: {
    flexDirection: "row",
    gap: 4,
    paddingLeft: 2,
  },
  dowLabel: {
    width: 20,
    textAlign: "center",
    fontSize: 9,
  },
  gridContainer: {
    paddingVertical: 2,
  },
  grid: {
    flexDirection: "row",
    gap: 3,
  },
  week: {
    flexDirection: "column",
    gap: 3,
  },
  cell: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    justifyContent: "flex-end",
  },
  legendCell: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
  tooltip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  tooltipDate: {
    fontWeight: "900",
  },
});
