import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/src/ui/tokens';

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
  color,
  variant = 'thin',
  style,
  animated = true,
}: ProgressBarProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const fillColor = color || colors.brandPrimary;
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
        style={[styles.fill, { backgroundColor: fillColor, height, borderRadius: height / 2 }, animatedFill]}
      />
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: colors.bgSurface,
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
