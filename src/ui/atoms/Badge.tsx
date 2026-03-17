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
          container: { backgroundColor: colors.bgSurface, borderColor: colors.brandPrimary, borderWidth: 2 },
          text: { color: colors.brandPrimary },
        };
      case 'branch': {
        const color = branch ? BranchColors[branch as string] : colors.brandPrimary;
        return {
          container: { backgroundColor: colors.bgSurface, borderColor: color, borderWidth: 2 },
          text: { color },
        };
      }
      case 'duration':
        return {
          container: { backgroundColor: colors.bgSurface, borderWidth: 2, borderColor: colors.glassBorder },
          text: { color: colors.textSecondary },
        };
      case 'level':
        return {
          container: { backgroundColor: colors.bgSurface, borderColor: colors.brandPrimary, borderWidth: 2 },
          text: { color: colors.brandPrimary },
        };
      case 'milestone':
        return {
          container: { backgroundColor: colors.bgSurface, borderColor: colors.warning, borderWidth: 2 },
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
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
    // Neobrutalism shadow
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  text: {
    ...Typography.micro,
  },
});
