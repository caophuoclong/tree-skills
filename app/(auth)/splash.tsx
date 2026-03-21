import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AppText } from '@/src/ui/atoms/Text';
import { useTheme } from '@/src/ui/tokens';
import { Spacing } from '@/src/ui/tokens/spacing';
import { useUserStore } from '@/src/business-logic/stores/userStore';

export default function SplashScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const glowOpacity = useSharedValue(0.4);
  const glowScale = useSharedValue(0.9);
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);

  const isAuthLoading = useUserStore((s) => s.isAuthLoading);
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const sessionReady = useUserStore((s) => s.sessionReady);

  useEffect(() => {
    // Glow pulse animation
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );

    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.9, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );

    // Logo entry
    logoOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    logoScale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });

    // Text entry (delayed)
    setTimeout(() => {
      textOpacity.value = withTiming(1, { duration: 500 });
      textTranslateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
    }, 400);
  }, []);

  // Wait for auth loading to complete before navigating
  useEffect(() => {
    if (isAuthLoading) return; // Still loading, don't navigate yet

    console.log('[splash] Auth loading done, isAuthenticated:', isAuthenticated, 'sessionReady:', sessionReady);

    // Minimum 1.5 seconds splash time
    const timer = setTimeout(() => {
      if (isAuthenticated && sessionReady) {
        // User is logged in, navigate to tabs (will be handled by _layout.tsx redirect)
        console.log('[splash] User authenticated, navigating');
        router.replace('/(tabs)');
      } else {
        // User not logged in, go to welcome
        console.log('[splash] User not authenticated, going to welcome');
        router.replace('/(auth)/welcome');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [isAuthLoading, isAuthenticated, sessionReady]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          {/* Outer glow ring */}
          <Animated.View style={[styles.glowRing, styles.glowRingOuter, glowStyle]} />
          {/* Inner glow ring */}
          <Animated.View style={[styles.glowRing, styles.glowRingInner, glowStyle]} />
          {/* Core orb */}
          <Animated.View style={[styles.orb, logoStyle]}>
            <AppText style={styles.orbEmoji}>🌳</AppText>
          </Animated.View>
        </View>

        <Animated.View style={[styles.textBlock, textStyle]}>
          <AppText variant="displayXL" style={styles.appName}>
            Life Skill Tree
          </AppText>
          <AppText variant="bodyLG" color={colors.textSecondary} style={styles.subtitle}>
            Hành trình phát triển bản thân
          </AppText>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.screenPadding,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    width: 160,
    height: 160,
  },
  glowRing: {
    position: 'absolute',
    borderRadius: 9999,
  },
  glowRingOuter: {
    width: 160,
    height: 160,
    backgroundColor: `${colors.brandPrimary}20`,
  },
  glowRingInner: {
    width: 120,
    height: 120,
    backgroundColor: `${colors.brandPrimary}40`,
  },
  orb: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.brandPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 12,
  },
  orbEmoji: {
    fontSize: 40,
  },
  textBlock: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  appName: {
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.8,
  },
});
