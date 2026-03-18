import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
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
import { GoalOverviewSheet } from "@/src/ui/organisms/GoalOverviewSheet";
import { ProgressBar } from "@/src/ui/organisms/ProgressBar";
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
      <ProgressBar
        branchName={
          goalFilterActive
            ? customTrees.find((t) => t.id === selectedGoalId)?.goal ??
              "Lộ trình"
            : BRANCH_NAME[activeBranch]
        }
        done={done}
        total={countBase.length}
        progress={pct}
        barColor={branchColor}
        colors={colors}
        showCustomFilter={customCount > 1}
        customFilterActive={showOnlyCustom}
        onCustomFilterToggle={() => setShowOnlyCustom((v) => !v)}
        goalFilterActive={goalFilterActive}
      />
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
      <GoalOverviewSheet
        visible={!!goalSheetId}
        goalTree={customTrees.find((t) => t.id === goalSheetId)}
        colors={colors}
        onClose={() => setGoalSheetId(null)}
        onBranchSelect={(branch) => setActiveBranch(branch)}
      />
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
  questText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "SpaceGrotesk-SemiBold",
    fontWeight: "600",
    color: "#fff",
  },
});
