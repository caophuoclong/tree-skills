import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AppText } from '@/src/ui/atoms/Text';
import { Button } from '@/src/ui/atoms/Button';
import { GlassView } from '@/src/ui/atoms/GlassView';
import { ProgressBar } from '@/src/ui/atoms/ProgressBar';
import { useOnboardingStore } from '@/src/business-logic/stores/onboardingStore';
import { Colors } from '@/src/ui/tokens/colors';
import { Spacing, Radius } from '@/src/ui/tokens/spacing';
import type { Branch } from '@/src/business-logic/types';

const BRANCH_META: Record<Branch, { label: string; icon: string; color: string }> = {
  career: { label: 'Sự nghiệp', icon: '💼', color: Colors.career },
  finance: { label: 'Tài chính', icon: '💰', color: Colors.finance },
  softskills: { label: 'Kỹ năng mềm', icon: '🤝', color: Colors.softskills },
  wellbeing: { label: 'Sức khoẻ tinh thần', icon: '🌿', color: Colors.wellbeing },
};

const ALL_BRANCHES: Branch[] = ['career', 'finance', 'softskills', 'wellbeing'];

function BranchRow({
  branch,
  weight,
  maxWeight,
  isPrimary,
  delay,
}: {
  branch: Branch;
  weight: number;
  maxWeight: number;
  isPrimary: boolean;
  delay: number;
}) {
  const meta = BRANCH_META[branch];
  const percentage = maxWeight > 0 ? Math.round((weight / maxWeight) * 100) : 0;

  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-20);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    translateX.value = withDelay(delay, withSpring(0, { stiffness: 120, damping: 18 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <View style={styles.branchRow}>
        <View style={styles.branchInfo}>
          <View style={[styles.branchDot, { backgroundColor: meta.color }]} />
          <AppText variant="body" color={isPrimary ? Colors.textPrimary : Colors.textSecondary}>
            {meta.icon} {meta.label}
          </AppText>
          {isPrimary && (
            <View style={[styles.primaryBadge, { backgroundColor: `${meta.color}20` }]}>
              <AppText variant="micro" color={meta.color} style={styles.primaryBadgeText}>
                CHÍNH
              </AppText>
            </View>
          )}
        </View>
        <View style={styles.branchBarWrapper}>
          <ProgressBar
            value={percentage}
            color={meta.color}
            variant="thin"
            style={styles.branchBar}
          />
          <AppText variant="caption" color={Colors.textMuted} style={styles.branchPct}>
            {percentage}%
          </AppText>
        </View>
      </View>
    </Animated.View>
  );
}

export default function RevealScreen() {
  const treeConfig = useOnboardingStore((s) => s.treeConfig);

  const headerOpacity = useSharedValue(0);
  const headerScale = useSharedValue(0.8);
  const primaryCardOpacity = useSharedValue(0);
  const primaryCardScale = useSharedValue(0.9);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 500 });
    headerScale.value = withSpring(1, { stiffness: 100, damping: 15 });
    primaryCardOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));
    primaryCardScale.value = withDelay(300, withSpring(1, { stiffness: 100, damping: 15 }));
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ scale: headerScale.value }],
  }));

  const primaryCardStyle = useAnimatedStyle(() => ({
    opacity: primaryCardOpacity.value,
    transform: [{ scale: primaryCardScale.value }],
  }));

  const primaryBranch: Branch = treeConfig?.primaryBranch ?? 'career';
  const branchWeights = treeConfig?.branchWeights ?? {
    career: 0,
    finance: 0,
    softskills: 0,
    wellbeing: 0,
  };

  const primaryMeta = BRANCH_META[primaryBranch];
  const totalAnswers = Object.values(branchWeights).reduce((s, v) => s + v, 0);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[styles.header, headerStyle]}>
          <AppText style={styles.trophyEmoji}>🏆</AppText>
          <AppText variant="displayXL" style={styles.title}>
            Cây kỹ năng của bạn{'\n'}đã sẵn sàng!
          </AppText>
          <AppText variant="bodyLG" color={Colors.textSecondary} style={styles.subtitle}>
            Dựa trên câu trả lời, chúng tôi đã xây dựng lộ trình cá nhân hoá riêng cho bạn.
          </AppText>
        </Animated.View>

        {/* Primary Branch Card */}
        <Animated.View style={primaryCardStyle}>
          <GlassView
            style={StyleSheet.flatten([
              styles.primaryCard,
              {
                borderColor: primaryMeta.color,
                shadowColor: primaryMeta.color,
              },
            ])}
          >
            <View style={[styles.primaryIconWrapper, { backgroundColor: `${primaryMeta.color}20` }]}>
              <AppText style={styles.primaryIcon}>{primaryMeta.icon}</AppText>
            </View>
            <AppText variant="caption" color={Colors.textMuted} style={styles.primaryLabel}>
              NHÁNH CHÍNH CỦA BẠN
            </AppText>
            <AppText variant="displayLG" color={primaryMeta.color} style={styles.primaryName}>
              {primaryMeta.label}
            </AppText>
            <AppText variant="body" color={Colors.textSecondary} style={styles.primaryDesc}>
              Chúng tôi sẽ ưu tiên các quest và kỹ năng giúp bạn phát triển trong lĩnh vực này.
            </AppText>
          </GlassView>
        </Animated.View>

        {/* Branch breakdown */}
        <View style={styles.section}>
          <AppText variant="title" color={Colors.textPrimary} style={styles.sectionTitle}>
            Phân tích kết quả
          </AppText>
          <GlassView style={styles.branchBreakdown}>
            {ALL_BRANCHES.map((branch, i) => (
              <BranchRow
                key={branch}
                branch={branch}
                weight={branchWeights[branch] ?? 0}
                maxWeight={totalAnswers}
                isPrimary={branch === primaryBranch}
                delay={500 + i * 80}
              />
            ))}
          </GlassView>
        </View>

        {/* CTA */}
        <Button
          variant="primary"
          fullWidth
          onPress={() => router.replace('/(tabs)')}
          style={styles.ctaBtn}
        >
          Bắt đầu hành trình
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing['2xl'],
    gap: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  trophyEmoji: {
    fontSize: 64,
    marginBottom: Spacing.sm,
  },
  title: {
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.85,
  },
  primaryCard: {
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    alignItems: 'center',
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    gap: Spacing.sm,
  },
  primaryIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  primaryIcon: {
    fontSize: 30,
  },
  primaryLabel: {
    letterSpacing: 1,
  },
  primaryName: {
    textAlign: 'center',
  },
  primaryDesc: {
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.85,
  },
  section: {
    gap: Spacing.md,
  },
  sectionTitle: {},
  branchBreakdown: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    gap: Spacing.md,
  },
  branchRow: {
    gap: Spacing.sm,
  },
  branchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  branchDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  primaryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    marginLeft: 4,
  },
  primaryBadgeText: {
    letterSpacing: 0.5,
  },
  branchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  branchBar: {
    flex: 1,
  },
  branchPct: {
    minWidth: 36,
    textAlign: 'right',
  },
  ctaBtn: {
    shadowColor: Colors.brandPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
