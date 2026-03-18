import { Emoji } from '@/src/ui/atoms/Emoji';
import { AppText } from '@/src/ui/atoms/Text';
import { useTheme } from '@/src/ui/tokens';
import { Radius, Spacing } from '@/src/ui/tokens/spacing';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

interface StreakShieldBadgeProps {
  shieldsRemaining: number;
  isProtectedToday: boolean;
  onActivate: () => void;
}

export function StreakShieldBadge({
  shieldsRemaining,
  isProtectedToday,
  onActivate,
}: StreakShieldBadgeProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const scale = useSharedValue(1);
  const isDisabled = shieldsRemaining === 0;
  const oldShieldsRemaining = useRef(shieldsRemaining);

  useEffect(() => {
    if (shieldsRemaining < oldShieldsRemaining.current && shieldsRemaining >= 0) {
      scale.value = withSequence(
        withSpring(1.15, { stiffness: 300, damping: 20 }),
        withSpring(1, { stiffness: 300, damping: 20 }),
      );
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    oldShieldsRemaining.current = shieldsRemaining;
  }, [shieldsRemaining]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (!isDisabled && !isProtectedToday) {
      onActivate();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={isDisabled || isProtectedToday}
        activeOpacity={0.7}
        style={styles.touchable}
      >
        <Animated.View
          style={[
            styles.badge,
            isDisabled && styles.badgeDisabled,
            isProtectedToday && styles.badgeProtected,
            animatedStyle,
          ]}
        >
          <Emoji size={16}>🛡️</Emoji>
          <AppText
            variant="caption"
            color={
              isDisabled
                ? colors.textMuted
                : isProtectedToday
                  ? colors.wellbeing
                  : colors.brandPrimary
            }
            style={styles.countText}
          >
            x{shieldsRemaining}
          </AppText>
        </Animated.View>
      </TouchableOpacity>

      {isProtectedToday && (
        <View style={styles.checkmarkContainer}>
          <AppText variant="caption" color={colors.wellbeing}>
            Streak Protected ✓
          </AppText>
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      gap: 4,
    },
    touchable: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: Radius.md,
      borderWidth: 2,
      borderColor: colors.brandPrimary,
      backgroundColor: `${colors.brandPrimary}0D`,
    },
    badgeDisabled: {
      borderColor: colors.textMuted,
      backgroundColor: colors.bgElevated,
      opacity: 0.5,
    },
    badgeProtected: {
      borderColor: colors.wellbeing,
      backgroundColor: `${colors.wellbeing}0D`,
    },
    countText: {
      fontFamily: 'SpaceGrotesk-Bold',
      fontWeight: '700',
    },
    checkmarkContainer: {
      paddingHorizontal: Spacing.xs,
    },
  });
