import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Colors } from '@/src/ui/tokens/colors';

type ProgressBarVariant = 'thin' | 'thick';

interface ProgressBarProps {
  value: number; // 0–100
  color?: string;
  variant?: ProgressBarVariant;
  style?: ViewStyle;
  animated?: boolean;
}

export function ProgressBar({
  value,
  color = Colors.brandPrimary,
  variant = 'thin',
  style,
  animated = true,
}: ProgressBarProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    const clamped = Math.max(0, Math.min(100, value));
    if (animated) {
      progress.value = withSpring(clamped, { stiffness: 200, damping: 30 });
    } else {
      progress.value = clamped;
    }
  }, [value]);

  const animatedFill = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  const height = variant === 'thin' ? 4 : 8;

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }, style]}>
      <Animated.View
        style={[styles.fill, { backgroundColor: color, height, borderRadius: height / 2 }, animatedFill]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: Colors.bgSurface,
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
