import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/ui/tokens';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface CheckboxProps {
  checked: boolean;
  onToggle?: () => void;
  disabled?: boolean;
  size?: number;
  style?: ViewStyle;
}

export function Checkbox({ checked, onToggle, disabled = false, size = 24, style }: CheckboxProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (disabled || checked) return;
    scale.value = withSequence(
      withSpring(1.3, { stiffness: 300, damping: 20 }),
      withSpring(1, { stiffness: 300, damping: 20 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle?.();
  };

  return (
    <AnimatedTouchable
      onPress={handlePress}
      disabled={disabled || checked}
      activeOpacity={0.8}
      style={[animatedStyle, style]}
    >
      <Ionicons
        name={checked ? 'checkmark-circle' : 'ellipse-outline'}
        size={size}
        color={checked ? colors.brandPrimary : colors.textMuted}
      />
    </AnimatedTouchable>
  );
}
