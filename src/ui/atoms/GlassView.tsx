import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/src/ui/tokens';

import { Radius } from '@/src/ui/tokens/spacing';

interface GlassViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  radius?: number;
}

export function GlassView({ children, style, intensity = 20, radius = Radius.lg }: GlassViewProps) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={intensity}
        tint={isDark ? 'dark' : 'light'}
        style={[styles.base, { borderRadius: radius }, style]}
      >
        {children}
      </BlurView>
    );
  }

  // Android fallback — semi-transparent bg
  return (
    <View style={[styles.base, styles.androidFallback, { borderRadius: radius }, style]}>
      {children}
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  base: {
    backgroundColor: colors.glassBg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
  },
  androidFallback: {
    backgroundColor: colors.bgSurface,
  },
});
