import {
  type MoodScore,
  useMoodStore,
} from "@/src/business-logic/stores/moodStore";
import {
  ExhaustedIcon,
  FiredUpIcon,
  HappyIcon,
  NeutralIcon,
  SadIcon,
} from "@/src/ui/atoms";
import { AppText } from "@/src/ui/atoms/Text";
import { useTheme } from "@/src/ui/tokens";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const MOODS: {
  score: MoodScore;
  Icon: React.ComponentType<{ size?: number }>;
  label: string;
}[] = [
  { score: 1, Icon: ExhaustedIcon, label: "Mệt" },
  { score: 2, Icon: SadIcon, label: "Buồn" },
  { score: 3, Icon: NeutralIcon, label: "Bình thường" },
  { score: 4, Icon: HappyIcon, label: "Tốt" },
  { score: 5, Icon: FiredUpIcon, label: "Bùng cháy" },
];

function getMoodMessage(mood: MoodScore): string {
  if (mood <= 2) return "Hôm nay chỉ cần làm 1 nhiệm vụ thôi 💙";
  if (mood === 3) return "Cứ đi từng bước một nhé 💪";
  if (mood === 4) return "Ngày tốt để tiến thêm một bước 🌱";
  return "Streak multiplier đang hoạt động! 🔥";
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function DailyMoodCheckIn({ visible, onClose }: Props) {
  const { colors } = useTheme();
  const setMood = useMoodStore((s) => s.setMood);
  const markShown = useMoodStore((s) => s.markCheckInShown);
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    if (true) {
      markShown();
      Animated.spring(scale, {
        toValue: 1,
        stiffness: 180,
        damping: 20,
        useNativeDriver: true,
      }).start();
    } else {
      scale.setValue(0.85);
    }
  }, [visible]);

  const handleSelect = (mood: MoodScore) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMood(mood);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.bgElevated,
              borderColor: colors.glassBorder,
              transform: [{ scale }],
            },
          ]}
        >
          <AppText
            variant="title"
            color={colors.textPrimary}
            style={styles.question}
          >
            Hôm nay bạn cảm thấy thế nào?
          </AppText>

          <View style={styles.moodRow}>
            {MOODS.map((m) => (
              <TouchableOpacity
                key={m.score}
                style={[styles.moodBtn, { borderColor: colors.glassBorder }]}
                onPress={() => handleSelect(m.score)}
                activeOpacity={0.7}
              >
                <m.Icon size={40} />
                <AppText
                  variant="caption"
                  color={colors.textMuted}
                  style={styles.moodLabel}
                >
                  {m.label}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity onPress={onClose} style={styles.skipBtn}>
            <AppText variant="caption" color={colors.textMuted}>
              Bỏ qua
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
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 28,
    alignItems: "center",
    gap: 16,
  },
  sun: {
    fontSize: 40,
  },
  question: {
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 0.2,
  },
  moodRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  moodBtn: {
    alignItems: "center",
    gap: 4,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    minWidth: 52,
  },
  moodLabel: {
    fontSize: 9,
    textAlign: "center",
  },
  skipBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
});
