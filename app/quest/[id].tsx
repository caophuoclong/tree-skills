import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useQuestManager } from '@/src/business-logic/hooks/useQuestManager';
import { AppText } from '@/src/ui/atoms/Text';
import { Badge } from '@/src/ui/atoms/Badge';
import { Colors, BranchColors, BranchColor } from '@/src/ui/tokens/colors';
import { Spacing, Radius } from '@/src/ui/tokens/spacing';
import type { Quest } from '@/src/business-logic/types/index';

// --- Timer helpers ---

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// --- Instructions helpers ---

function parseSteps(description: string): string[] {
  const sentences = description
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return sentences.length > 0 ? sentences : [description];
}

// --- Branch label map ---

const BRANCH_LABELS: Record<string, string> = {
  career: 'Sự nghiệp',
  finance: 'Tài chính',
  softskills: 'Kỹ năng mềm',
  wellbeing: 'Sức khoẻ',
};

export default function QuestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { quests, completeQuest } = useQuestManager();

  const quest: Quest | undefined = quests.find((q) => q.quest_id === id);

  const isCompleted = quest ? quest.completed_at !== null : false;
  const branchColor =
    quest && (quest.branch as BranchColor) in BranchColors
      ? BranchColors[quest.branch as BranchColor]
      : Colors.brandPrimary;

  // Timer state
  const totalSeconds = quest ? quest.duration_min * 60 : 0;
  const [timerState, setTimerState] = useState<'idle' | 'running' | 'done'>('idle');
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Success animation
  const successScale = useSharedValue(0);
  const successOpacity = useSharedValue(0);

  const completeAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
    opacity: successOpacity.value,
  }));

  // Button animation
  const btnScale = useSharedValue(1);
  const btnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  useEffect(() => {
    if (quest) {
      setSecondsLeft(quest.duration_min * 60);
    }
  }, [quest?.duration_min]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startTimer = useCallback(() => {
    if (timerState !== 'idle') return;
    setTimerState('running');
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setTimerState('done');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [timerState]);

  const handleComplete = useCallback(() => {
    if (!quest || isCompleted) return;
    if (intervalRef.current) clearInterval(intervalRef.current);

    completeQuest(quest.quest_id);

    // Trigger success animation
    successOpacity.value = withTiming(1, { duration: 200 });
    successScale.value = withSequence(
      withSpring(1.2, { stiffness: 300, damping: 20 }),
      withSpring(1, { stiffness: 200, damping: 15 }),
    );

    btnScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 }),
    );

    // Close after animation
    setTimeout(() => {
      router.back();
    }, 1200);
  }, [quest, isCompleted, completeQuest, successOpacity, successScale, btnScale]);

  if (!quest) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.notFound}>
          <AppText variant="body" color={Colors.textSecondary}>
            Không tìm thấy nhiệm vụ.
          </AppText>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const steps = parseSteps(quest.description);
  const isRunning = timerState === 'running';
  const isDone = timerState === 'done';

  return (
    <View style={styles.container}>
      {/* Drag handle */}
      <View style={styles.dragHandle} />

      {/* Close button */}
      <TouchableOpacity style={styles.closeButton} onPress={() => router.back()} hitSlop={12}>
        <Ionicons name="close" size={22} color={Colors.textSecondary} />
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Branch accent bar */}
        <View style={[styles.branchAccentBar, { backgroundColor: branchColor }]} />

        {/* Quest title */}
        <AppText variant="displayLG" color={Colors.textPrimary} style={styles.questTitle}>
          {quest.title}
        </AppText>

        {/* Description */}
        <AppText variant="body" color={Colors.textSecondary} style={styles.description}>
          {quest.description}
        </AppText>

        {/* Metadata row */}
        <View style={styles.metaRow}>
          <Badge
            variant="branch"
            value={BRANCH_LABELS[quest.branch] ?? quest.branch}
            branch={quest.branch as BranchColor}
          />
          <Badge variant="duration" value={quest.duration_min} />
          <Badge variant="xp" value={quest.xp_reward} />
        </View>

        {/* Separator */}
        <View style={styles.separator} />

        {/* Instructions section */}
        <View style={styles.instructionsSection}>
          <AppText variant="caption" color={Colors.textMuted} style={styles.sectionLabel}>
            HƯỚNG DẪN THỰC HIỆN
          </AppText>

          {steps.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={[styles.stepNumber, { backgroundColor: `${branchColor}33` }]}>
                <AppText
                  variant="micro"
                  color={branchColor}
                  style={styles.stepNumberText}
                >
                  {index + 1}
                </AppText>
              </View>
              <AppText variant="body" color={Colors.textSecondary} style={styles.stepText}>
                {step}
              </AppText>
            </View>
          ))}
        </View>

        {/* Separator */}
        <View style={styles.separator} />

        {/* Timer section */}
        <View style={styles.timerSection}>
          <AppText variant="caption" color={Colors.textMuted} style={styles.sectionLabel}>
            THỜI GIAN
          </AppText>

          <View style={styles.timerDisplay}>
            <AppText
              variant="displayXL"
              color={isRunning ? branchColor : isDone ? Colors.success : Colors.textPrimary}
              style={styles.timerText}
            >
              {formatTime(secondsLeft)}
            </AppText>
            {isRunning && (
              <View style={styles.runningIndicator}>
                <View style={[styles.runningDot, { backgroundColor: Colors.success }]} />
                <AppText variant="micro" color={Colors.success}>
                  Đang chạy
                </AppText>
              </View>
            )}
            {isDone && (
              <AppText variant="caption" color={Colors.success} style={styles.timerDoneLabel}>
                Hoàn thành thời gian!
              </AppText>
            )}
          </View>
        </View>

        {/* Spacer for button */}
        <View style={styles.buttonSpacer} />
      </ScrollView>

      {/* Success overlay */}
      <Animated.View style={[styles.successOverlay, completeAnimStyle]} pointerEvents="none">
        <Ionicons name="checkmark-circle" size={80} color={Colors.success} />
        <AppText variant="title" color={Colors.success} style={styles.successText}>
          Tuyệt vời!
        </AppText>
      </Animated.View>

      {/* Bottom action button */}
      <View style={styles.bottomArea}>
        {isCompleted ? (
          <View style={[styles.actionButton, styles.completedButton]}>
            <Ionicons name="checkmark" size={20} color={Colors.success} />
            <AppText variant="body" color={Colors.success} style={styles.btnLabel}>
              Đã hoàn thành ✓
            </AppText>
          </View>
        ) : timerState === 'idle' ? (
          <Animated.View style={btnAnimStyle}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: branchColor }]}
              onPress={startTimer}
              activeOpacity={0.85}
            >
              <Ionicons name="play" size={20} color="#FFFFFF" />
              <AppText variant="body" color="#FFFFFF" style={styles.btnLabel}>
                Bắt đầu nhiệm vụ
              </AppText>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <Animated.View style={btnAnimStyle}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: Colors.success }]}
              onPress={handleComplete}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              <AppText variant="body" color="#FFFFFF" style={styles.btnLabel}>
                Hoàn thành nhiệm vụ
              </AppText>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgSurface,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.glassBorder,
    alignSelf: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.screenPadding,
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing['2xl'],
  },
  branchAccentBar: {
    height: 3,
    borderRadius: Radius.full,
    marginBottom: Spacing.lg,
    marginTop: Spacing.sm,
    opacity: 0.7,
  },
  questTitle: {
    marginBottom: Spacing.sm,
  },
  description: {
    marginBottom: Spacing.md,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
    marginBottom: Spacing.md,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.glassBorder,
    marginVertical: Spacing.md,
  },
  instructionsSection: {
    gap: Spacing.sm,
  },
  sectionLabel: {
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  stepRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumberText: {
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    paddingTop: 2,
  },
  timerSection: {
    gap: Spacing.sm,
  },
  timerDisplay: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  timerText: {
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  runningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  runningDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  timerDoneLabel: {
    marginTop: Spacing.xs,
  },
  buttonSpacer: {
    height: Spacing.xl,
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${Colors.bgSurface}CC`,
    gap: Spacing.md,
  },
  successText: {
    marginTop: Spacing.sm,
  },
  bottomArea: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
    backgroundColor: Colors.bgSurface,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
  },
  completedButton: {
    backgroundColor: `${Colors.success}1A`,
    borderWidth: 1,
    borderColor: `${Colors.success}33`,
  },
  btnLabel: {
    fontWeight: '600',
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  closeBtn: {
    padding: Spacing.sm,
  },
});
