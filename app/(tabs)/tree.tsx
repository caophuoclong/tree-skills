import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getDemoCustomData,
  getDemoNodes,
} from "@/src/business-logic/data/skill-tree-nodes";
import { useCustomSkillTreeStore } from "@/src/business-logic/stores/customSkillTreeStore";
import { useQuestStore } from "@/src/business-logic/stores/questStore";
import { useSkillTreeStore } from "@/src/business-logic/stores/skillTreeStore";
import type { Branch, SkillNode } from "@/src/business-logic/types";
import { Emoji, NeoBrutalAccent, NeoBrutalBox } from "@/src/ui/atoms";
import { GoalFilterSection } from "@/src/ui/organisms/GoalFilterSection";
import { SkillTreeCanvas } from "@/src/ui/organisms/SkillTreeCanvas";
import { SkillTreeHeader } from "@/src/ui/molecules/SkillTreeHeader";
import { useTheme } from "@/src/ui/tokens";
import { useTreeLayout } from "@/src/hooks/useTreeLayout";

const { width: SW } = Dimensions.get("window");

// ─── Branch tabs ───────────────────────────────────────────────────────────────
const BRANCHES: { id: Branch; label: string }[] = [
  { id: "career", label: "Sự nghiệp" },
  { id: "finance", label: "Tài chính" },
  { id: "softskills", label: "Kỹ năng mềm" },
  { id: "wellbeing", label: "Sức khỏe" },
];

const BRANCH_NAME: Record<Branch, string> = {
  career: "Tech & Career",
  finance: "Finance & Money",
  softskills: "Communication",
  wellbeing: "Health & Mind",
};

