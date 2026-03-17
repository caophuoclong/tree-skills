import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/src/ui/tokens';

import { Typography } from '@/src/ui/tokens/typography';
import { Radius, Spacing } from '@/src/ui/tokens/spacing';

type BadgeVariant = 'xp' | 'branch' | 'duration' | 'level' | 'milestone';
type BranchColor = 'career' | 'finance' | 'softskills' | 'wellbeing';

interface BadgeProps {
  variant: BadgeVariant;
  value: string | number;
  branch?: BranchColor;
  style?: ViewStyle;
}

const getBranchColors = (colors: any): Record<string, string> => ({
  career: colors.career,
  finance: colors.finance,
  softskills: colors.softskills,
  wellbeing: colors.wellbeing,
});

export function Badge({ variant, value, branch, style }: BadgeProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const BranchColors = useMemo(() => getBranchColors(colors), [colors]);
  const getStyle = (): { container: ViewStyle; text: any } => {
    switch (variant) {
      case 'xp':
        return {
          container: { backgroundColor: colors.brandPrimary },
          text: { color: '#FFFFFF' },
        };
      case 'branch': {
        const color = branch ? BranchColors[branch as string] : colors.brandPrimary;
        return {
          container: { backgroundColor: `${color}33` }, // 20% opacity
          text: { color },
        };
      }
      case 'duration':
        return {
          container: { backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.glassBorder },
          text: { color: colors.textSecondary },
        };
      case 'level':
        return {
          container: { backgroundColor: `${colors.brandPrimary}33` },
          text: { color: colors.brandPrimary },
        };
      case 'milestone':
        return {
          container: { backgroundColor: `${colors.warning}33` },
          text: { color: colors.warning },
        };
    }
  };

  const { container, text } = getStyle();
  const label =
    variant === 'xp'
      ? `+${value} XP`
      : variant === 'duration'
      ? `${value} min`
      : variant === 'level'
      ? `LVL ${value}`
      : String(value);

  return (
    <View style={[styles.base, container, style]}>
      <Text style={[styles.text, text]}>{label}</Text>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  base: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  text: {
    ...Typography.micro,
    fontWeight: '600',
  },
});
