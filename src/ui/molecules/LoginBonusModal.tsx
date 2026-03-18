/**
 * LoginBonusModal — daily login reward popup (Neobrutalism style)
 *
 * Triggered by userStore.checkDailyLogin() whenever the app opens
 * on a new calendar day. Dismisses on "NHẬN NGAY" tap or auto-dismisses
 * after 4 seconds. Bonus XP scales with the user's current streak.
 */
import { NeoBrutalAccent, NeoBrutalBox } from '@/src/ui/atoms';
import { useUserStore } from '@/src/business-logic/stores/userStore';
import { useTheme } from '@/src/ui/tokens';
import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// Auto-dismiss delay in ms
const AUTO_DISMISS_MS = 4000;

export function LoginBonusModal() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const reward    = useUserStore((s) => s.loginBonusReward);
  const setReward = useUserStore((s) => s.setLoginBonusReward);
  const updateXP  = useUserStore((s) => s.updateXP);
  const streak    = useUserStore((s) => s.user?.streak ?? 0);

  const scaleAnim   = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const autoDismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (reward !== null) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
      autoDismissTimer.current = setTimeout(() => handleClaim(), AUTO_DISMISS_MS);
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
    return () => {
      if (autoDismissTimer.current) clearTimeout(autoDismissTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reward]);

  const handleClaim = () => {
    if (autoDismissTimer.current) clearTimeout(autoDismissTimer.current);
    if (reward !== null) {
      updateXP(reward);
      setReward(null);
    }
  };

  if (reward === null) return null;

  const streakLabel =
    streak >= 7 ? `🏆 Streak ${streak} ngày!` :
    streak >= 3 ? `🔥 Streak ${streak} ngày!` :
    streak > 0  ? `⚡ Ngày thứ ${streak}`      :
                  '🎁 Ngày đầu tiên';

  return (
    <Modal transparent visible animationType="none">
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
            borderRadius={20}
            style={{ width: '100%' }}
            contentStyle={styles.card}
          >
            {/* Accent strip */}
            <View style={[styles.accentStrip, { backgroundColor: colors.brandPrimary }]} />

            <View style={styles.iconRow}>
              <Text style={styles.iconEmoji}>🎁</Text>
            </View>

            <Text style={styles.title}>Quà tặng hằng ngày!</Text>
            <Text style={styles.subtitle}>
              Chào mừng bạn đã quay trở lại. Nhận phần thưởng để bắt đầu ngày mới!
            </Text>

            {/* Streak badge */}
            <NeoBrutalAccent
              accentColor={streak >= 7 ? colors.warning : colors.brandPrimary}
              strokeColor={colors.textPrimary}
              borderRadius={10}
              style={{ alignSelf: 'center', marginVertical: 16 }}
              contentStyle={styles.streakBadge}
            >
              <Text style={styles.streakText}>{streakLabel}</Text>
            </NeoBrutalAccent>

            {/* XP reward */}
            <NeoBrutalBox
              backgroundColor={colors.bgElevated}
              borderColor={colors.softskills}
              shadowColor={colors.softskills}
              shadowOffsetX={4}
              shadowOffsetY={4}
              borderWidth={2}
              borderRadius={16}
              style={{ width: '100%' }}
              contentStyle={styles.xpCard}
            >
              <Text style={[styles.xpAmount, { color: colors.softskills }]}>+{reward}</Text>
              <Text style={[styles.xpUnit, { color: colors.softskills }]}>XP</Text>
            </NeoBrutalBox>

            {/* CTA */}
            <NeoBrutalAccent
              accentColor={colors.brandPrimary}
              strokeColor={colors.textPrimary}
              shadowOffsetX={4}
              shadowOffsetY={4}
              borderRadius={12}
              style={{ width: '100%', marginTop: 20 }}
              contentStyle={styles.claimBtn}
              onPress={handleClaim}
            >
              <Text style={styles.claimBtnText}>NHẬN NGAY</Text>
            </NeoBrutalAccent>
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
      backgroundColor: 'rgba(0,0,0,0.75)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    wrapper: { width: '100%' },
    card: { padding: 24, alignItems: 'center' },
    accentStrip: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 5,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
    },
    iconRow: { marginTop: 10, marginBottom: 8 },
    iconEmoji: { fontSize: 52 },
    title: {
      fontSize: 22,
      fontFamily: 'SpaceGrotesk-Bold',
      fontWeight: '700' as const,
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: 6,
    },
    subtitle: {
      fontSize: 13,
      fontFamily: 'SpaceGrotesk-Regular',
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 19,
      paddingHorizontal: 8,
    },
    streakBadge: { paddingHorizontal: 16, paddingVertical: 6 },
    streakText: {
      fontSize: 13,
      fontFamily: 'SpaceGrotesk-Bold',
      fontWeight: '700' as const,
      color: '#fff',
      letterSpacing: 0.3,
    },
    xpCard: { alignItems: 'center', paddingVertical: 20, gap: 2 },
    xpAmount: {
      fontSize: 42,
      fontFamily: 'SpaceMono-Bold',
      fontWeight: '700' as const,
      lineHeight: 46,
    },
    xpUnit: {
      fontSize: 14,
      fontFamily: 'SpaceGrotesk-Bold',
      fontWeight: '700' as const,
      letterSpacing: 2,
    },
    claimBtn: { alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
    claimBtnText: {
      fontSize: 15,
      fontFamily: 'SpaceGrotesk-Bold',
      fontWeight: '700' as const,
      color: '#fff',
      letterSpacing: 1.5,
    },
  });