// ─── Screen ────────────────────────────────────────────────────────────────────
export default function TreeScreen() {
  const { colors } = useTheme();
  const { nodes, activeBranch, setNodes, setActiveBranch } =
    useSkillTreeStore();
  const { dailyQuests } = useQuestStore();
  const [showOnlyCustom, setShowOnlyCustom] = React.useState(false);
  const [goalSheetId, setGoalSheetId] = React.useState<string | null>(null);
  const [selectedGoalId, setSelectedGoalId] = React.useState<string | null>(
    null,
  );
  const {
    nodeGoalMap,
    trees: customTrees,
    initWithDemoData,
  } = useCustomSkillTreeStore();

  useEffect(() => {
    if (nodes.length === 0) setNodes(getDemoNodes());
    initWithDemoData(getDemoCustomData());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const colorMap = useMemo(
    () => ({
      career: colors.career,
      finance: colors.finance,
      softskills: colors.softskills,
      wellbeing: colors.wellbeing,
    }),
    [colors],
  );

  const branchColor = colorMap[activeBranch];

  // All nodes in this branch
  const branchNodes = useMemo(
    () => nodes.filter((n) => n.branch === activeBranch),
    [nodes, activeBranch],
  );

  // Custom nodes = those added via the AI builder (id starts with "custom_")
  const customCount = useMemo(
    () => branchNodes.filter((n) => n.node_id.startsWith("custom_")).length,
    [branchNodes],
  );

  // Reset filter when switching branch if no customs there
  React.useEffect(() => {
    if (customCount <= 1) setShowOnlyCustom(false);
  }, [activeBranch, customCount]);

  // Goal filter: when a goal is selected, show ALL nodes for that goal
  // regardless of which branch tab is active
  const goalFilterActive = selectedGoalId !== null;

  // Visible nodes — goal filter takes precedence over branch + custom filter
  const visibleNodes = useMemo(() => {
    if (goalFilterActive) {
      return nodes.filter(
        (n) => nodeGoalMap[n.node_id]?.goalId === selectedGoalId,
      );
    }
    return showOnlyCustom
      ? branchNodes.filter((n) => n.node_id.startsWith("custom_"))
      : branchNodes;
  }, [
    nodes,
    branchNodes,
    selectedGoalId,
    goalFilterActive,
    showOnlyCustom,
    nodeGoalMap,
  ]);

  const { placed, banners, totalHeight } = useTreeLayout(visibleNodes);

  // When goal filter is active, progress counts across all goal nodes (not just this branch)
  const countBase = goalFilterActive ? visibleNodes : branchNodes;
  const done = countBase.filter((n) => n.status === "completed").length;
  const pct =
    countBase.length > 0 ? Math.round((done / countBase.length) * 100) : 0;
  const todayQ =
    dailyQuests.find((q) => !q.completed_at) ?? dailyQuests[0] ?? null;

  const handleNodePress = useCallback((n: SkillNode) => {
    router.push(`/node-detail?node_id=${n.node_id}`);
  }, []);

  const handleGoalBadgePress = useCallback((goalId: string) => {
    setGoalSheetId(goalId);
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.bgBase }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.hTitle, { color: colors.textPrimary }]}>
            Cây kỹ năng
          </Text>
          <Text style={[styles.hSub, { color: colors.textMuted }]}>
            Lộ trình phát triển bản thân
          </Text>
        </View>
        <NeoBrutalBox
          borderColor={colors.glassBorder}
          backgroundColor={colors.bgElevated}
          shadowColor="#000"
          shadowOffsetX={2}
          shadowOffsetY={2}
          borderWidth={1.5}
          borderRadius={18}
          contentStyle={{
            width: 36,
            height: 36,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => router.push("/notifications")}
        >
          <Ionicons
            name="notifications-outline"
            size={20}
            color={colors.textSecondary}
          />
        </NeoBrutalBox>
      </View>

      {/* Goal filter pills */}
      <GoalFilterSection
        customTrees={customTrees}
        selectedGoalId={selectedGoalId}
        onSelectGoal={(goalId) => {
          setSelectedGoalId(goalId);
          setShowOnlyCustom(false);
        }}
        colors={colors}
      />
      {/* Branch tabs */}
      <SkillTreeHeader
        activeBranch={activeBranch}
        onBranchChange={(branch) => {
          setActiveBranch(branch);
          setSelectedGoalId(null);
        }}
        branches={BRANCHES}
        goalFilterActive={goalFilterActive}
      />

      {/* Progress strip */}
      <NeoBrutalBox
        borderColor={goalFilterActive ? colors.brandPrimary : branchColor}
        backgroundColor={colors.bgSurface}
        shadowColor={goalFilterActive ? colors.brandPrimary : branchColor}
        shadowOffsetX={3}
        shadowOffsetY={3}
        borderWidth={1.5}
        borderRadius={12}
        style={{ marginHorizontal: 20, marginTop: 10 }}
        contentStyle={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 14,
          paddingVertical: 10,
          gap: 10,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={[styles.stripName, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {goalFilterActive
              ? (customTrees.find((t) => t.id === selectedGoalId)?.goal ??
                "Lộ trình")
              : BRANCH_NAME[activeBranch]}
          </Text>
          <Text style={[styles.stripCount, { color: colors.textMuted }]}>
            {done}/{countBase.length} hoàn tất
            {goalFilterActive && (
              <Text style={{ color: colors.brandPrimary }}>
                {" "}
                · Lọc theo lộ trình
              </Text>
            )}
          </Text>
        </View>
        <View style={[styles.track, { backgroundColor: colors.bgElevated }]}>
          <View
            style={[
              styles.fill,
              {
                width: `${pct}%` as any,
                backgroundColor: goalFilterActive
                  ? colors.brandPrimary
                  : branchColor,
              },
            ]}
          />
        </View>
        <Text
          style={[
            styles.pct,
            { color: goalFilterActive ? colors.brandPrimary : branchColor },
          ]}
        >
          {pct}%
        </Text>

        {/* Custom filter chip — only show when >1 custom node in this branch AND no goal filter active */}
        {customCount > 1 && !goalFilterActive && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowOnlyCustom((v) => !v)}
            style={[
              styles.filterChip,
              showOnlyCustom
                ? {
                    backgroundColor: `${branchColor}28`,
                    borderColor: `${branchColor}70`,
                  }
                : {
                    backgroundColor: colors.bgElevated,
                    borderColor: colors.glassBorder,
                  },
            ]}
          >
            <Ionicons
              name="sparkles"
              size={10}
              color={showOnlyCustom ? branchColor : colors.textMuted}
            />
            <Text
              style={[
                styles.filterChipText,
                { color: showOnlyCustom ? branchColor : colors.textMuted },
              ]}
            >
              Tự thêm
            </Text>
            {showOnlyCustom && (
              <View
                style={[styles.filterDot, { backgroundColor: branchColor }]}
              />
            )}
          </TouchableOpacity>
        )}
      </NeoBrutalBox>
      {/* ── Winding path canvas ── */}
      <SkillTreeCanvas
        placed={placed}
        banners={banners}
        totalHeight={totalHeight}
        branchColor={branchColor}
        colors={colors}
        onNodePress={handleNodePress}
        nodeGoalMap={nodeGoalMap}
        colorMap={colorMap}
        goalFilterActive={goalFilterActive}
        onGoalBadgePress={handleGoalBadgePress}
      >
        {/* Today quest banner */}
        {todayQ && (
          <NeoBrutalAccent
            accentColor={branchColor}
            strokeColor="rgba(0,0,0,0.5)"
            shadowOffsetX={3}
            shadowOffsetY={3}
            borderWidth={1.5}
            borderRadius={12}
            style={{ marginHorizontal: 20, marginTop: 4 }}
            onPress={() => router.push("/(tabs)/quests")}
            contentStyle={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 12,
              gap: 6,
            }}
          >
            <Emoji size={13}>✦</Emoji>
            <Text style={styles.questText} numberOfLines={1}>
              {" "}
              Hôm nay: {todayQ.title}
            </Text>
            <Ionicons name="chevron-forward" size={14} color="#fff" />
          </NeoBrutalAccent>
        )}
      </SkillTreeCanvas>
      {/* ── Goal Overview Sheet ── */}
      <Modal
        visible={!!goalSheetId}
        // transparent
        animationType="slide"
        onRequestClose={() => setGoalSheetId(null)}
        statusBarTranslucent={true}
        navigationBarTranslucent={true}
      >
        <Pressable style={styles.overlay} onPress={() => setGoalSheetId(null)}>
          {(() => {
            const goalTree = customTrees.find((t) => t.id === goalSheetId);
            if (!goalTree) return null;

            // Group clusters by branch
            const branchGroups: Partial<
              Record<Branch, typeof goalTree.clusters>
            > = {};
            for (const c of goalTree.clusters) {
              if (!branchGroups[c.branch]) branchGroups[c.branch] = [];
              branchGroups[c.branch]!.push(c);
            }
            const BRANCH_COLOR: Record<Branch, string> = {
              career: "#7C6AF7",
              finance: "#22C55E",
              softskills: "#F59E0B",
              wellbeing: "#EC4899",
            };
            const BRANCH_LABEL: Record<Branch, string> = {
              career: "Sự nghiệp",
              finance: "Tài chính",
              softskills: "Kỹ năng mềm",
              wellbeing: "Sức khỏe",
            };
            const BRANCH_EMOJI_MAP: Record<Branch, string> = {
              career: "💼",
              finance: "💰",
              softskills: "💬",
              wellbeing: "🧘",
            };

            return (
              <View
                style={[
                  styles.sheet,
                  {
                    backgroundColor: colors.bgSurface,
                    borderColor: colors.glassBorder,
                  },
                ]}
              >
                <View style={styles.handle} />
                <Text
                  style={[styles.goalSheetTitle, { color: colors.textPrimary }]}
                  numberOfLines={2}
                >
                  🎯 {goalTree.goal}
                </Text>
                <Text
                  style={[styles.goalSheetSub, { color: colors.textMuted }]}
                >
                  Lộ trình này trải đều trên {Object.keys(branchGroups).length}{" "}
                  danh mục
                </Text>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  style={{ marginTop: 16 }}
                >
                  {(
                    Object.entries(branchGroups) as [
                      Branch,
                      typeof goalTree.clusters,
                    ][]
                  ).map(([branch, clusters]) => {
                    const col = BRANCH_COLOR[branch];
                    const totalSkills = clusters.reduce(
                      (s, c) => s + c.skills.length,
                      0,
                    );
                    return (
                      <View
                        key={branch}
                        style={[
                          styles.goalBranchSection,
                          { borderColor: `${col}30` },
                        ]}
                      >
                        {/* Branch header */}
                        <View
                          style={[
                            styles.goalBranchHeader,
                            { backgroundColor: `${col}15` },
                          ]}
                        >
                          <Text style={{ fontSize: 16 }}>
                            {BRANCH_EMOJI_MAP[branch]}
                          </Text>
                          <Text
                            style={[styles.goalBranchLabel, { color: col }]}
                          >
                            {BRANCH_LABEL[branch]}
                          </Text>
                          <Text
                            style={[
                              styles.goalBranchCount,
                              { color: colors.textMuted },
                            ]}
                          >
                            {clusters.length} nhóm · {totalSkills} kỹ năng
                          </Text>
                          <TouchableOpacity
                            onPress={() => {
                              setGoalSheetId(null);
                              setActiveBranch(branch);
                            }}
                            style={[
                              styles.goalBranchBtn,
                              { borderColor: `${col}60` },
                            ]}
                          >
                            <Text
                              style={[styles.goalBranchBtnText, { color: col }]}
                            >
                              Xem →
                            </Text>
                          </TouchableOpacity>
                        </View>

                        {/* Clusters in this branch */}
                        {clusters.map((cluster) => (
                          <View key={cluster.id} style={styles.goalClusterRow}>
                            <Text style={styles.goalClusterEmoji}>
                              {cluster.emoji}
                            </Text>
                            <View style={{ flex: 1 }}>
                              <Text
                                style={[
                                  styles.goalClusterTitle,
                                  { color: colors.textPrimary },
                                ]}
                              >
                                {cluster.title}
                              </Text>
                              <Text
                                style={[
                                  styles.goalClusterSub,
                                  { color: colors.textMuted },
                                ]}
                              >
                                {cluster.skills.map((s) => s.title).join(" · ")}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    );
                  })}
                  <View style={{ height: 24 }} />
                </ScrollView>
              </View>
            );
          })()}
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 2,
  },
  hTitle: { fontSize: 24, fontWeight: "800" },
  hSub: { fontSize: 12, marginTop: 2 },
  stripName: {
    fontSize: 13,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "700",
  },
  stripCount: { fontSize: 11, marginTop: 1 },
  track: { width: 80, height: 5, borderRadius: 3, overflow: "hidden" },
  fill: { height: 5, borderRadius: 3 },
  pct: {
    fontSize: 13,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "700",
    minWidth: 34,
    textAlign: "right",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    marginLeft: 4,
  },
  filterChipText: {
    fontSize: 10,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "700",
  },
  filterDot: { width: 5, height: 5, borderRadius: 2.5 },
  questText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "SpaceGrotesk-SemiBold",
    fontWeight: "600",
    color: "#fff",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.52)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingTop: 12,
    borderWidth: 1,
    minHeight: 350,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignSelf: "center",
    marginBottom: 20,
  },
  goalSheetTitle: { fontSize: 17, fontWeight: "800", lineHeight: 24 },
  goalSheetSub: { fontSize: 12, marginTop: 4 },
  goalBranchSection: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 10,
    overflow: "hidden",
  },
  goalBranchHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  goalBranchLabel: {
    fontSize: 13,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "700",
    flex: 1,
  },
  goalBranchCount: { fontSize: 11 },
  goalBranchBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  goalBranchBtnText: {
    fontSize: 11,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "700",
  },
  goalClusterRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  goalClusterEmoji: { fontSize: 16, marginTop: 1 },
  goalClusterTitle: {
    fontSize: 13,
    fontFamily: "SpaceGrotesk-SemiBold",
    fontWeight: "600",
  },
  goalClusterSub: { fontSize: 10, marginTop: 2, lineHeight: 14 },
});
