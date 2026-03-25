import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useQuestManager } from "@/src/business-logic/hooks/useQuestManager";
import { useStaminaSystem } from "@/src/business-logic/hooks/useStaminaSystem";
import { useQuestStore } from "@/src/business-logic/stores/questStore";
import { useSkillTreeStore } from "@/src/business-logic/stores/skillTreeStore";
import { useUserStore } from "@/src/business-logic/stores/userStore";
import type { Quest } from "@/src/business-logic/types";
import { NeoBrutalBox } from "@/src/ui/atoms";
import {
  QuestCompleteButton,
  QuestMetaRow,
  QuestStepList,
  StaminaBar,
} from "@/src/ui/molecules";
import { IColors, useTheme } from "@/src/ui/tokens";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getBranchColors = (colors: IColors): Record<string, string> => ({
  career: colors.career,
  finance: colors.finance,
  softskills: colors.softskills,
  wellbeing: colors.wellbeing,
});

const BRANCH_CATEGORY_LABELS: Record<string, string> = {
  career: "Nhiệm vụ Sự nghiệp",
  finance: "Nhiệm vụ Tài chính",
  softskills: "Nhiệm vụ Kỹ năng mềm",
  wellbeing: "Nhiệm vụ Sức khoẻ",
};

const BRANCH_WHY_NOTE: Record<string, string> = {
  career: "Xây dựng kỹ năng nghề nghiệp giúp bạn tạo ra cơ hội và phát triển bền vững.",
  finance: "Thói quen tài chính nhỏ tích lũy theo thời gian thành tự do lớn.",
  softskills: "Kỹ năng mềm là hệ số nhân cho mọi kỹ năng chuyên môn bạn có.",
  wellbeing: "Đầu tư vào sức khỏe chính là đầu tư vào hiệu suất tổng thể của bạn.",
};

