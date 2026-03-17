import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BranchColor, BranchColors } from '@/src/ui/tokens/colors';
import { Typography } from '@/src/ui/tokens/typography';
import { Radius, Spacing } from '@/src/ui/tokens/spacing';

type BadgeVariant = 'xp' | 'branch' | 'duration' | 'level' | 'milestone';

interface BadgeProps {
  variant: BadgeVariant;
  value: string | number;
  branch?: BranchColor;
  style?: ViewStyle;
}

export function Badge({ variant, value, branch, style }: BadgeProps) {
  const getStyle = (): { container: ViewStyle; text: any } => {
    switch (variant) {
      case 'xp':
        return {
          container: { backgroundColor: Colors.brandPrimary },
          text: { color: '#FFFFFF' },
        };
      case 'branch': {
        const color = branch ? BranchColors[branch] : Colors.brandPrimary;
        return {
          container: { backgroundColor: `${color}33` }, // 20% opacity
          text: { color },
        };
      }
      case 'duration':
        return {
          container: { backgroundColor: Colors.bgSurface, borderWidth: 1, borderColor: Colors.glassBorder },
          text: { color: Colors.textSecondary },
        };
      case 'level':
        return {
          container: { backgroundColor: `${Colors.brandPrimary}33` },
          text: { color: Colors.brandPrimary },
        };
      case 'milestone':
        return {
          container: { backgroundColor: `${Colors.warning}33` },
          text: { color: Colors.warning },
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

const styles = StyleSheet.create({
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
