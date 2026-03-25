import { AppText } from "@/src/ui/atoms/Text";
import { useQuestStore } from "@/src/business-logic/stores/questStore";
import { useTheme } from "@/src/ui/tokens";
import { useCallback } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface Props {
  onPress: () => void;
}

export function QuickQuestBanner({ onPress }: Props) {
  const { colors } = useTheme();
  const dailyQuests = useQuestStore((s) => s.dailyQuests);

  // Hide banner once at least 1 quest is done today
  const anyCompleted = dailyQuests.some((q) => q.completed_at !== null);
  if (anyCompleted || dailyQuests.length === 0) return null;

  // Only show if there are easy/5-min quests available
  const hasQuickQuest = dailyQuests.some(
    (q) => q.completed_at === null && q.duration_min === 5,
  );

  return (
    <TouchableOpacity
      style={[
        styles.banner,
        {
          backgroundColor: colors.brandPrimary + "18",
          borderColor: colors.brandPrimary,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.left}>
        <AppText style={styles.bolt}>⚡</AppText>
        <View style={styles.text}>
          <AppText
            variant="caption"
            color={colors.brandPrimary}
            style={styles.title}
          >
            Làm nhanh 5 phút
          </AppText>
          <AppText variant="caption" color={colors.textMuted} style={styles.sub}>
            {hasQuickQuest
              ? "Chỉ mất 5 phút — đủ để giữ streak!"
              : "Cố lên 15 phút thôi! 💪"}
          </AppText>
        </View>
      </View>
      <AppText
        variant="caption"
        color={colors.brandPrimary}
        style={styles.arrow}
      >
        →
      </AppText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  bolt: {
    fontSize: 22,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: 0.2,
  },
  sub: {
    fontSize: 10,
  },
  arrow: {
    fontWeight: "900",
    fontSize: 18,
  },
});
