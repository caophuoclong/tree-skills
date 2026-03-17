import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { GlassView } from '@/src/ui/atoms/GlassView';
import { AppText } from '@/src/ui/atoms/Text';
import { ProgressBar } from '@/src/ui/atoms/ProgressBar';
import { Button } from '@/src/ui/atoms/Button';
import { Colors } from '@/src/ui/tokens/colors';
import { Spacing, Radius } from '@/src/ui/tokens/spacing';
import type { Branch } from '@/src/business-logic/types';

interface AssessmentOption {
  label: string;
  branch: Branch;
}

interface OnboardingStepProps {
  question: string;
  options: AssessmentOption[];
  currentIndex: number; // 0-based
  total: number;
  onSelect: (branch: Branch) => void;
  onBack?: () => void;
  onSkip?: () => void;
  showSkip?: boolean;
}

function OptionCard({
  option,
  onPress,
}: {
  option: AssessmentOption;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

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
        <GlassView style={styles.optionCard}>
          <AppText variant="bodyLG" color={Colors.textPrimary}>
            {option.label}
          </AppText>
        </GlassView>
      </Animated.View>
    </TouchableOpacity>
  );
}

export function OnboardingStep({
  question,
  options,
  currentIndex,
  total,
  onSelect,
  onBack,
  onSkip,
  showSkip = false,
}: OnboardingStepProps) {
  const progress = ((currentIndex + 1) / total) * 100;

  return (
    <View style={styles.container}>
      {/* Top nav */}
      <View style={styles.topNav}>
        {onBack && currentIndex > 0 ? (
          <Button variant="ghost" onPress={onBack} style={styles.navBtn}>
            ← Quay lại
          </Button>
        ) : (
          <View style={styles.navBtn} />
        )}
        <AppText variant="caption" color={Colors.textMuted}>
          Câu {currentIndex + 1}/{total}
        </AppText>
        {showSkip ? (
          <Button variant="ghost" onPress={onSkip} style={styles.navBtn}>
            Bỏ qua
          </Button>
        ) : (
          <View style={styles.navBtn} />
        )}
      </View>

      {/* Progress bar */}
      <ProgressBar value={progress} color={Colors.brandPrimary} variant="thin" style={styles.progress} />

      {/* Question */}
      <AppText variant="displayLG" color={Colors.textPrimary} style={styles.question}>
        {question}
      </AppText>

      {/* Options */}
      <View style={styles.options}>
        {options.map((opt) => (
          <OptionCard key={opt.branch} option={opt} onPress={() => onSelect(opt.branch)} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.lg,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  navBtn: {
    minWidth: 80,
  },
  progress: {
    marginBottom: Spacing.xl,
  },
  question: {
    marginBottom: Spacing.xl,
    lineHeight: 36,
  },
  options: {
    gap: Spacing.sm,
  },
  optionCard: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    width: '100%',
  },
});
