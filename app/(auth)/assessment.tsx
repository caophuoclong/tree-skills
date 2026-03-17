import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { AppText } from '@/src/ui/atoms/Text';
import { ProgressBar } from '@/src/ui/atoms/ProgressBar';
import { GlassView } from '@/src/ui/atoms/GlassView';
import { useOnboarding } from '@/src/business-logic/hooks/useOnboarding';
import { Colors } from '@/src/ui/tokens/colors';
import { Spacing, Radius } from '@/src/ui/tokens/spacing';
import type { Branch } from '@/src/business-logic/types';

const BRANCH_COLORS: Record<Branch, string> = {
  career: Colors.career,
  finance: Colors.finance,
  softskills: Colors.softskills,
  wellbeing: Colors.wellbeing,
};

const BRANCH_ICONS: Record<Branch, string> = {
  career: '💼',
  finance: '💰',
  softskills: '🤝',
  wellbeing: '🌿',
};

function OptionCard({
  label,
  branch,
  onPress,
}: {
  label: string;
  branch: Branch;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const color = BRANCH_COLORS[branch];
  const icon = BRANCH_ICONS[branch];

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.96, { stiffness: 300, damping: 20 }, () => {
      scale.value = withSpring(1, { stiffness: 300, damping: 20 });
    });
    Haptics.selectionAsync();
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
      <Animated.View style={animStyle}>
        <GlassView
          style={StyleSheet.flatten([
            styles.optionCard,
            {
              borderLeftColor: color,
              borderLeftWidth: 3,
            },
          ])}
        >
          <View style={styles.optionInner}>
            <View style={[styles.optionIconWrapper, { backgroundColor: `${color}20` }]}>
              <AppText style={styles.optionIcon}>{icon}</AppText>
            </View>
            <AppText variant="bodyLG" color={Colors.textPrimary} style={styles.optionLabel}>
              {label}
            </AppText>
          </View>
        </GlassView>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function AssessmentScreen() {
  const {
    currentQuestion,
    currentIndex,
    totalQuestions,
    progress,
    canGoBack,
    selectAnswer,
    goBack,
    skip,
  } = useOnboarding();

  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerContainer}>
          <AppText variant="bodyLG" color={Colors.textSecondary}>
            Đang xử lý...
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Top nav */}
        <View style={styles.topNav}>
          {canGoBack ? (
            <TouchableOpacity
              onPress={goBack}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <AppText variant="bodyLG" color={Colors.textSecondary}>
                ← Quay lại
              </AppText>
            </TouchableOpacity>
          ) : (
            <View style={styles.navPlaceholder} />
          )}

          <AppText variant="caption" color={Colors.textMuted}>
            Câu {currentIndex + 1}/{totalQuestions}
          </AppText>

          <TouchableOpacity
            onPress={skip}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <AppText variant="body" color={Colors.textMuted}>
              Bỏ qua
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        <ProgressBar
          value={progress}
          color={Colors.brandPrimary}
          variant="thin"
          style={styles.progressBar}
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Question */}
          <AppText variant="displayLG" color={Colors.textPrimary} style={styles.question}>
            {currentQuestion.question}
          </AppText>

          {/* Options */}
          <View style={styles.options}>
            {currentQuestion.options.map((opt) => (
              <OptionCard
                key={opt.id}
                label={opt.text}
                branch={opt.branch}
                onPress={() => selectAnswer(opt.branch)}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.md,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  navPlaceholder: {
    minWidth: 80,
  },
  progressBar: {
    marginBottom: Spacing.xl,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing['2xl'],
  },
  question: {
    marginBottom: Spacing.xl,
    lineHeight: 36,
  },
  options: {
    gap: Spacing.cardGap,
  },
  optionCard: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
  },
  optionInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  optionIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  optionIcon: {
    fontSize: 20,
  },
  optionLabel: {
    flex: 1,
    lineHeight: 22,
  },
});
