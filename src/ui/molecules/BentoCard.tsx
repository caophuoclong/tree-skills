import React from 'react';
import { StyleSheet, Pressable, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { GlassView } from '@/src/ui/atoms/GlassView';
import { Spacing, Radius } from '@/src/ui/tokens/spacing';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface BentoCardProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3;
  style?: ViewStyle;
  onPress?: () => void;
}

export function BentoCard({ children, cols = 1, style, onPress }: BentoCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) scale.value = withSpring(0.97, { stiffness: 200, damping: 30 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { stiffness: 200, damping: 30 });
  };

  const flexValue = cols;

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={[{ flex: flexValue }, animatedStyle]}
    >
      <GlassView style={StyleSheet.flatten([styles.card, style])}>
        {children}
      </GlassView>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    minHeight: 80,
  },
});
