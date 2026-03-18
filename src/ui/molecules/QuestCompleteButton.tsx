import React, { useRef, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/ui/tokens';

type ButtonState = 'idle' | 'animating' | 'done';

interface QuestCompleteButtonProps {
  questId: string;
  xpReward: number;
  isCompleted: boolean;
  sessionCombo: number;
  onComplete: () => void;
  isGated?: boolean; // quest locked due to low stamina
  staminaStatus?: 'ok' | 'warning' | 'debuff' | 'gate';
}

export function QuestCompleteButton({
  questId,
  xpReward,
  isCompleted,
  sessionCombo,
  onComplete,
  isGated = false,
  staminaStatus = 'ok',
}: QuestCompleteButtonProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [btnState, setBtnState] = useState<ButtonState>(
    isCompleted ? 'done' : 'idle',
  );
  const [showComboToast, setShowComboToast] = useState(false);

  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const xpFlyY = useRef(new Animated.Value(0)).current;
  const xpFlyOpacity = useRef(new Animated.Value(0)).current;
  const bgColorAnim = useRef(new Animated.Value(0)).current; // 0=primary, 1=success

  const handlePress = useCallback(() => {
    if (btnState !== 'idle' || isGated) return;
    setBtnState('animating');

    // 1. Scale bounce
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.15,
        useNativeDriver: true,
        stiffness: 400,
        damping: 10,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        stiffness: 300,
        damping: 20,
      }),
    ]).start();

    // 2. XP fly-up
    xpFlyOpacity.setValue(1);
    xpFlyY.setValue(0);
    Animated.parallel([
      Animated.timing(xpFlyY, {
        toValue: -50,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(400),
        Animated.timing(xpFlyOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 3. BG color to success
    Animated.timing(bgColorAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setBtnState('done');
    });

    // 4. Haptic
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // 5. Combo toast
    if (sessionCombo >= 2) {
      setShowComboToast(true);
      setTimeout(() => setShowComboToast(false), 2000);
    }

    // 6. Trigger actual completion
    onComplete();
  }, [btnState, scaleAnim, xpFlyY, xpFlyOpacity, bgColorAnim, sessionCombo, onComplete, isGated]);

  const bgColor = bgColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.brandPrimary, colors.finance], // finance = success/green color
  });

  // Gated state (stamina = 0, career/finance quest)
  if (isGated) {
    return (
      <View style={styles.container}>
        <View style={styles.wrapper}>
          <View
            style={[
              styles.shadow,
              { backgroundColor: colors.danger },
            ]}
          />
          <View
            style={[
              styles.btn,
              { backgroundColor: colors.danger, borderColor: colors.textPrimary },
            ]}
          >
            <View style={styles.btnTouchable}>
              <Text style={[styles.btnText, { fontFamily: 'SpaceGrotesk-Bold' }]}>
                ⚡ Năng Lượng Cạn Kiệt
              </Text>
              <Text style={[styles.gatedSubtitle, { fontFamily: 'SpaceGrotesk-Regular' }]}>
                Hoàn thành Wellbeing quest để hồi phục
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // Completed state
  if (btnState === 'done' || isCompleted) {
    return (
      <View style={styles.wrapper}>
        <View
          style={[
            styles.shadow,
            { backgroundColor: colors.textPrimary },
          ]}
        />
        <View
          style={[
            styles.btn,
            { backgroundColor: colors.finance, borderColor: colors.textPrimary },
          ]}
        >
          <Text style={[styles.btnText, { fontFamily: 'SpaceGrotesk-Bold' }]}>
            Completed ✓
          </Text>
        </View>
      </View>
    );
  }

  // Active state
  return (
    <View style={styles.container}>
      {/* XP fly-up label */}
      <Animated.Text
        style={[
          styles.xpFlyLabel,
          {
            color: colors.finance,
            fontFamily: 'SpaceGrotesk-Bold',
            opacity: xpFlyOpacity,
            transform: [{ translateY: xpFlyY }],
          },
        ]}
      >
        +{xpReward} XP
      </Animated.Text>

      {/* Stamina badge for warning/debuff */}
      {(staminaStatus === 'warning' || staminaStatus === 'debuff') && (
        <View
          style={[
            styles.staminaBadge,
            {
              backgroundColor:
                staminaStatus === 'debuff' ? colors.danger : colors.warning,
              borderColor: colors.textPrimary,
            },
          ]}
        >
          <Text style={[styles.staminaBadgeText, { fontFamily: 'SpaceGrotesk-Bold' }]}>
            XP {staminaStatus === 'debuff' ? '-50%' : '-25%'}
          </Text>
        </View>
      )}

      {/* Combo toast */}
      {showComboToast && (
        <View
          style={[
            styles.comboToast,
            { backgroundColor: colors.wellbeing, borderColor: colors.textPrimary },
          ]}
        >
          <Text style={[styles.comboText, { fontFamily: 'SpaceGrotesk-Bold' }]}>
            🔥 Combo x{sessionCombo >= 4 ? '1.75' : '1.5'}
          </Text>
        </View>
      )}

      <Animated.View
        style={[
          styles.wrapper,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View
          style={[
            styles.shadow,
            { backgroundColor: colors.textPrimary },
          ]}
        />
        <Animated.View
          style={[
            styles.btn,
            { backgroundColor: bgColor, borderColor: colors.textPrimary },
          ]}
        >
          <TouchableOpacity
            onPress={handlePress}
            style={styles.btnTouchable}
            activeOpacity={0.9}
          >
            <Text
              style={[
                styles.btnText,
                { fontFamily: 'SpaceGrotesk-Bold' },
              ]}
            >
              {btnState === 'animating' ? '✓ Done!' : 'Mark Complete'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      gap: 8,
    },
    wrapper: {
      position: 'relative',
      width: '100%',
    },
    shadow: {
      position: 'absolute',
      top: 5,
      left: 5,
      right: -5,
      bottom: -5,
      borderRadius: 14,
    },
    btn: {
      borderWidth: 2.5,
      borderRadius: 14,
      overflow: 'hidden',
    },
    btnTouchable: {
      padding: 16,
      alignItems: 'center',
    },
    btnText: {
      fontSize: 17,
      color: '#fff',
    },
    gatedSubtitle: {
      fontSize: 12,
      color: '#fff',
      marginTop: 4,
      opacity: 0.9,
    },
    xpFlyLabel: {
      fontSize: 22,
      position: 'absolute',
      top: -30,
      alignSelf: 'center',
      zIndex: 10,
    },
    staminaBadge: {
      borderWidth: 2,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 4,
      position: 'absolute',
      top: -50,
      alignSelf: 'center',
    },
    staminaBadgeText: {
      fontSize: 12,
      color: '#fff',
    },
    comboToast: {
      borderWidth: 2,
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 6,
      position: 'absolute',
      top: -60,
      alignSelf: 'center',
    },
    comboText: {
      fontSize: 14,
      color: '#000',
    },
  });
