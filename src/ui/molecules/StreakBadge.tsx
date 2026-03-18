import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  useAnimatedReaction,
  runOnJS,
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
  streakAtRisk?: boolean;
}

export function StreakBadge({ count, protected: isProtected = false, size = 'sm', streakAtRisk = false }: StreakBadgeProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const scale = useSharedValue(1);
  const prevCount = useRef(count);
  const riskPulse = useRef(new Animated.Value(1)).current;

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

  useEffect(() => {
    if (streakAtRisk) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(riskPulse, { toValue: 0.2, duration: 800, useNativeDriver: true }),
          Animated.timing(riskPulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      riskPulse.setValue(1);
    }
  }, [streakAtRisk]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isGlowing = count >= 7;
  const isLarge = size === 'lg';

  return (
    <View style={streakAtRisk ? styles.riskBorderContainer : undefined}>
      <Animated.View
        style={[
          styles.container,
          isGlowing && styles.glow,
          animatedStyle,
          streakAtRisk && { borderColor: colors.danger, borderWidth: 2 }
        ]}
      >
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
      {streakAtRisk && (
        <Animated.View
          style={[
            styles.riskPulseBorder,
            { opacity: riskPulse }
          ]}
        />
      )}
    </View>
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
  count: { fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700' },
  shield: { fontSize: 12, marginLeft: 2 },
  riskBorderContainer: {
    position: 'relative',
  },
  riskPulseBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: colors.danger,
  },
});
