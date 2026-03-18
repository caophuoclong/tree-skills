import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/src/ui/tokens';

interface StreakToastProps {
  streak: number;
  visible: boolean;
  onHide: () => void;
}

const MILESTONE_STREAKS = [7, 14, 30];

export function StreakToast({ streak, visible, onHide }: StreakToastProps) {
  const { colors } = useTheme();
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide in
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, stiffness: 300, damping: 25 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start(() => {
        // Stay for 2.5s, then slide out
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(translateY, { toValue: -80, duration: 300, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
          ]).start(() => onHide());
        }, 2500);
      });
    } else {
      translateY.setValue(-80);
      opacity.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY }], opacity, backgroundColor: colors.warning, borderColor: colors.textPrimary },
      ]}
    >
      {/* NB shadow */}
      <View style={[styles.shadow, { backgroundColor: colors.textPrimary }]} />
      <Text style={[styles.text, { fontFamily: 'SpaceGrotesk-Bold' }]}>
        🔥 {streak}-Day Streak! Keep it up!
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    borderRadius: 12,
    borderWidth: 2.5,
    padding: 14,
    alignItems: 'center',
    zIndex: 1000,
    elevation: 10,
  },
  shadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    borderRadius: 12,
    zIndex: -1,
  },
  text: { fontSize: 16, color: '#000' },
});
