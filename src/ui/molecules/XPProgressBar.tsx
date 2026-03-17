import React, { useEffect } from 'react';
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
import { Colors } from '@/src/ui/tokens/colors';
import { Spacing } from '@/src/ui/tokens/spacing';

interface XPProgressBarProps {
  current: number;
  target: number;
  level: number;
}

export function XPProgressBar({ current, target, level }: XPProgressBarProps) {
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
        <AppText variant="caption" color={Colors.textSecondary}>
          XP
        </AppText>
        <Animated.View style={labelStyle}>
          <AppText variant="caption" color={Colors.brandPrimary} style={styles.level}>
            Lv.{level}
          </AppText>
        </Animated.View>
      </View>
      <ProgressBar value={percent} color={Colors.brandPrimary} variant="thick" />
      <AppText variant="micro" color={Colors.textMuted} style={styles.counts}>
        {current.toLocaleString()} / {target.toLocaleString()} XP
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  level: { fontWeight: '700', fontFamily: 'JetBrainsMono-Regular' },
  counts: { textAlign: 'right' },
});
