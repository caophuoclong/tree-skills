import { StyleSheet, Text, View } from 'react-native';
import { NeoBrutalThemed } from '@/src/ui/atoms';
import { IColors, useTheme } from '@/src/ui/tokens';

interface Stat {
  value: string | number | null;
  label: string;
}

interface ProfileStatsRowProps {
  stats: Stat[];
}

export function ProfileStatsRow({ stats }: ProfileStatsRowProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.statsRow}>
      {stats.map((stat, i) => (
        <NeoBrutalThemed
          key={i}
          shadowOffsetX={3}
          shadowOffsetY={3}
          borderWidth={2}
          borderRadius={12}
          style={{ flex: 1 }}
          contentStyle={styles.statContent}
        >
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>
            {stat.value ?? '—'}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>
            {stat.label}
          </Text>
        </NeoBrutalThemed>
      ))}
    </View>
  );
}

const createStyles = (colors: IColors) =>
  StyleSheet.create({
    statsRow: {
      flexDirection: 'row',
      gap: 10,
      marginHorizontal: 20,
      marginTop: 16,
    },
    statContent: {
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 8,
    },
    statValue: { fontSize: 18, fontWeight: '900' },
    statLabel: {
      fontSize: 8,
      fontWeight: '800',
      textAlign: 'center',
      marginTop: 5,
      lineHeight: 11,
      letterSpacing: 0.3,
    },
  });
