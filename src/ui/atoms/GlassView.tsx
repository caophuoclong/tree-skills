import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '@/src/ui/tokens/colors';
import { Radius } from '@/src/ui/tokens/spacing';

interface GlassViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  radius?: number;
}

export function GlassView({ children, style, intensity = 20, radius = Radius.lg }: GlassViewProps) {
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={intensity}
        tint="dark"
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

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.glassBg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  androidFallback: {
    backgroundColor: Colors.bgSurface,
  },
});
