import { AppText } from "@/src/ui/atoms/Text";
import { NeoBrutalBox } from "@/src/ui/atoms";
import { useQuestStore } from "@/src/business-logic/stores/questStore";
import { useUserStore } from "@/src/business-logic/stores/userStore";
import { useTheme } from "@/src/ui/tokens";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import type { Quest } from "@/src/business-logic/types";
import type { Branch } from "@/src/business-logic/types";

const BRANCH_COLOR: Record<Branch, string> = {
  career: "#3b82f6",
  finance: "#22c55e",
  softskills: "#f59e0b",
  wellbeing: "#a855f7",
};

const BRANCH_EMOJI: Record<Branch, string> = {
  career: "💼",
  finance: "💰",
  softskills: "🎤",
  wellbeing: "🧘",
};

interface Props {
  visible: boolean;
  onClose: () => void;
  onComplete: (questId: string) => void;
}

export function QuickQuestModal({ visible, onClose, onComplete }: Props) {
  const { colors } = useTheme();
  const dailyQuests = useQuestStore((s) => s.dailyQuests);
  const user = useUserStore((s) => s.user);
  const dailyStats = useUserStore((s) => s.dailyStats);
  const [justCompleted, setJustCompleted] = useState<Quest | null>(null);

  // Determine which branch was least active today
  const branchActivity: Record<Branch, number> = useMemo(() => {
    const branches: Branch[] = ["career", "finance", "softskills", "wellbeing"];
    const result = {} as Record<Branch, number>;
    branches.forEach((b) => {
      result[b] = dailyQuests.filter(
        (q) => q.branch === b && q.completed_at !== null,
      ).length;
    });
    return result;
  }, [dailyQuests]);

  // Pick the quick quest: prefer 5min+easy, then weakest branch
  const quickQuest = useMemo((): Quest | null => {
    const pending = dailyQuests.filter((q) => q.completed_at === null);
    if (pending.length === 0) return null;

    // Sort: prefer 5min easy, then by weakest branch
    const sorted = [...pending].sort((a, b) => {
      const aIsQuick = a.duration_min === 5 && a.difficulty === "easy" ? 0 : 1;
      const bIsQuick = b.duration_min === 5 && b.difficulty === "easy" ? 0 : 1;
      if (aIsQuick !== bIsQuick) return aIsQuick - bIsQuick;
      // Prefer weakest branch
      return (branchActivity[a.branch] ?? 0) - (branchActivity[b.branch] ?? 0);
    });

    return sorted[0];
  }, [dailyQuests, branchActivity]);

  const hasNoQuickQuest = quickQuest && quickQuest.duration_min !== 5;

  const handleComplete = () => {
    if (!quickQuest) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete(quickQuest.quest_id);
    setJustCompleted(quickQuest);
  };

  const handleViewDetail = () => {
    if (!quickQuest) return;
    onClose();
    router.push(`/quest/${quickQuest.quest_id}` as any);
  };

  const handleDoAnother = () => {
    setJustCompleted(null);
  };

  const handleClose = () => {
    setJustCompleted(null);
    onClose();
  };

  const branch = quickQuest?.branch ?? "career";
  const branchColor = BRANCH_COLOR[branch];
  const branchEmoji = BRANCH_EMOJI[branch];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.bgElevated },
          ]}
        >
          {/* Handle */}
          <View
            style={[styles.handle, { backgroundColor: colors.glassBorder }]}
          />

          {justCompleted ? (
            // Completion celebration
            <View style={styles.celebration}>
              <AppText style={styles.celebEmoji}>🎉</AppText>
              <AppText
                variant="displayLG"
                color={colors.brandPrimary}
                style={styles.celebTitle}
              >
                XONG RỒI!
              </AppText>
              <AppText variant="body" color={colors.textSecondary}>
                {justCompleted.title}
              </AppText>
              <AppText
                variant="caption"
                color={colors.finance}
                style={styles.xpBadge}
              >
                +{justCompleted.xp_reward} XP 🔥 Streak được giữ!
              </AppText>

              <View style={styles.celebActions}>
                <TouchableOpacity
                  style={[
                    styles.secondaryBtn,
                    { borderColor: colors.glassBorder },
                  ]}
                  onPress={handleDoAnother}
                >
                  <AppText variant="caption" color={colors.textSecondary}>
                    Làm thêm
                  </AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: colors.brandPrimary }]}
                  onPress={handleClose}
                >
                  <AppText variant="caption" color="#fff" style={styles.primaryBtnText}>
                    Xong ✓
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          ) : quickQuest ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.content}>
                <View style={styles.header}>
                  <AppText
                    variant="caption"
                    color={colors.brandPrimary}
                    style={styles.modeLabel}
                  >
                    ⚡ QUICK MODE
                  </AppText>
                  <TouchableOpacity onPress={handleClose}>
                    <AppText variant="caption" color={colors.textMuted}>
                      ✕
                    </AppText>
                  </TouchableOpacity>
                </View>

                {hasNoQuickQuest && (
                  <View
                    style={[
                      styles.noQuickNote,
                      { backgroundColor: colors.warning + "22", borderColor: colors.warning + "55" },
                    ]}
                  >
                    <AppText variant="caption" color={colors.warning}>
                      Không có quest 5 phút — cố lên 15 phút thôi! 💪
                    </AppText>
                  </View>
                )}

                <NeoBrutalBox
                  borderColor={branchColor}
                  backgroundColor={colors.bgSurface}
                  shadowColor={branchColor}
                  shadowOffsetX={4}
                  shadowOffsetY={4}
                  borderWidth={2}
                  borderRadius={16}
                  contentStyle={styles.questCard}
                >
                  <View
                    style={[styles.questAccent, { backgroundColor: branchColor }]}
                  />
                  <View style={styles.questMeta}>
                    <AppText style={styles.questBranchEmoji}>{branchEmoji}</AppText>
                    <AppText variant="caption" color={colors.textMuted}>
                      {quickQuest.duration_min} phút · {quickQuest.difficulty}
                    </AppText>
                    <View style={[styles.xpTag, { backgroundColor: colors.finance + "22" }]}>
                      <AppText variant="caption" color={colors.finance}>
                        +{quickQuest.xp_reward} XP
                      </AppText>
                    </View>
                  </View>
                  <AppText
                    variant="title"
                    color={colors.textPrimary}
                    style={styles.questTitle}
                  >
                    {quickQuest.title}
                  </AppText>
                  {quickQuest.description ? (
                    <AppText
                      variant="caption"
                      color={colors.textSecondary}
                      style={styles.questDesc}
                    >
                      {quickQuest.description}
                    </AppText>
                  ) : null}
                </NeoBrutalBox>

                <TouchableOpacity
                  style={[styles.completeBtn, { backgroundColor: branchColor }]}
                  onPress={handleComplete}
                  activeOpacity={0.85}
                >
                  <AppText variant="title" color="#fff" style={styles.completeBtnText}>
                    ✓ Đánh dấu hoàn thành
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.detailLink}
                  onPress={handleViewDetail}
                >
                  <AppText variant="caption" color={colors.textMuted}>
                    Xem chi tiết quest →
                  </AppText>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            <View style={styles.allDone}>
              <AppText style={styles.celebEmoji}>🌟</AppText>
              <AppText variant="title" color={colors.textPrimary}>
                Tất cả đã xong hôm nay!
              </AppText>
              <AppText variant="caption" color={colors.textMuted}>
                Bạn thật tuyệt vời 💪
              </AppText>
              <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                <AppText variant="caption" color={colors.brandPrimary}>
                  Đóng
                </AppText>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: "80%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 16,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modeLabel: {
    fontWeight: "900",
    letterSpacing: 1,
    fontSize: 11,
  },
  noQuickNote: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  questCard: {
    padding: 16,
    gap: 8,
  },
  questAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  questMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  questBranchEmoji: {
    fontSize: 16,
  },
  xpTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: "auto",
  },
  questTitle: {
    fontWeight: "900",
    fontSize: 18,
  },
  questDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  completeBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  completeBtnText: {
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  detailLink: {
    alignItems: "center",
    paddingVertical: 4,
  },
  celebration: {
    padding: 28,
    alignItems: "center",
    gap: 12,
  },
  celebEmoji: {
    fontSize: 52,
  },
  celebTitle: {
    fontWeight: "900",
    letterSpacing: 1,
  },
  xpBadge: {
    fontWeight: "900",
  },
  celebActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  secondaryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  primaryBtn: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
  },
  primaryBtnText: {
    fontWeight: "900",
  },
  allDone: {
    padding: 40,
    alignItems: "center",
    gap: 10,
  },
  closeBtn: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
});
