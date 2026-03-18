import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Polyline, Circle } from 'react-native-svg';
import { useTheme } from '@/src/ui/tokens';
import type { WeeklyDay } from '@/src/business-logic/types';

interface WeeklyChartProps {
  data: WeeklyDay[];
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function WeeklyChart({ data }: WeeklyChartProps) {
  const { colors } = useTheme();

  const CHART_H = 100;
  const CHART_W = 280;
  const BAR_W = 28;
  const GAP = (CHART_W - 7 * BAR_W) / 8;
  const MIN_BAR_H = 4;

  const maxQuests = Math.max(...data.map((d) => d.questsCompleted), 1);
  const maxXP = Math.max(...data.map((d) => d.xpEarned), 1);

  // XP trend polyline points
  const xpPoints = data
    .map((d, i) => {
      const x = GAP + i * (BAR_W + GAP) + BAR_W / 2;
      const y =
        CHART_H -
        MIN_BAR_H -
        (d.xpEarned / maxXP) * (CHART_H - MIN_BAR_H - 10);
      return `${x},${y}`;
    })
    .join(' ');

  const today = new Date().toISOString().split('T')[0];

  return (
    <View style={styles.container}>
      <Svg width={CHART_W} height={CHART_H + 24}>
        {data.map((d) => {
          const i = data.findIndex((x) => x.date === d.date);
          const x = GAP + i * (BAR_W + GAP);
          const barH =
            d.questsCompleted > 0
              ? MIN_BAR_H +
                (d.questsCompleted / maxQuests) * (CHART_H - MIN_BAR_H - 8)
              : MIN_BAR_H;
          const y = CHART_H - barH;
          const isToday = d.date === today;
          const barColor =
            d.questsCompleted > 0
              ? colors.brandPrimary
              : 'rgba(255,255,255,0.08)';

          return (
            <React.Fragment key={d.date}>
              <Rect
                x={x}
                y={y}
                width={BAR_W}
                height={barH}
                rx={4}
                ry={4}
                fill={isToday ? colors.brandGlow : barColor}
                stroke={isToday ? colors.textPrimary : 'none'}
                strokeWidth={isToday ? 1.5 : 0}
              />
            </React.Fragment>
          );
        })}

        {/* XP trend line */}
        {maxXP > 0 && (
          <Polyline
            points={xpPoints}
            fill="none"
            stroke={colors.warning}
            strokeWidth={1.5}
            strokeDasharray="4,3"
          />
        )}
      </Svg>

      {/* Day labels (outside SVG) */}
      <View style={styles.labelRow}>
        {data.map((d, i) => {
          const dayOfWeek = new Date(d.date + 'T12:00:00').getDay();
          const isToday = d.date === today;
          return (
            <Text
              key={d.date}
              style={[
                styles.dayLabel,
                {
                  color: isToday ? colors.brandPrimary : colors.textMuted,
                  fontFamily: isToday
                    ? 'SpaceGrotesk-Bold'
                    : 'SpaceGrotesk-Regular',
                  width: BAR_W + GAP,
                  marginLeft: i === 0 ? GAP : 0,
                },
              ]}
            >
              {DAY_LABELS[dayOfWeek]?.slice(0, 1)}
            </Text>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: colors.brandPrimary }]}
          />
          <Text
            style={[
              styles.legendText,
              { color: colors.textMuted, fontFamily: 'SpaceGrotesk-Regular' },
            ]}
          >
            Quests
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendLine, { backgroundColor: colors.warning }]}
          />
          <Text
            style={[
              styles.legendText,
              { color: colors.textMuted, fontFamily: 'SpaceGrotesk-Regular' },
            ]}
          >
            XP trend
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  labelRow: { flexDirection: 'row', marginTop: 4 },
  dayLabel: { fontSize: 11, textAlign: 'center' },
  legend: { flexDirection: 'row', gap: 16, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLine: { width: 16, height: 2, borderRadius: 1 },
  legendText: { fontSize: 11 },
});
