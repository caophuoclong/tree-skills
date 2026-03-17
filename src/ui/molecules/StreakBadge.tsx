import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AppText } from '@/src/ui/atoms/Text';
import { Emoji } from '@/src/ui/atoms/Emoji';
import { useTheme } from '@/src/ui/tokens';
import { Spacing, Radius } from '@/src/ui/tokens/spacing';

const MILESTONES = [7, 14, 30, 60, 100];

interface StreakBadgeProps {
  count: number;
  protected?: boolean;
  size?: 'sm' | 'lg';
}

export function StreakBadge({ count, protected: isProtected = false, size = 'sm' }: StreakBadgeProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const scale = useSharedValue(1);
  const prevCount = useRef(count);

  useEffect(() => {
    if (count > prevCount.current) {
      scale.value = withSequence(
        withSpring(1.3, { stiffness: 300, damping: 20 }),
        withSpring(1, { stiffness: 300, damping: 20 })
      );
      if (MILESTONES.includes(count)) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
    prevCount.current = count;
  }, [count]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isGlowing = count >= 7;
  const isLarge = size === 'lg';

  return (
    <Animated.View style={[styles.container, isGlowing && styles.glow, animatedStyle]}>
      <Emoji size={isLarge ? 28 : 16}>🔥</Emoji>
      <AppText
        variant={isLarge ? 'displayLG' : 'title'}
        color={colors.warning}
        style={styles.count}
      >
        {count}
      </AppText>
      <AppText variant="caption" color={colors.textMuted}>
        {'ngày'}
      </AppText>
      {isProtected && (
        <Emoji size={12} style={{ marginLeft: 2 }}>🛡️</Emoji>
      )}
    </Animated.View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
    backgroundColor: `${colors.warning}1A`,
  },
  glow: {
    shadowColor: colors.warning,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  fire: { fontSize: 16 },
  fireLg: { fontSize: 28 },
  count: { fontWeight: '700' },
  shield: { fontSize: 12, marginLeft: 2 },
});
