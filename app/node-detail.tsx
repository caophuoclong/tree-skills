import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { questService } from "@/src/business-logic/api/services/questService";
import { useQuestStore } from "@/src/business-logic/stores/questStore";
import { useSkillTreeStore } from "@/src/business-logic/stores/skillTreeStore";
import type { Quest } from "@/src/business-logic/types";
import { useTheme } from "@/src/ui/tokens";

const BRANCH_COLORS: Record<string, string> = {
  career: "#4DA8FF",
  finance: "#34D399",
  softskills: "#FBBF24",
  wellbeing: "#F472B6",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "#34D399",
  medium: "#FBBF24",
  hard: "#F472B6",
};

const STATUS_LABELS: Record<string, string> = {
  locked: "🔒 Locked",
  in_progress: "⚡ In Progress",
  completed: "✅ Completed",
};

const TIER_LABELS = ["", "Beginner", "Intermediate", "Advanced"];

const { height: SCREEN_H } = Dimensions.get("window");
const SHEET_HEIGHT = SCREEN_H * 0.85;

const DAILY_LIMIT = 5;

export default function NodeDetailScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { node_id } = useLocalSearchParams<{ node_id: string }>();
  const nodes = useSkillTreeStore((s) => s.nodes);
  const dailyQuests = useQuestStore((s) => s.dailyQuests);
  const addQuestToDaily = useQuestStore((s) => s.addQuestToDaily);
  const removeQuestFromDaily = useQuestStore((s) => s.removeQuestFromDaily);

  const [nodeQuests, setNodeQuests] = useState<Quest[]>([]);
  const [loadingQuests, setLoadingQuests] = useState(false);

  const node = nodes.find((n) => n.node_id === node_id) ?? null;

  // Fetch quests when screen focuses (re-fetch after completing a quest)
  const fetchQuests = useCallback(() => {
    if (!node_id || !node || node.status === "locked") return;
    setLoadingQuests(true);
    questService
      .getQuestsForNode(node_id)
      .then((q) => setNodeQuests(q.filter((r) => r.title != null)))
      .finally(() => setLoadingQuests(false));
  }, [node_id, node?.status]);

  useEffect(() => { fetchQuests(); }, [fetchQuests]);
  useFocusEffect(useCallback(() => { fetchQuests(); }, [fetchQuests]));

  // Persist quest to DB + add to local store
  const handleAddToToday = async (quest: Quest) => {
    addQuestToDaily(quest);
    try {
      await questService.selectForToday([quest.quest_id]);
    } catch (err) {
      if (__DEV__) console.warn("[node-detail] selectForToday failed:", err);
    }
  };

  // Remove from DB + remove from local store
  const handleRemoveFromToday = async (questId: string) => {
    removeQuestFromDaily(questId);
    try {
      await questService.removeFromToday(questId);
    } catch (err) {
      if (__DEV__) console.warn("[node-detail] removeFromToday failed:", err);
    }
  };

  if (!node) {
    return (
      <Modal transparent animationType="slide" visible>
        <View style={styles.overlay}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => router.back()}
          />
          <View
            style={[
              styles.sheet,
              {
                height: SHEET_HEIGHT,
                backgroundColor: colors.bgElevated,
                paddingBottom: insets.bottom,
              },
            ]}
          >
            <View
              style={[styles.handle, { backgroundColor: colors.textMuted }]}
            />
            <View style={styles.notFound}>
              <Text style={[styles.notFoundText, { color: colors.textMuted }]}>
                Node not found
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  const branchColor = BRANCH_COLORS[node.branch] ?? colors.brandPrimary;
  const tierLabel = TIER_LABELS[node.tier] ?? `Tier ${node.tier}`;
  const progressPct = Math.min(
    (node.quests_completed / Math.max(node.quests_total, 1)) * 100,
    100,
  );

  const dailyQuestIds = new Set(dailyQuests.map((q) => q.quest_id));
  const activeDailyCount = dailyQuests.filter((q) => q.completed_at === null).length;
  const canAddMore = activeDailyCount < DAILY_LIMIT;

  const todayInNodeCount = nodeQuests.filter((q) => dailyQuestIds.has(q.quest_id)).length;
  const totalNodeCount = nodeQuests.length;

  return (
    <Modal transparent animationType="slide" visible>
      <View style={styles.overlay}>
        {/* Tap above sheet to dismiss */}
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={() => router.back()}
        />
        <View
          style={[
            styles.sheet,
            {
              height: SHEET_HEIGHT,
              backgroundColor: colors.bgElevated,
              paddingBottom: insets.bottom,
            },
          ]}
        >
          {/* Accent bar */}
          <View style={[styles.accentBar, { backgroundColor: branchColor }]} />

        {/* Handle */}
        <View style={[styles.handle, { backgroundColor: colors.textMuted }]} />

        {/* Close button */}
        <TouchableOpacity
          style={styles.closeRow}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={22} color={colors.textSecondary} />
        </TouchableOpacity>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Tier + status badges */}
          <View style={styles.badgeRow}>
            <View style={[styles.tierBadge, { backgroundColor: branchColor }]}>
              <Text style={styles.tierText}>{tierLabel}</Text>
            </View>
            <View style={[styles.statusBadge, { borderColor: branchColor }]}>
              <Text style={[styles.statusText, { color: branchColor }]}>
                {STATUS_LABELS[node.status]}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text style={[styles.nodeTitle, { color: colors.textPrimary }]}>
            {node.title}
          </Text>

          {/* Description */}
          <Text style={[styles.nodeDesc, { color: colors.textSecondary }]}>
            {node.description}
          </Text>

          {/* Locked banner */}
          {node.status === "locked" && (
            <View
              style={[
                styles.lockedBanner,
                {
                  backgroundColor: `${colors.warning}22`,
                  borderColor: colors.warning,
                },
              ]}
            >
              <Text style={[styles.lockedText, { color: colors.warning }]}>
                🔒 Complete previous tier to unlock
              </Text>
              <Text style={[styles.lockedSub, { color: colors.textSecondary }]}>
                Requires {node.xp_required} XP
              </Text>
            </View>
          )}

          {/* Progress */}
          {node.status !== "locked" && (
            <View style={styles.progressSection}>
              <Text
                style={[styles.sectionLabel, { color: colors.textPrimary }]}
              >
                Progress
              </Text>
              <View style={styles.progressRow}>
                <View
                  style={[
                    styles.progressBarBg,
                    {
                      backgroundColor: colors.bgSurface,
                      borderColor: colors.textPrimary,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${progressPct}%` as any,
                        backgroundColor: branchColor,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[styles.progressLabel, { color: colors.textMuted }]}
                >
                  {node.quests_completed}/{node.quests_total}
                </Text>
              </View>

              {node.status === "completed" && (
                <View
                  style={[
                    styles.completedStamp,
                    { borderColor: colors.success },
                  ]}
                >
                  <Text
                    style={[styles.completedText, { color: colors.success }]}
                  >
                    ✅ Node Complete! +{node.xp_required} XP earned
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Quest list section — only for unlocked nodes */}
          {node.status !== "locked" && (
            <View style={styles.questSection}>
              <View style={styles.questSectionHeader}>
                <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
                  NHIỆM VỤ
                </Text>
                <Text style={[styles.questCountLabel, { color: colors.textMuted }]}>
                  {todayInNodeCount}/{totalNodeCount} trong hôm nay
                </Text>
              </View>

              {loadingQuests ? (
                <ActivityIndicator size="small" color={branchColor} style={styles.loader} />
              ) : nodeQuests.length === 0 ? (
                <Text style={[styles.emptyQuestsText, { color: colors.textMuted }]}>
                  Không có nhiệm vụ nào
                </Text>
              ) : (
                nodeQuests.map((quest) => {
                  const isCompleted = quest.completed_at !== null;
                  const isInDaily = dailyQuestIds.has(quest.quest_id);
                  const diffColor = DIFFICULTY_COLORS[quest.difficulty] ?? colors.brandPrimary;
                  const questBranchColor = BRANCH_COLORS[quest.branch] ?? colors.brandPrimary;

                  return (
                    <View
                      key={quest.quest_id}
                      style={[
                        styles.questRow,
                        {
                          backgroundColor: colors.bgSurface,
                          borderColor: colors.glassBorder,
                          opacity: !isCompleted && !isInDaily && !canAddMore ? 0.45 : 1,
                        },
                      ]}
                    >
                      <View style={[styles.questAccentBar, { backgroundColor: questBranchColor }]} />
                      <View style={styles.questContent}>
                        <Text
                          style={[
                            styles.questTitle,
                            { color: colors.textPrimary },
                            isCompleted && styles.questTitleStrike,
                          ]}
                          numberOfLines={1}
                        >
                          {quest.title}
                        </Text>
                        <View style={styles.questBadges}>
                          <View style={[styles.diffBadge, { backgroundColor: `${diffColor}22`, borderColor: diffColor }]}>
                            <Text style={[styles.diffBadgeText, { color: diffColor }]}>
                              {quest.difficulty}
                            </Text>
                          </View>
                          <View style={[styles.xpBadge, { backgroundColor: `${colors.brandPrimary}22`, borderColor: colors.brandPrimary }]}>
                            <Text style={[styles.xpBadgeText, { color: colors.brandPrimary }]}>
                              +{quest.xp_reward} XP
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.questAction}>
                        {isCompleted ? (
                          <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                        ) : isInDaily ? (
                          <TouchableOpacity
                            style={[styles.pillBtn, { backgroundColor: `${colors.warning}22`, borderColor: colors.warning }]}
                            onPress={() => handleRemoveFromToday(quest.quest_id)}
                          >
                            <Text style={[styles.pillBtnText, { color: colors.warning }]}>
                              Hôm nay ✕
                            </Text>
                          </TouchableOpacity>
                        ) : canAddMore ? (
                          <TouchableOpacity
                            style={[styles.pillBtn, { backgroundColor: `${colors.brandPrimary}22`, borderColor: colors.brandPrimary }]}
                            onPress={() => handleAddToToday(quest)}
                          >
                            <Text style={[styles.pillBtnText, { color: colors.brandPrimary }]}>
                              + Hôm nay
                            </Text>
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          )}

          {/* XP info */}
          <View style={[styles.statRow, { borderColor: colors.glassBorder }]}>
            <View style={styles.stat}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                XP REQUIRED
              </Text>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                {node.xp_required}
              </Text>
            </View>
            <View
              style={[
                styles.statDivider,
                { backgroundColor: colors.glassBorder },
              ]}
            />
            <View style={styles.stat}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                BRANCH
              </Text>
              <Text style={[styles.statValue, { color: branchColor }]}>
                {node.branch.charAt(0).toUpperCase() + node.branch.slice(1)}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom close button */}
        <View style={[styles.footer, { borderTopColor: colors.glassBorder }]}>
          <TouchableOpacity
            style={[
              styles.closeBtn,
              {
                borderColor: colors.textPrimary,
                backgroundColor: colors.bgSurface,
              },
            ]}
            onPress={() => router.back()}
          >
            <Text style={[styles.closeBtnText, { color: colors.textPrimary }]}>
              Close
            </Text>
          </TouchableOpacity>
        </View>
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  accentBar: { height: 4, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  closeRow: {
    alignSelf: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 16 },
  badgeRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  tierBadge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  tierText: {
    fontSize: 11,
    color: "#fff",
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "700",
  },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1.5,
  },
  statusText: { fontSize: 11, fontFamily: "SpaceGrotesk-Regular" },
  nodeTitle: {
    fontSize: 22,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "700",
    marginBottom: 10,
  },
  nodeDesc: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
    fontFamily: "SpaceGrotesk-Regular",
  },
  lockedBanner: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    gap: 6,
    marginBottom: 20,
  },
  lockedText: { fontSize: 15, fontFamily: "SpaceGrotesk-SemiBold" },
  lockedSub: { fontSize: 13, fontFamily: "SpaceGrotesk-Regular" },
  progressSection: { gap: 10, marginBottom: 20 },
  sectionLabel: { fontSize: 15, fontFamily: "SpaceGrotesk-SemiBold" },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  progressBarBg: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  progressBarFill: { height: "100%" },
  progressLabel: { fontSize: 12, fontFamily: "SpaceMono-Regular" },
  completedStamp: {
    borderWidth: 2,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  completedText: { fontSize: 14, fontFamily: "SpaceGrotesk-Bold" },
  questSection: {
    marginBottom: 20,
    gap: 10,
  },
  questSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  questCountLabel: {
    fontSize: 12,
    fontFamily: "SpaceGrotesk-Regular",
  },
  loader: {
    marginVertical: 12,
  },
  emptyQuestsText: {
    fontSize: 13,
    fontFamily: "SpaceGrotesk-Regular",
    textAlign: "center",
    paddingVertical: 12,
  },
  questRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
  },
  questAccentBar: {
    width: 4,
    alignSelf: "stretch",
  },
  questContent: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 6,
  },
  questTitle: {
    fontSize: 13,
    fontFamily: "SpaceGrotesk-SemiBold",
  },
  questTitleStrike: {
    textDecorationLine: "line-through",
  },
  questBadges: {
    flexDirection: "row",
    gap: 6,
  },
  diffBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
  },
  diffBadgeText: {
    fontSize: 9,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  xpBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
  },
  xpBadgeText: {
    fontSize: 9,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "700",
  },
  questAction: {
    paddingHorizontal: 10,
  },
  pillBtn: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  pillBtnText: {
    fontSize: 10,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "700",
  },
  statRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
  },
  stat: { flex: 1, padding: 14 },
  statDivider: { width: 1 },
  statLabel: {
    fontSize: 9,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: 16,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "700",
    marginTop: 4,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  closeBtn: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  closeBtnText: {
    fontSize: 15,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "700",
  },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFoundText: { fontSize: 14 },
});
