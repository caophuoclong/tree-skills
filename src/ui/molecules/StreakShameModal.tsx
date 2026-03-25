import { NeoBrutalBox } from "@/src/ui/atoms/NeoBrutalBox";
import { AppText } from "@/src/ui/atoms/Text";
import { StreakFlameIcon, getFlameLevel } from "@/src/ui/atoms/FaceIcons";
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

function secondsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
}

/** Two-digit display block for the countdown clock. */
function DigitBlock({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.digitWrap}>
      {/* NB hard shadow — always black */}
      <View style={styles.digitShadow} />
      <View style={styles.digitBox}>
        <AppText style={styles.digitText}>{value}</AppText>
      </View>
      <AppText style={styles.digitLabel}>{label}</AppText>
    </View>
  );
}

export function StreakShameModal({
  visible,
  streak,
  onDismiss,
}: StreakShameModalProps) {
  const { colors } = useTheme();
  const shake = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.82)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const [secondsLeft, setSecondsLeft] = useState(0);

  const flameLevel = getFlameLevel(streak);
  const danger = colors.danger ?? "#EF4444";

  useEffect(() => {
    if (!visible) {
      scale.setValue(0.82);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    // Entry spring
    Animated.spring(scale, {
      toValue: 1,
      stiffness: 220,
      damping: 18,
      useNativeDriver: true,
    }).start();

    // Continuous icon shake
    const shakeLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shake, { toValue: -7, duration: 70, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 7, duration: 70, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -4, duration: 70, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 4, duration: 70, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 70, useNativeDriver: true }),
        Animated.delay(2000),
      ]),
    );
    shakeLoop.start();

    // Border pulse
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.04, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    pulseLoop.start();

    // Countdown
    setSecondsLeft(secondsUntilMidnight());
    const interval = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);

    return () => {
      clearInterval(interval);
      shakeLoop.stop();
      pulseLoop.stop();
    };
  }, [visible]);

  const hours   = Math.floor(secondsLeft / 3600);
  const mins    = Math.floor((secondsLeft % 3600) / 60);
  const secs    = secondsLeft % 60;
  const hh      = String(hours).padStart(2, "0");
  const mm      = String(mins).padStart(2, "0");
  const ss      = String(secs).padStart(2, "0");

  // Progress: fraction of the day remaining (0 = midnight just passed, 1 = whole day left)
  const totalDaySeconds = 86400;
  const progress = secondsLeft / totalDaySeconds;

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
        <Animated.View style={[styles.cardWrap, { transform: [{ scale }] }]}>
          {/* NB hard shadow */}
          <View style={[styles.cardShadow, { backgroundColor: danger }]} />

          {/* Card */}
          <View style={[styles.card, { backgroundColor: colors.bgElevated, borderColor: danger }]}>

            {/* Urgency progress bar — thin strip at top */}
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  { backgroundColor: danger, width: `${Math.round(progress * 100)}%` as any },
                ]}
              />
            </View>

            {/* Flame face icon */}
            <Animated.View style={[styles.iconWrap, { transform: [{ translateX: shake }] }]}>
              <StreakFlameIcon
                streak={Math.max(streak, 3)} // always show at least level-1 flame
                size={80}
              />
            </Animated.View>

            {/* Streak number */}
            <View style={styles.streakRow}>
              <View style={[styles.streakBadgeShadow, { backgroundColor: danger }]} />
              <View style={[styles.streakBadge, { borderColor: danger, backgroundColor: `${danger}18` }]}>
                <AppText style={[styles.streakNumber, { color: danger }]}>
                  {streak}
                </AppText>
                <AppText style={[styles.streakUnit, { color: danger }]}>
                  NGÀY
                </AppText>
              </View>
            </View>

            <AppText
              variant="title"
              color={colors.textPrimary}
              style={styles.heading}
            >
              STREAK SẮP MẤT!
            </AppText>
            <AppText variant="caption" color={colors.textMuted} style={styles.subheading}>
              Hãy hoàn thành 1 nhiệm vụ trước nửa đêm
            </AppText>

            {/* Digital countdown */}
            <View style={styles.countdownRow}>
              <DigitBlock value={hh} label="GIỜ" />
              <AppText style={[styles.colon, { color: colors.textMuted }]}>:</AppText>
              <DigitBlock value={mm} label="PHÚT" />
              <AppText style={[styles.colon, { color: colors.textMuted }]}>:</AppText>
              <DigitBlock value={ss} label="GIÂY" />
            </View>

            {/* CTA */}
            <View style={styles.ctaWrap}>
              <View style={[styles.ctaShadow, { backgroundColor: danger }]} />
              <TouchableOpacity
                style={[styles.ctaBtn, { backgroundColor: danger, borderColor: "#000" }]}
                onPress={handleDoQuest}
                activeOpacity={0.85}
              >
                <AppText style={styles.ctaText}>⚡ LÀM QUEST NGAY →</AppText>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={onDismiss} style={styles.dismissBtn}>
              <AppText variant="caption" color={colors.textMuted}>
                Bỏ qua — chấp nhận mất streak
              </AppText>
            </TouchableOpacity>

          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const SHADOW = 6;
