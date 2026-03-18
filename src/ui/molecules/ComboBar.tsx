import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/src/ui/tokens';

interface ComboBarProps {
  combo: number; // session_combo from dailyStats
}

function getMultiplierLabel(combo: number): string {
  if (combo >= 5) return 'x1.5';
  if (combo >= 3) return 'x1.25';
  return 'x1.0';
}

function getMultiplierColor(combo: number, colors: any): string {
  if (combo >= 5) return colors.warning; // orange glow
  if (combo >= 3) return colors.brandPrimary;
  return colors.textMuted;
}

export function ComboBar({ combo }: ComboBarProps) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevCombo = useRef(combo);

  useEffect(() => {
    if (combo > prevCombo.current) {
      // Scale pulse when multiplier changes
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          useNativeDriver: true,
          stiffness: 400,
          damping: 8,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          stiffness: 300,
          damping: 15,
        }),
      ]).start();
    }
    prevCombo.current = combo;
  }, [combo, scaleAnim]);

  const label = getMultiplierLabel(combo);
  const color = getMultiplierColor(combo, colors);
  const isActive = combo >= 3;

  if (combo === 0) return null; // hide when no combo yet

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale: scaleAnim }] }]}>
      <View style={[styles.shadow, { backgroundColor: color, opacity: 0.5 }]} />
      <View
        style={[
          styles.pill,
          {
            backgroundColor: isActive ? color : colors.bgSurface,
            borderColor: color,
          },
        ]}
      >
        <Text style={styles.fireIcon}>🔥</Text>
        <Text
          style={[
            styles.label,
            {
              color: isActive ? '#fff' : color,
              fontFamily: 'SpaceMono-Bold',
            },
          ]}
        >
          {label}
        </Text>
        <Text
          style={[
            styles.sub,
            {
              color: isActive ? 'rgba(255,255,255,0.8)' : colors.textMuted,
              fontFamily: 'SpaceGrotesk-Regular',
            },
          ]}
        >
          combo
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'relative', alignSelf: 'flex-end' },
  shadow: { position: 'absolute', top: 3, left: 3, right: -3, bottom: -3, borderRadius: 20 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 2,
  },
  fireIcon: { fontSize: 14 },
  label: { fontSize: 14 },
  sub: { fontSize: 11 },
});
