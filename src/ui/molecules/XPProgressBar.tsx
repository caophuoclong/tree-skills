import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AppText } from '@/src/ui/atoms/Text';
import { ProgressBar } from '@/src/ui/atoms/ProgressBar';
import { useTheme } from '@/src/ui/tokens';
import { Spacing } from '@/src/ui/tokens/spacing';

interface XPProgressBarProps {
  current: number;
  target: number;
  level: number;
}

export function XPProgressBar({ current, target, level }: XPProgressBarProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const percent = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  const labelScale = useSharedValue(1);

  useEffect(() => {
    if (percent >= 100) {
      labelScale.value = withSequence(
        withSpring(1.2, { stiffness: 300, damping: 20 }),
        withSpring(1, { stiffness: 300, damping: 20 })
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [percent]);

  const labelStyle = useAnimatedStyle(() => ({
    transform: [{ scale: labelScale.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText variant="caption" color={colors.textSecondary}>
          XP
        </AppText>
        <Animated.View style={labelStyle}>
          <AppText variant="caption" color={colors.brandPrimary} style={styles.level}>
            Lv.{level}
          </AppText>
        </Animated.View>
      </View>
      <ProgressBar value={percent} color={colors.brandPrimary} variant="thick" />
      <AppText variant="micro" color={colors.textMuted} style={styles.counts}>
        {current.toLocaleString()} / {target.toLocaleString()} XP
      </AppText>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: { gap: 4 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  level: { fontWeight: '700', fontFamily: 'SpaceMono-Bold' },
  counts: { textAlign: 'right' },
});
