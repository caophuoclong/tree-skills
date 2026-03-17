import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/src/ui/atoms/Text';
import { useTheme } from '@/src/ui/tokens';
import { Radius, Spacing } from '@/src/ui/tokens/spacing';
import type { NodeStatus, Branch } from '@/src/business-logic/types';

interface SkillNodeProps {
  branch: Branch;
  status: NodeStatus;
  label: string;
  level?: number;
  xpRequired?: number;
  onPress?: () => void;
  style?: ViewStyle;
}

const getBranchColors = (colors: any): Record<string, string> => ({
  career: colors.career,
  finance: colors.finance,
  softskills: colors.softskills,
  wellbeing: colors.wellbeing,
});

export function SkillNode({
  branch,
  status,
  label,
  level,
  xpRequired,
  onPress,
  style,
}: SkillNodeProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const BranchColors = useMemo(() => getBranchColors(colors), [colors]);
  const branchColor = BranchColors[branch as string] ?? colors.brandPrimary;
  const glowOpacity = useSharedValue(0.4);

  useEffect(() => {
    if (status === 'in_progress') {
      glowOpacity.value = withRepeat(
        withTiming(1, { duration: 500 }),
        -1,
        true
      );
    } else {
      cancelAnimation(glowOpacity);
      glowOpacity.value = status === 'locked' ? 0 : 1;
    }
  }, [status]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    shadowColor: branchColor,
    shadowRadius: 12,
    shadowOpacity: glowOpacity.value * 0.8,
  }));

  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const isInProgress = status === 'in_progress';

  const nodeStyle: ViewStyle = {
    backgroundColor: isLocked
      ? colors.bgBase
      : isCompleted
      ? branchColor
      : colors.bgSurface,
    borderColor: isInProgress ? branchColor : colors.glassBorder,
    borderWidth: isInProgress ? 2 : 1,
    opacity: isLocked ? 0.4 : 1,
  };

  return (
    <TouchableOpacity
      onPress={!isLocked ? onPress : undefined}
      activeOpacity={isLocked ? 1 : 0.8}
    >
      <Animated.View style={[styles.node, nodeStyle, isInProgress && glowStyle, style]}>
        {isLocked ? (
          <Ionicons name="lock-closed" size={16} color={colors.textMuted} />
        ) : isCompleted ? (
          <Ionicons name="checkmark" size={18} color="#FFFFFF" />
        ) : (
          <Ionicons name="star" size={16} color={branchColor} />
        )}
        <AppText variant="micro" style={[styles.label, isCompleted && styles.completedLabel]}>
          {label}
        </AppText>
      </Animated.View>
    </TouchableOpacity>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  node: {
    width: 80,
    height: 80,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xs,
    gap: 4,
  },
  label: {
    textAlign: 'center',
    color: colors.textSecondary,
    flexWrap: 'wrap',
  },
  completedLabel: {
    color: '#FFFFFF',
  },
});
