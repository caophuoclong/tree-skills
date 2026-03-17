import React, { useEffect, useMemo } from 'react';
import { Modal, View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Button } from '@/src/ui/atoms/Button';
import { AppText } from '@/src/ui/atoms/Text';
import { Emoji } from '@/src/ui/atoms/Emoji';
import { useTheme } from '@/src/ui/tokens';
import { Spacing } from '@/src/ui/tokens/spacing';

const { width: W, height: H } = Dimensions.get('window');

interface LevelUpModalProps {
  visible: boolean;
  newLevel: number;
  unlockReward?: string;
  weeklyXP?: number;
  onDismiss: () => void;
}

export function LevelUpModal({ visible, newLevel, unlockReward, weeklyXP, onDismiss }: LevelUpModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);
  const titleScale = useSharedValue(0.3);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, { stiffness: 200, damping: 20 });
      titleScale.value = withDelay(200, withSpring(1, { stiffness: 300, damping: 20 }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = 0.5;
      titleScale.value = 0.3;
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const contentStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const titleStyle = useAnimatedStyle(() => ({ transform: [{ scale: titleScale.value }] }));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onDismiss}>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Animated.View style={[styles.content, contentStyle]}>
          {/* Glow orb */}
          <View style={styles.glowOrb} />

          <Animated.View style={titleStyle}>
            <AppText variant="displayXL" color={colors.brandPrimary} style={styles.title}>
              LEVEL UP!
            </AppText>
          </Animated.View>

          <AppText variant="displayLG" color={colors.textPrimary} style={styles.levelText}>
            Level {newLevel}
          </AppText>

          {unlockReward && (
            <View style={styles.unlockCard}>
              <AppText variant="body" color={colors.textPrimary}>
                <Emoji size={14}>🔓</Emoji>{' '}{unlockReward}
              </AppText>
            </View>
          )}

          {weeklyXP !== undefined && (
            <AppText variant="body" color={colors.textSecondary} style={styles.xpSummary}>
              Bạn đã kiếm được {weeklyXP.toLocaleString()} XP tuần này
            </AppText>
          )}

          <Button variant="primary" fullWidth style={styles.btn} onPress={onDismiss}>
            Tiếp tục
          </Button>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.md,
  },
  glowOrb: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.brandPrimary,
    opacity: 0.1,
    top: -60,
  },
  title: {
    textShadowColor: colors.brandPrimary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    letterSpacing: 4,
  },
  levelText: {
    marginTop: -Spacing.xs,
  },
  unlockCard: {
    backgroundColor: `${colors.brandPrimary}1A`,
    borderWidth: 1,
    borderColor: `${colors.brandPrimary}33`,
    borderRadius: 12,
    padding: Spacing.md,
    width: '100%',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  xpSummary: {
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  btn: {
    marginTop: Spacing.lg,
  },
});