function parseStepsFromDescription(description: string): string[] {
  const parts = description.split(/\d+\.\s+/).map((s) => s.trim()).filter((s) => s.length > 10);
  if (parts.length >= 2) return parts;
  const lines = description.split(/\n+/).map((s) => s.trim()).filter((s) => s.length > 0);
  if (lines.length >= 2) return lines;
  return [description];
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatCompletedAt(isoDate: string): string {
  const d = new Date(isoDate);
  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm} · ${days[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
}

// ─── NodeProgressBar ─────────────────────────────────────────────────────────

function NodeProgressBar({
  nodeId,
  colors,
  branchColor,
}: {
  nodeId: string;
  colors: IColors;
  branchColor: string;
}) {
  const node = useSkillTreeStore((s) => s.nodes.find((n) => n.node_id === nodeId));
  if (!node) return null;

  const pct = node.quests_total > 0
    ? Math.min(1, node.quests_completed / node.quests_total)
    : 0;

  return (
    <TouchableOpacity
      style={[
        nodeBarStyles.wrap,
        { backgroundColor: colors.bgElevated, borderColor: colors.glassBorder },
      ]}
      onPress={() => router.push(`/node-detail?node_id=${nodeId}` as any)}
      activeOpacity={0.75}
    >
      <View style={nodeBarStyles.top}>
        <View style={nodeBarStyles.left}>
          <Ionicons name="git-network-outline" size={13} color={branchColor} />
          <Text
            style={[nodeBarStyles.title, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {node.title}
          </Text>
        </View>
        <Text style={[nodeBarStyles.count, { color: branchColor }]}>
          {node.quests_completed}/{node.quests_total}
        </Text>
        <Ionicons name="chevron-forward" size={13} color={colors.textMuted} />
      </View>
      <View style={[nodeBarStyles.track, { backgroundColor: colors.bgBase }]}>
        <View
          style={[
            nodeBarStyles.fill,
            { width: `${pct * 100}%` as any, backgroundColor: branchColor },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
}

const nodeBarStyles = StyleSheet.create({
  wrap: { borderRadius: 12, borderWidth: 1, padding: 12, gap: 8 },
  top: { flexDirection: "row", alignItems: "center", gap: 6 },
  left: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  title: {
    fontSize: 13,
    fontFamily: "SpaceGrotesk-SemiBold",
    fontWeight: "600",
    flex: 1,
  },
  count: {
    fontSize: 12,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "700",
    marginRight: 2,
  },
  track: { height: 4, borderRadius: 2, overflow: "hidden" },
  fill: { height: 4, borderRadius: 2 },
});

// ─── FocusTimerOverlay ────────────────────────────────────────────────────────

function FocusTimerOverlay({
  visible,
  timeLeft,
  isPaused,
  branchColor,
  questTitle,
  onPause,
  onResume,
  onDismiss,
}: {
  visible: boolean;
  timeLeft: number;
  isPaused: boolean;
  branchColor: string;
  questTitle: string;
  onPause: () => void;
  onResume: () => void;
  onDismiss: () => void;
}) {
  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent>
      <View style={[timerStyles.overlay, { backgroundColor: branchColor + "F2" }]}>
        <Text style={timerStyles.questLabel} numberOfLines={2}>
          {questTitle}
        </Text>
        <Text style={timerStyles.timerText}>{formatTime(timeLeft)}</Text>
        <Text style={timerStyles.hint}>
          {isPaused ? "Đã tạm dừng" : "Tập trung · Không bị phân tâm"}
        </Text>
        <View style={timerStyles.actions}>
          <TouchableOpacity
            style={timerStyles.btn}
            onPress={isPaused ? onResume : onPause}
          >
            <Ionicons name={isPaused ? "play" : "pause"} size={20} color="#fff" />
            <Text style={timerStyles.btnText}>
              {isPaused ? "Tiếp tục" : "Tạm dừng"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={timerStyles.btnOutline} onPress={onDismiss}>
            <Ionicons name="contract-outline" size={18} color="#fff" />
            <Text style={timerStyles.btnText}>Thu nhỏ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const timerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 32,
  },
  questLabel: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "SpaceGrotesk-SemiBold",
    textAlign: "center",
    opacity: 0.85,
  },
  timerText: {
    fontSize: 72,
    color: "#fff",
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "800",
    letterSpacing: 4,
  },
  hint: { fontSize: 14, color: "#fff", opacity: 0.75, textAlign: "center" },
  actions: { flexDirection: "row", gap: 12, marginTop: 16 },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  btnOutline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  btnText: {
    fontSize: 15,
    color: "#fff",
    fontFamily: "SpaceGrotesk-SemiBold",
    fontWeight: "600",
  },
});

// ─── Main Screen Component ────────────────────────────────────────────────────

export function QuestDetailScreen({ questId }: { questId: string }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const BRANCH_COLORS = useMemo(() => getBranchColors(colors), [colors]);

  const { quests, completeQuest } = useQuestManager();
  const { stamina, status, isGated, xpMultiplier } = useStaminaSystem();
  const { dailyStats } = useUserStore();
  const dailyQuests = useQuestStore((s) => s.dailyQuests);

  const quest: Quest | undefined = quests.find((q) => q.quest_id === questId);

  const isCompleted = quest ? quest.completed_at !== null : false;
  const branchColor = quest
    ? (BRANCH_COLORS[quest.branch] ?? colors.brandPrimary)
    : colors.brandPrimary;
  const actualXP = quest ? Math.floor(quest.xp_reward * xpMultiplier) : 0;
  const hasDebuff = actualXP < (quest?.xp_reward ?? 0);
  const isWellbeing = quest?.branch === "wellbeing";

  const nextQuest = useMemo(() => {
    if (!quest?.node_id) return null;
    return (
      dailyQuests.find(
        (q) =>
          q.node_id === quest.node_id &&
          q.quest_id !== quest.quest_id &&
          q.completed_at === null,
      ) ?? null
    );
  }, [dailyQuests, quest]);

  // Focus timer
  const [timerState, setTimerState] = useState<"idle" | "running" | "paused" | "done">("idle");
  const [timeLeft, setTimeLeft] = useState(0);
  const [showTimerOverlay, setShowTimerOverlay] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    if (!quest) return;
    setTimeLeft((quest.duration_min ?? 5) * 60);
    setTimerState("running");
    setShowTimerOverlay(true);
  }, [quest]);

  useEffect(() => {
    if (timerState === "running") {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current!);
            setTimerState("done");
            setShowTimerOverlay(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerState]);

  const [justCompleted, setJustCompleted] = useState(false);

  const handleComplete = useCallback(() => {
    if (!quest || isCompleted) return;
    completeQuest(quest.quest_id);
    if (quest.node_id) {
      useSkillTreeStore.getState().incrementNodeQuests(quest.node_id);
    }
    setJustCompleted(true);
    setTimeout(() => router.back(), nextQuest ? 3000 : 1800);
  }, [quest, isCompleted, completeQuest, nextQuest]);

  // ─── Not found ──────────────────────────────────────────────────────────
  if (!quest) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.center}>
          <Text style={styles.notFoundText}>Quest not found.</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const steps = parseStepsFromDescription(quest.description ?? "");

  // ─── Completed View ──────────────────────────────────────────────────────
  if (isCompleted && !justCompleted) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <NeoBrutalBox
            borderColor={colors.glassBorder}
            backgroundColor={colors.bgElevated}
            shadowColor="#000"
            shadowOffsetX={2}
            shadowOffsetY={2}
            borderWidth={1.5}
            borderRadius={12}
            contentStyle={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </NeoBrutalBox>
          <Text style={[styles.headerLabel, { color: colors.finance }]}>
            ✅ HOÀN THÀNH
          </Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <NeoBrutalBox
            borderColor={colors.finance}
            backgroundColor={colors.bgSurface}
            shadowColor={colors.finance}
            shadowOffsetX={4}
            shadowOffsetY={4}
            borderWidth={2}
            borderRadius={16}
            contentStyle={styles.titleCard}
          >
            <Text style={[styles.completedTimestamp, { color: colors.finance }]}>
              ✅{" "}
              {quest.completed_at
                ? formatCompletedAt(quest.completed_at)
                : "Hoàn thành"}
            </Text>
            <Text style={styles.questTitle}>{quest.title}</Text>
            <QuestMetaRow
              duration={quest.duration_min}
              xpReward={quest.xp_reward}
              difficulty={quest.difficulty}
              branch={quest.branch}
            />
            <Text style={[styles.xpEarned, { color: colors.finance }]}>
              +{quest.xp_reward} XP đã nhận
            </Text>
          </NeoBrutalBox>

          {quest.node_id && (
            <View style={styles.nodeBarWrap}>
              <NodeProgressBar
                nodeId={quest.node_id}
                colors={colors}
                branchColor={branchColor}
              />
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>MÔ TẢ</Text>
            <Text style={styles.sectionBody}>{quest.description}</Text>
          </View>

          <View style={styles.footerSpacer} />
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.completedActions}>
            {quest.node_id && (
              <TouchableOpacity
                style={[styles.actionBtn, { borderColor: branchColor }]}
                onPress={() => router.push(`/node-detail?node_id=${quest.node_id}` as any)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="git-network-outline"
                  size={15}
                  color={branchColor}
                />
                <Text style={[styles.actionBtnText, { color: branchColor }]}>
                  Xem node →
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.actionBtn,
                { borderColor: colors.glassBorder, flex: 1 },
              ]}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Ionicons
                name="list-outline"
                size={15}
                color={colors.textSecondary}
              />
              <Text
                style={[
                  styles.actionBtnText,
                  { color: colors.textSecondary },
                ]}
              >
                Làm quest khác →
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Active Quest View ───────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <FocusTimerOverlay
        visible={showTimerOverlay}
        timeLeft={timeLeft}
        isPaused={timerState === "paused"}
        branchColor={branchColor}
        questTitle={quest.title}
        onPause={() => setTimerState("paused")}
        onResume={() => setTimerState("running")}
        onDismiss={() => setShowTimerOverlay(false)}
      />

      {/* Header */}
      <View style={styles.header}>
        <NeoBrutalBox
          borderColor={colors.glassBorder}
          backgroundColor={colors.bgElevated}
          shadowColor="#000"
          shadowOffsetX={2}
          shadowOffsetY={2}
          borderWidth={1.5}
          borderRadius={12}
          contentStyle={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </NeoBrutalBox>
        <Text style={[styles.headerLabel, { color: branchColor, flex: 1 }]}>
          {BRANCH_CATEGORY_LABELS[quest.branch] ?? "Quest"}
        </Text>
        {timerState === "running" && !showTimerOverlay && (
          <TouchableOpacity
            style={[
              styles.timerChip,
              {
                backgroundColor: branchColor + "22",
                borderColor: branchColor,
              },
            ]}
            onPress={() => setShowTimerOverlay(true)}
          >
            <Ionicons name="timer-outline" size={13} color={branchColor} />
            <Text style={[styles.timerChipText, { color: branchColor }]}>
              {formatTime(timeLeft)}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title card */}
        <NeoBrutalBox
          borderColor={branchColor}
          backgroundColor={colors.bgSurface}
          shadowColor={branchColor}
          shadowOffsetX={4}
          shadowOffsetY={4}
          borderWidth={2}
          borderRadius={16}
          contentStyle={styles.titleCard}
        >
          <Text style={styles.questTitle}>{quest.title}</Text>
          <QuestMetaRow
            duration={quest.duration_min}
            xpReward={quest.xp_reward}
            difficulty={quest.difficulty}
            branch={quest.branch}
          />
          {/* XP preview */}
          {isWellbeing ? (
            <Text style={[styles.xpPreview, { color: colors.wellbeing }]}>
              💰 +{quest.xp_reward} XP · ⚡ +15 stamina
            </Text>
          ) : hasDebuff ? (
            <Text style={[styles.xpPreview, { color: colors.warning }]}>
              💰 +{quest.xp_reward} XP →{" "}
              <Text style={{ color: colors.danger }}>+{actualXP} XP thực</Text>
              {"  "}
              <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                ({status === "debuff" ? "⚡ -50%" : "⚡ -25%"})
              </Text>
            </Text>
          ) : (
            <Text style={[styles.xpPreview, { color: colors.textMuted }]}>
              💰 +{quest.xp_reward} XP · Thể lực đầy đủ
            </Text>
          )}
        </NeoBrutalBox>

        {/* Node progress bar */}
        {quest.node_id && (
          <View style={styles.nodeBarWrap}>
            <NodeProgressBar
              nodeId={quest.node_id}
              colors={colors}
              branchColor={branchColor}
            />
          </View>
        )}

        {/* What's next strip */}
        {justCompleted && nextQuest && (
          <TouchableOpacity
            style={[
              styles.whatNextStrip,
              {
                borderColor: branchColor,
                backgroundColor: branchColor + "15",
              },
            ]}
            onPress={() =>
              router.replace(`/quest/${nextQuest.quest_id}` as any)
            }
            activeOpacity={0.8}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[styles.whatNextLabel, { color: branchColor }]}>
                Quest tiếp theo
              </Text>
              <Text
                style={[styles.whatNextTitle, { color: colors.textPrimary }]}
                numberOfLines={1}
              >
                {nextQuest.title}
              </Text>
            </View>
            <Ionicons
              name="arrow-forward-circle"
              size={28}
              color={branchColor}
            />
          </TouchableOpacity>
        )}

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MÔ TẢ</Text>
          <Text style={styles.sectionBody}>{quest.description}</Text>
        </View>

        {/* Steps — only shown when description has multiple steps */}
        {steps.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>CÁC BƯỚC THỰC HIỆN</Text>
            <QuestStepList steps={steps} />
          </View>
        )}

        {/* Focus timer CTA */}
        {!isCompleted && !justCompleted && timerState === "idle" && (
          <TouchableOpacity
            style={[
              styles.focusBtn,
              {
                borderColor: branchColor,
                backgroundColor: branchColor + "12",
              },
            ]}
            onPress={startTimer}
            activeOpacity={0.8}
          >
            <Ionicons name="timer-outline" size={18} color={branchColor} />
            <Text style={[styles.focusBtnText, { color: branchColor }]}>
              Bắt đầu tập trung · {quest.duration_min} phút
            </Text>
          </TouchableOpacity>
        )}

        {/* Timer done confirmation */}
        {timerState === "done" && !isCompleted && (
          <View
            style={[
              styles.timerDoneBadge,
              {
                backgroundColor: colors.finance + "22",
                borderColor: colors.finance,
              },
            ]}
          >
            <Text style={[styles.timerDoneText, { color: colors.finance }]}>
              ✅ Đã hoàn thành {quest.duration_min} phút tập trung
            </Text>
          </View>
        )}

        {/* Why this matters */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TẠI SAO ĐIỀU NÀY QUAN TRỌNG</Text>
          <Text style={styles.sectionBody}>
            {BRANCH_WHY_NOTE[quest.branch]}
          </Text>
        </View>

        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {stamina < 70 &&
          (quest.branch === "career" || quest.branch === "finance") && (
            <View style={styles.staminaBarContainer}>
              <StaminaBar value={stamina} />
            </View>
          )}

        {isGated(quest.branch) ? (
          <QuestCompleteButton
            questId={quest.quest_id}
            xpReward={actualXP}
            isCompleted={isCompleted || justCompleted}
            sessionCombo={dailyStats.session_combo}
            onComplete={handleComplete}
            isGated={true}
            staminaStatus={status}
          />
        ) : (
          <>
            {!isCompleted && !justCompleted && (
              <Text style={styles.footerNote}>
                {status === "warning"
                  ? "⚡ Thể lực thấp — XP -25%"
                  : status === "debuff"
                  ? "⚡ Thể lực rất thấp — XP -50%"
                  : isWellbeing
                  ? "⚡ Wellbeing quest — hồi +15 thể lực"
                  : "⚡ Thể lực đầy đủ · Nhận XP thuần"}
              </Text>
            )}
            <QuestCompleteButton
              questId={quest.quest_id}
              xpReward={actualXP}
              isCompleted={isCompleted || justCompleted}
              sessionCombo={dailyStats.session_combo}
              onComplete={handleComplete}
              staminaStatus={status}
            />
          </>
        )}

        {!isCompleted && !justCompleted && (
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={styles.skipText}>Bỏ qua hôm nay</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (colors: IColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bgBase },

    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
    },
    notFoundText: { fontSize: 16, color: colors.textSecondary },

    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
      gap: 8,
    },
    backButton: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
    },
    headerLabel: {
      fontSize: 15,
      fontFamily: "SpaceGrotesk-SemiBold",
      fontWeight: "600",
    },
    timerChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
      borderWidth: 1,
    },
    timerChipText: {
      fontSize: 12,
      fontFamily: "SpaceGrotesk-SemiBold",
      fontWeight: "600",
    },

    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },

    titleCard: { padding: 20, gap: 10 },
    questTitle: {
      fontSize: 22,
      fontFamily: "SpaceGrotesk-Bold",
      fontWeight: "700",
      color: colors.textPrimary,
    },
    completedTimestamp: {
      fontSize: 12,
      fontFamily: "SpaceGrotesk-SemiBold",
      fontWeight: "600",
    },
    xpEarned: {
      fontSize: 13,
      fontFamily: "SpaceGrotesk-SemiBold",
      fontWeight: "600",
    },
    xpPreview: {
      fontSize: 12,
      fontFamily: "SpaceGrotesk-SemiBold",
      fontWeight: "600",
    },

    nodeBarWrap: { marginTop: 12 },

    whatNextStrip: {
      marginTop: 12,
      borderRadius: 12,
      borderWidth: 1.5,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    whatNextLabel: {
      fontSize: 10,
      fontFamily: "SpaceGrotesk-SemiBold",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    whatNextTitle: {
      fontSize: 14,
      fontFamily: "SpaceGrotesk-SemiBold",
      fontWeight: "600",
    },

    section: { marginTop: 20, gap: 8 },
    sectionLabel: {
      fontSize: 11,
      fontFamily: "SpaceGrotesk-SemiBold",
      fontWeight: "600",
      color: colors.textMuted,
      letterSpacing: 2,
      textTransform: "uppercase",
    },
    sectionBody: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 22,
    },

    focusBtn: {
      marginTop: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderWidth: 1.5,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    focusBtnText: {
      fontSize: 14,
      fontFamily: "SpaceGrotesk-SemiBold",
      fontWeight: "600",
    },

    timerDoneBadge: {
      marginTop: 12,
      borderWidth: 1.5,
      borderRadius: 12,
      padding: 12,
    },
    timerDoneText: {
      fontSize: 13,
      fontFamily: "SpaceGrotesk-SemiBold",
      fontWeight: "600",
      textAlign: "center",
    },

    footerSpacer: { height: 20 },

    footer: {
      paddingHorizontal: 20,
      paddingBottom: 20,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.glassBorder,
      backgroundColor: colors.bgBase,
      gap: 8,
    },
    staminaBarContainer: { marginBottom: 4 },
    footerNote: { fontSize: 11, color: colors.textMuted, textAlign: "center" },
    skipText: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: "center",
      paddingVertical: 4,
    },

    completedActions: { flexDirection: "row", gap: 10 },
    actionBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      borderWidth: 1.5,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    actionBtnText: {
      fontSize: 13,
      fontFamily: "SpaceGrotesk-SemiBold",
      fontWeight: "600",
    },
  });
