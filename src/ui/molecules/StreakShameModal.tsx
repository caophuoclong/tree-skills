import { Emoji } from "@/src/ui/atoms/Emoji";
import { AppText } from "@/src/ui/atoms/Text";
import { useTheme } from "@/src/ui/tokens";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface StreakShameModalProps {
  visible: boolean;
  streak: number;
  onDismiss: () => void;
}

export function StreakShameModal({
  visible,
  streak,
  onDismiss,
}: StreakShameModalProps) {
  const { colors } = useTheme();
  const shake = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!visible) return;

    // Haptic warning
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    // Entry animation
    Animated.spring(scale, {
      toValue: 1,
      stiffness: 200,
      damping: 20,
      useNativeDriver: true,
    }).start();

    // Shake the flame
    const shakeAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(shake, { toValue: -6, duration: 80, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 6, duration: 80, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -4, duration: 80, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 80, useNativeDriver: true }),
        Animated.delay(1500),
      ]),
    );
    shakeAnim.start();

    // Compute seconds until midnight
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    setSecondsLeft(Math.floor((midnight.getTime() - now.getTime()) / 1000));

    // Countdown timer
    const interval = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);

    return () => {
      clearInterval(interval);
      shakeAnim.stop();
      scale.setValue(0.8);
    };
  }, [visible]);

  const hours = Math.floor(secondsLeft / 3600);
  const mins = Math.floor((secondsLeft % 3600) / 60);
  const secs = secondsLeft % 60;
  const countdown =
    hours > 0
      ? `${hours}h ${mins}m`
      : `${mins}:${String(secs).padStart(2, "0")}`;

  const handleDoQuest = () => {
    onDismiss();
    router.push("/(tabs)/quests");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: colors.bgElevated, borderColor: colors.danger },
            { transform: [{ scale }] },
          ]}
        >
          {/* Flame header */}
          <Animated.View style={{ transform: [{ translateX: shake }] }}>
            <AppText style={styles.flameRow}>🔥🔥🔥</AppText>
          </Animated.View>

          <AppText
            variant="displayLG"
            color={colors.danger}
            style={styles.streakNumber}
          >
            {streak}
          </AppText>
          <AppText
            variant="title"
            color={colors.textPrimary}
            style={styles.heading}
          >
            NGÀY LIÊN TIẾP SẮP MẤT!
          </AppText>

          <View style={[styles.countdownBox, { borderColor: colors.danger + "66" }]}>
            <AppText variant="caption" color={colors.textMuted}>
              Còn
            </AppText>
            <AppText
              variant="displayLG"
              color={colors.danger}
              style={styles.countdownText}
            >
              {countdown}
            </AppText>
            <AppText variant="caption" color={colors.textMuted}>
              để cứu streak
            </AppText>
          </View>

          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: colors.danger }]}
            onPress={handleDoQuest}
            activeOpacity={0.85}
          >
            <AppText variant="title" color="#fff" style={styles.ctaText}>
              ⚡ Làm 1 quest để cứu streak →
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity onPress={onDismiss} style={styles.dismissBtn}>
            <AppText variant="caption" color={colors.textMuted}>
              Bỏ qua (mất streak)
            </AppText>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 3,
    padding: 28,
    alignItems: "center",
    gap: 12,
  },
  flameRow: {
    fontSize: 48,
    textAlign: "center",
  },
  streakNumber: {
    fontSize: 72,
    fontWeight: "900",
    lineHeight: 76,
  },
  heading: {
    fontWeight: "900",
    letterSpacing: 1,
    textAlign: "center",
  },
  countdownBox: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    marginVertical: 4,
    gap: 2,
  },
  countdownText: {
    fontWeight: "900",
    fontFamily: "SpaceGrotesk-Bold",
  },
  ctaButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  ctaText: {
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  dismissBtn: {
    paddingVertical: 8,
    marginTop: 4,
  },
});
