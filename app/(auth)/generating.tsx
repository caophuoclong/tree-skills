import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AppText } from '@/src/ui/atoms/Text';
import { ProgressBar } from '@/src/ui/atoms/ProgressBar';
import { useTheme } from '@/src/ui/tokens';
import { Spacing } from '@/src/ui/tokens/spacing';

const STATUS_MESSAGES = [
  'Phân tích kết quả...',
  'Xây dựng cây kỹ năng...',
  'Cá nhân hóa lộ trình...',
];

export default function GeneratingScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [statusIndex, setStatusIndex] = useState(0);
  const [progressValue, setProgressValue] = useState(0);

  const treeScale = useSharedValue(0.3);
  const treeOpacity = useSharedValue(0);

  useEffect(() => {
    // Tree entry animation
    treeOpacity.value = withTiming(1, { duration: 400 });
    treeScale.value = withSpring(1, { stiffness: 80, damping: 14 });

    // Progress bar over 3 seconds
    const progressStart = Date.now();
    const progressDuration = 3000;
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - progressStart;
      const pct = Math.min(100, (elapsed / progressDuration) * 100);
      setProgressValue(pct);
      if (pct >= 100) clearInterval(progressInterval);
    }, 30);

    // Cycle status messages every 1 second
    const msg1 = setTimeout(() => setStatusIndex(1), 1000);
    const msg2 = setTimeout(() => setStatusIndex(2), 2000);

    // Navigate after 3.5 seconds
    const nav = setTimeout(() => {
      router.replace('/(auth)/reveal');
    }, 3500);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(msg1);
      clearTimeout(msg2);
      clearTimeout(nav);
    };
  }, []);

  const treeStyle = useAnimatedStyle(() => ({
    opacity: treeOpacity.value,
    transform: [{ scale: treeScale.value }],
  }));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Tree */}
        <Animated.View style={[styles.treeContainer, treeStyle]}>
          <AppText style={styles.treeEmoji}>🌳</AppText>
        </Animated.View>

        <AppText variant="displayLG" style={styles.headline}>
          Đang tạo cây kỹ năng...
        </AppText>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <ProgressBar
            value={progressValue}
            color={colors.brandPrimary}
            variant="thick"
            animated={false}
          />
          <View style={styles.progressRow}>
            <AppText variant="body" color={colors.textSecondary}>
              {STATUS_MESSAGES[statusIndex]}
            </AppText>
            <AppText variant="caption" color={colors.textMuted}>
              {Math.round(progressValue)}%
            </AppText>
          </View>
        </View>

        <AppText variant="body" color={colors.textMuted} style={styles.hint}>
          Chỉ mất vài giây thôi...
        </AppText>
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
    gap: Spacing.xl,
  },
  treeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  treeEmoji: {
    fontSize: 96,
  },
  headline: {
    color: colors.textPrimary,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    gap: Spacing.sm,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hint: {
    textAlign: 'center',
    opacity: 0.6,
  },
});
