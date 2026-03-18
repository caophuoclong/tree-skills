import { StyleSheet, Text, View } from 'react-native';
import { NeoBrutalThemed, ProgressBar } from '@/src/ui/atoms';
import { IColors, useTheme } from '@/src/ui/tokens';

interface BranchRow {
  label: string;
  percent: number;
  color: string;
  emoji: string;
}

interface BranchProgressListProps {
  branches: BranchRow[];
}

export function BranchProgressList({ branches }: BranchProgressListProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={{ marginHorizontal: 20, marginTop: 24 }}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
        SKILL BRANCH PROGRESS
      </Text>
      <NeoBrutalThemed
        shadowOffsetX={4}
        shadowOffsetY={4}
        borderWidth={2}
        borderRadius={16}
        contentStyle={styles.branchCard}
      >
        {branches.map((branch, idx) => (
          <View key={branch.label}>
            <View style={styles.branchRow}>
              <Text style={styles.branchEmoji}>{branch.emoji}</Text>
              <View style={{ flex: 1, gap: 5 }}>
                <View style={styles.branchLabelRow}>
                  <Text
                    style={[styles.branchLabel, { color: colors.textPrimary }]}
                  >
                    {branch.label}
                  </Text>
                  <Text style={[styles.branchPercent, { color: branch.color }]}>
                    {branch.percent}%
                  </Text>
                </View>
                <ProgressBar
                  value={branch.percent}
                  color={branch.color}
                  variant="thick"
                  animated
                />
              </View>
            </View>
            {idx < branches.length - 1 && (
              <View
                style={[
                  styles.branchDivider,
                  { backgroundColor: colors.glassBorder },
                ]}
              />
            )}
          </View>
        ))}
      </NeoBrutalThemed>
    </View>
  );
}

const createStyles = (colors: IColors) =>
  StyleSheet.create({
    sectionTitle: {
      fontSize: 13,
      fontWeight: '900',
      marginBottom: 14,
      letterSpacing: 1.2,
      paddingHorizontal: 0,
    },
    branchCard: { padding: 18, gap: 14 },
    branchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    branchEmoji: { fontSize: 16, width: 24, textAlign: 'center' },
    branchLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 2,
    },
    branchLabel: {
      fontSize: 13,
      fontFamily: 'SpaceGrotesk-SemiBold',
      fontWeight: '600',
    },
    branchPercent: { fontSize: 12, fontWeight: '800' },
    branchDivider: { height: 1, marginVertical: 10 },
  });
