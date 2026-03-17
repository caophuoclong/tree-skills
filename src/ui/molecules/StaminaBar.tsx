import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  cancelAnimation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/src/ui/atoms/Text';
import { ProgressBar } from '@/src/ui/atoms/ProgressBar';
import { Colors } from '@/src/ui/tokens/colors';
import { Spacing } from '@/src/ui/tokens/spacing';

interface StaminaBarProps {
  value: number; // 0–100
}

function getStaminaColor(value: number): string {
  if (value >= 70) return Colors.staminaOk;
  if (value >= 30) return Colors.staminaMid;
  return Colors.staminaLow;
}

function getStaminaLabel(value: number): string {
  if (value >= 70) return 'Mental Energy';
  if (value >= 30) return 'Mental Energy — Cảnh báo';
  if (value > 0) return 'Mental Energy — Nguy hiểm';
  return 'Mental Energy — Kiệt sức';
}

export function StaminaBar({ value }: StaminaBarProps) {
  const color = getStaminaColor(value);
  const shakeX = useSharedValue(0);
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    cancelAnimation(shakeX);
    cancelAnimation(pulseOpacity);

    if (value === 0 || value < 30) {
      shakeX.value = withRepeat(
        withSequence(
          withTiming(-4, { duration: 60 }),
          withTiming(4, { duration: 60 }),
          withTiming(0, { duration: 60 })
        ),
        3,
        false
      );
      if (value < 30) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } else if (value < 70) {
      pulseOpacity.value = withRepeat(withTiming(0.6, { duration: 400 }), -1, true);
    } else {
      pulseOpacity.value = 1;
    }
  }, [value]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  return (
    <Animated.View style={shakeStyle}>
      <View style={styles.container}>
        <View style={styles.header}>
          <AppText variant="caption" color={color}>
            {getStaminaLabel(value)}
          </AppText>
          <Animated.View style={value < 30 ? pulseStyle : undefined}>
            <AppText variant="caption" color={color} style={styles.valueText}>
              {value}%
            </AppText>
          </Animated.View>
        </View>
        <ProgressBar value={value} color={color} variant="thick" />
        {value === 0 && (
          <View style={styles.warningRow}>
            <Ionicons name="warning" size={12} color={Colors.danger} />
            <AppText variant="micro" color={Colors.danger} style={styles.warningText}>
              Hoàn thành Wellbeing quest để tiếp tục
            </AppText>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.xs },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueText: { fontWeight: '600' },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  warningText: { flex: 1 },
});