const CARD_RADIUS = 0; // sharp NB corners

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.82)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  // Card frame
  cardWrap: {
    width: "100%",
    paddingRight: SHADOW,
    paddingBottom: SHADOW,
  },
  cardShadow: {
    position: "absolute",
    top: SHADOW,
    left: SHADOW,
    right: 0,
    bottom: 0,
    borderRadius: CARD_RADIUS,
  },
  card: {
    borderWidth: 3,
    borderRadius: CARD_RADIUS,
    padding: 24,
    alignItems: "center",
    gap: 14,
    overflow: "hidden",
  },

  // Progress bar at top edge
  progressTrack: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  progressFill: {
    height: 5,
    borderRadius: 0,
  },

  // Icon
  iconWrap: {
    marginTop: 8,
  },

  // Streak badge
  streakRow: {
    paddingRight: 4,
    paddingBottom: 4,
  },
  streakBadgeShadow: {
    position: "absolute",
    top: 4,
    left: 4,
    right: 0,
    bottom: 0,
    borderRadius: 0,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    borderWidth: 3,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  streakNumber: {
    fontSize: 64,
    fontWeight: "900",
    fontFamily: "SpaceGrotesk-Bold",
    lineHeight: 68,
  },
  streakUnit: {
    fontSize: 16,
    fontWeight: "900",
    fontFamily: "SpaceGrotesk-Bold",
    paddingBottom: 10,
    letterSpacing: 1,
  },

  heading: {
    fontWeight: "900",
    letterSpacing: 1.5,
    textAlign: "center",
    fontSize: 20,
  },
  subheading: {
    textAlign: "center",
    marginTop: -6,
  },

  // Countdown
  countdownRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginVertical: 4,
  },
  digitWrap: {
    alignItems: "center",
    gap: 4,
    paddingRight: 3,
    paddingBottom: 3,
  },
  digitShadow: {
    position: "absolute",
    top: 3,
    left: 3,
    right: 0,
    bottom: 14,
    borderRadius: 0,
    backgroundColor: "#000",
  },
  digitBox: {
    width: 58,
    height: 58,
    borderWidth: 2.5,
    borderRadius: 0,
    borderColor: "#000",
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
  },
  digitText: {
    fontSize: 30,
    fontWeight: "900",
    fontFamily: "SpaceGrotesk-Bold",
    lineHeight: 34,
    color: "#FFFFFF",
  },
  digitLabel: {
    fontSize: 8,
    fontWeight: "700",
    fontFamily: "SpaceGrotesk-Bold",
    letterSpacing: 1,
    color: "#888",
  },
  colon: {
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 14,
  },

  // CTA
  ctaWrap: {
    width: "100%",
    paddingRight: 5,
    paddingBottom: 5,
    marginTop: 4,
  },
  ctaShadow: {
    position: "absolute",
    top: 5,
    left: 5,
    right: 0,
    bottom: 0,
    borderRadius: 0,
  },
  ctaBtn: {
    width: "100%",
    paddingVertical: 16,
    borderWidth: 2.5,
    borderRadius: 0,
    alignItems: "center",
  },
  ctaText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
    fontFamily: "SpaceGrotesk-Bold",
    letterSpacing: 1,
  },

  dismissBtn: {
    paddingVertical: 6,
    marginTop: -4,
  },
});
