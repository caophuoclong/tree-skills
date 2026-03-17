import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AppText } from '@/src/ui/atoms/Text';
import { Colors } from '@/src/ui/tokens/colors';
import { Spacing, Radius } from '@/src/ui/tokens/spacing';

const MILESTONES = [7, 14, 30, 60, 100];

interface StreakBadgeProps {
  count: number;
  protected?: boolean;
  size?: 'sm' | 'lg';
}

export function StreakBadge({ count, protected: isProtected = false, size = 'sm' }: StreakBadgeProps) {
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
      <AppText style={[styles.fire, isLarge && styles.fireLg]}>{'🔥'}</AppText>
      <AppText
        variant={isLarge ? 'displayLG' : 'title'}
        color={Colors.warning}
        style={styles.count}
      >
        {count}
      </AppText>
      <AppText variant="caption" color={Colors.textMuted}>
        {'ngày'}
      </AppText>
      {isProtected && (
        <AppText style={styles.shield}>{'🛡️'}</AppText>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
    backgroundColor: `${Colors.warning}1A`,
  },
  glow: {
    shadowColor: Colors.warning,
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
