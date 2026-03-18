import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '@/src/ui/atoms/Text';
import { ProgressBar } from '@/src/ui/atoms/ProgressBar';
import { useTheme } from '@/src/ui/tokens';

import { Spacing } from '@/src/ui/tokens/spacing';
import type { Branch } from '@/src/business-logic/types';

const BRANCH_LABELS: Record<Branch, string> = {
  career: 'Career',
  finance: 'Finance',
  softskills: 'Soft Skills',
  wellbeing: 'Well-being',
};

interface BranchProgressRowProps {
  branch: Branch;
  percent: number; // 0–100
}

const getBranchColors = (colors: any): Record<string, string> => ({
  career: colors.career,
  finance: colors.finance,
  softskills: colors.softskills,
  wellbeing: colors.wellbeing,
});

export function BranchProgressRow({ branch, percent }: BranchProgressRowProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const BranchColors = useMemo(() => getBranchColors(colors), [colors]);
  const color = BranchColors[branch as string];

  return (
    <View style={styles.row}>
      <View style={styles.labelRow}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <AppText variant="caption" color={colors.textSecondary}>
          {BRANCH_LABELS[branch]}
        </AppText>
        <AppText variant="caption" color={color} style={styles.percent}>
          {percent}%
        </AppText>
      </View>
      <ProgressBar value={percent} color={color} variant="thin" />
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  row: {
    gap: 6,
    marginBottom: Spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  percent: {
    marginLeft: 'auto',
    fontFamily: 'SpaceGrotesk-SemiBold', fontWeight: '600',
  },
});
