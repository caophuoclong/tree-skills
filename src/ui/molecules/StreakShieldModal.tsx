/**
 * StreakShieldModal — Bottom sheet modal for the Streak Shield micro-interaction
 *
 * Shows a mood emoji selector (5 choices) to activate the daily streak shield.
 * After selection, displays "Streak Shield Activated!" with confetti-style animation.
 */
import { NeoBrutalBox } from '@/src/ui/atoms';
import { AppText } from '@/src/ui/atoms/Text';
import { Emoji } from '@/src/ui/atoms/Emoji';
import { useTheme } from '@/src/ui/tokens';
import { Spacing, Radius } from '@/src/ui/tokens/spacing';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { MoodScore } from '@/src/business-logic/types';

interface StreakShieldModalProps {
  visible: boolean;
  streak: number;
  onActivate: (mood: MoodScore) => void;
  onClose: () => void;
}

const MOOD_EMOJIS: { score: MoodScore; emoji: string }[] = [
  { score: 1, emoji: '😞' },
  { score: 2, emoji: '😕' },
  { score: 3, emoji: '😐' },
  { score: 4, emoji: '🙂' },
  { score: 5, emoji: '😄' },
];

export function StreakShieldModal({
  visible,
  streak,
  onActivate,
  onClose,
}: StreakShieldModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [selectedMood, setSelectedMood] = useState<MoodScore | null>(null);
  const [isActivated, setIsActivated] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible && !isActivated) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, isActivated]);

  const handleMoodSelect = (mood: MoodScore) => {
    setSelectedMood(mood);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Show activation message
    setTimeout(() => {
      setIsActivated(true);
      // Pulse animation
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Close and trigger callback after 1.2s
      setTimeout(() => {
        onActivate(mood);
        handleClose();
      }, 1200);
    }, 300);
  };

  const handleClose = () => {
    scaleAnim.setValue(0);
    opacityAnim.setValue(0);
    setSelectedMood(null);
    setIsActivated(false);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.wrapper,
            { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <NeoBrutalBox
            backgroundColor={colors.bgSurface}
            borderColor={colors.brandPrimary}
            shadowColor={colors.brandPrimary}
            shadowOffsetX={6}
            shadowOffsetY={6}
            borderWidth={2.5}
            borderRadius={24}
            contentStyle={styles.card}
          >
            {/* Accent strip */}
            <View
              style={[
                styles.accentStrip,
                { backgroundColor: colors.brandPrimary },
              ]}
            />

            {isActivated ? (
              <Animated.View
                style={[
                  styles.activationMessage,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <Emoji size={56}>✨</Emoji>
                <Text style={[styles.activationTitle, { color: colors.textPrimary }]}>
                  Streak Shield Activated!
                </Text>
                <Text style={[styles.activationSub, { color: colors.textSecondary }]}>
                  Streak Protected ✓
                </Text>
              </Animated.View>
            ) : (
              <>
                <Text style={[styles.title, { color: colors.textPrimary }]}>
                  Bảo Vệ Streak Hôm Nay
                </Text>
                <Text
                  style={[styles.subtitle, { color: colors.textSecondary }]}
                >
                  Chỉ 1 phút để giữ chuỗi của bạn
                </Text>

                {/* Streak display */}
                <View
                  style={[
                    styles.streakDisplayBox,
                    { backgroundColor: colors.bgElevated },
                  ]}
                >
                  <Emoji size={32}>🔥</Emoji>
                  <Text
                    style={[
                      styles.streakNumber,
                      { color: colors.warning },
                    ]}
                  >
                    {streak}
                  </Text>
                  <Text
                    style={[
                      styles.streakLabel,
                      { color: colors.textMuted },
                    ]}
                  >
                    NGÀY LIÊN TỤC
                  </Text>
                </View>

                {/* Mood selector */}
                <Text
                  style={[
                    styles.moodLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Bạn cảm thấy thế nào?
                </Text>
                <View style={styles.moodGrid}>
                  {MOOD_EMOJIS.map((mood) => (
                    <TouchableOpacity
                      key={mood.score}
                      onPress={() => handleMoodSelect(mood.score)}
                      activeOpacity={0.7}
                      style={[
                        styles.moodButton,
                        selectedMood === mood.score &&
                          styles.moodButtonSelected,
                      ]}
                    >
                      <Emoji size={32}>{mood.emoji}</Emoji>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </NeoBrutalBox>
        </Animated.View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingBottom: Spacing.xl,
    },
    wrapper: { width: '90%' },
    card: {
      padding: Spacing.lg,
      alignItems: 'center',
    },
    accentStrip: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 5,
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
    },
    title: {
      fontSize: 20,
      fontFamily: 'SpaceGrotesk-Bold',
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: Spacing.xs,
      marginTop: Spacing.sm,
    },
    subtitle: {
      fontSize: 14,
      fontFamily: 'SpaceGrotesk-Regular',
      textAlign: 'center',
      marginBottom: Spacing.md,
    },
    streakDisplayBox: {
      alignItems: 'center',
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.md,
      borderRadius: Radius.md,
      marginBottom: Spacing.lg,
      width: '100%',
      gap: Spacing.xs,
    },
    streakNumber: {
      fontSize: 48,
      fontFamily: 'SpaceMono-Bold',
      fontWeight: '700',
      lineHeight: 52,
    },
    streakLabel: {
      fontSize: 10,
      fontFamily: 'SpaceGrotesk-Bold',
      fontWeight: '700',
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    moodLabel: {
      fontSize: 12,
      fontFamily: 'SpaceGrotesk-SemiBold',
      fontWeight: '600',
      marginBottom: Spacing.md,
    },
    moodGrid: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      width: '100%',
      marginBottom: Spacing.sm,
    },
    moodButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    moodButtonSelected: {
      borderColor: colors.brandPrimary,
      backgroundColor: `${colors.brandPrimary}15`,
    },
    activationMessage: {
      alignItems: 'center',
      gap: Spacing.md,
      paddingVertical: Spacing.lg,
    },
    activationTitle: {
      fontSize: 22,
      fontFamily: 'SpaceGrotesk-Bold',
      fontWeight: '700',
      textAlign: 'center',
    },
    activationSub: {
      fontSize: 14,
      fontFamily: 'SpaceGrotesk-SemiBold',
      fontWeight: '600',
    },
  });
