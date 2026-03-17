import React, { useMemo } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/ui/tokens';
import { Typography } from '@/src/ui/tokens/typography';
import { Radius, Spacing } from '@/src/ui/tokens/spacing';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  children: React.ReactNode;
}

const getVariantStyles = (colors: any): Record<ButtonVariant, { container: ViewStyle; label: TextStyle }> => ({
  primary: {
    container: { backgroundColor: colors.brandPrimary },
    label: { color: '#FFFFFF' },
  },
  secondary: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.brandPrimary,
    },
    label: { color: colors.brandPrimary },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    label: { color: colors.textSecondary },
  },
  danger: {
    container: { backgroundColor: colors.danger },
    label: { color: '#FFFFFF' },
  },
});

export function Button({
  variant = 'primary',
  loading = false,
  fullWidth = false,
  style,
  labelStyle,
  children,
  onPress,
  disabled,
  ...props
}: ButtonProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const variantStyles = useMemo(() => getVariantStyles(colors), [colors]);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { stiffness: 200, damping: 30 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { stiffness: 200, damping: 30 });
  };

  const handlePress = (e: any) => {
    Haptics.selectionAsync();
    onPress?.(e);
  };

  const v = variantStyles[variant];

  return (
    <AnimatedTouchable
      style={[
        styles.base,
        v.container,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        animatedStyle,
        style,
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={1}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={v.label.color} size="small" />
      ) : (
        <Text style={[styles.label, v.label, labelStyle]}>
          {children}
        </Text>
      )}
    </AnimatedTouchable>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  base: {
    height: 56,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    ...Typography.bodyLG,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});
