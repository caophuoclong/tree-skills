import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import {
  getDemoCustomData,
  getDemoNodes,
} from "@/src/business-logic/data/skill-tree-nodes";
import { useCustomSkillTreeStore } from "@/src/business-logic/stores/customSkillTreeStore";
import { useQuestStore } from "@/src/business-logic/stores/questStore";
import { useSkillTreeStore } from "@/src/business-logic/stores/skillTreeStore";
import type { Branch, SkillNode } from "@/src/business-logic/types";
import { Emoji, NeoBrutalAccent, NeoBrutalBox } from "@/src/ui/atoms";
import { useTheme } from "@/src/ui/tokens";
import { SkillNodeSheet } from "@/src/ui/organisms/SkillNodeSheet";
import { SkillTreeHeader } from "@/src/ui/molecules/SkillTreeHeader";

// ─── Layout constants ──────────────────────────────────────────────────────────
const { width: SW } = Dimensions.get("window");
const NODE_SIZE = 68; // node circle diameter
const ROW_HEIGHT = 96; // center-to-center vertical distance between nodes
const HEADER_H = 64; // tier banner height

// ─── Zigzag X positions (node left edge) ──────────────────────────────────────
const X = {
  left: 36,
  center: (SW - NODE_SIZE) / 2,
  right: SW - 36 - NODE_SIZE,
} as const;
type XKey = keyof typeof X;

const ZIGZAG: XKey[] = ["center", "right", "center", "left"];

// ─── Types ────────────────────────────────────────────────────────────────────
interface Placed {
  node: SkillNode;
  x: number; // left edge
  y: number; // top edge
  cx: number; // circle center x
  cy: number; // circle center y
}

interface Banner {
  tier: number;
  label: string;
  y: number;
}

// ─── Build path ───────────────────────────────────────────────────────────────
const TIER_LABEL: Record<number, string> = {
  1: "NỀN TẢNG",
  2: "TRUNG CẤP",
  3: "NÂNG CAO",
};
const TIER_ICON: Record<number, string> = { 1: "🌱", 2: "⚡", 3: "🔥" };

function buildPath(nodes: SkillNode[]) {
  const sorted = [...nodes].sort((a, b) => a.tier - b.tier);
  const placed: Placed[] = [];
  const banners: Banner[] = [];
  let y = 24,
    posIdx = 0,
    lastTier = -1;

  for (const node of sorted) {
    if (node.tier !== lastTier) {
      banners.push({ tier: node.tier, label: TIER_LABEL[node.tier] ?? "", y });
      y += HEADER_H;
      lastTier = node.tier;
    }
    const key = ZIGZAG[posIdx % ZIGZAG.length];
    const xVal = X[key];
    placed.push({
      node,
      x: xVal,
      y,
      cx: xVal + NODE_SIZE / 2,
      cy: y + NODE_SIZE / 2,
    });
    y += ROW_HEIGHT;
    posIdx++;
  }

  return { placed, banners, totalHeight: y + 40 };
}

// ─── SVG connector paths ───────────────────────────────────────────────────────
/**
 * Cubic-bezier S-curve between two node centres.
 * Control points sit at the same horizontal as each node but at the
 * vertical midpoint → produces a smooth horizontal "swing".
 */
function makeCubicPath(from: Placed, to: Placed): string {
  const midY = (from.cy + to.cy) / 2;
  return `M ${from.cx} ${from.cy} C ${from.cx} ${midY} ${to.cx} ${midY} ${to.cx} ${to.cy}`;
}

interface SvgPathsProps {
  placed: Placed[];
  branchColor: string;
  totalHeight: number;
}

function SvgPaths({ placed, branchColor, totalHeight }: SvgPathsProps) {
  return (
    <Svg
      width={SW}
      height={totalHeight}
      style={StyleSheet.absoluteFillObject}
      pointerEvents="none"
    >
      {placed.map((p, i) => {
        if (i === 0) return null;
        const prev = placed[i - 1];
        const d = makeCubicPath(prev, p);
        const isCompleted =
          prev.node.status === "completed" && p.node.status === "completed";
        const isActive =
          !isCompleted &&
          (prev.node.status !== "locked" || p.node.status !== "locked");

        return (
          <React.Fragment key={`seg_${i}`}>
            {/* ① depth shadow underneath */}
            <Path
              d={d}
              stroke="rgba(0,0,0,0.35)"
              strokeWidth={isCompleted ? 14 : 11}
              fill="none"
              strokeLinecap="round"
            />

            {/* ② glow halo on completed segments */}
            {isCompleted && (
              <Path
                d={d}
                stroke={branchColor}
                strokeWidth={18}
                fill="none"
                strokeLinecap="round"
                opacity={0.12}
              />
            )}

            {/* ③ main path line */}
            <Path
              d={d}
              stroke={
                isCompleted
                  ? branchColor
                  : isActive
                    ? "rgba(255,255,255,0.22)"
                    : "rgba(255,255,255,0.09)"
              }
              strokeWidth={isCompleted ? 9 : 7}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={isCompleted ? undefined : "10 9"}
              opacity={isCompleted ? 0.75 : 1}
            />

            {/* ④ bright centre line on completed (gives "raised road" feel) */}
            {isCompleted && (
              <Path
                d={d}
                stroke="rgba(255,255,255,0.22)"
                strokeWidth={2.5}
                fill="none"
                strokeLinecap="round"
              />
            )}
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

// ─── Tier banner ───────────────────────────────────────────────────────────────
function TierBannerView({
  banner,
  branchColor,
  colors,
}: {
  banner: Banner;
  branchColor: string;
  colors: any;
}) {
  return (
    <View
      pointerEvents="none"
      style={[styles.bannerWrap, { top: banner.y, height: HEADER_H }]}
    >
      {/* Main pill content */}

      <NeoBrutalAccent
        accentColor={branchColor}
        strokeColor="#000"
        borderWidth={1.5}
        borderRadius={9999}
      >
        <View style={[styles.bannerPill]}>
          <Emoji size={12}>{TIER_ICON[banner.tier] ?? ""}</Emoji>
          <Text style={[styles.bannerText, { color: "#fff" }]}>
            {banner.label}
          </Text>
        </View>
      </NeoBrutalAccent>
    </View>
  );
}

// ─── Node circle ───────────────────────────────────────────────────────────────
const BRANCH_ICON: Record<Branch, string> = {
  career: "💼",
  finance: "💰",
  softskills: "💬",
  wellbeing: "🧘",
};

interface NodeProps {
  placed: Placed;
  branchColor: string;
  colors: any;
  onPress: (n: SkillNode) => void;
  goalTitle?: string; // if set, show a small goal origin badge
  onGoalBadgePress?: () => void;
}

function NodeCircle({
  placed,
  branchColor,
  colors,
  onPress,
  goalTitle,
  onGoalBadgePress,
}: NodeProps) {
  const { node, x, y } = placed;
  const isCompleted = node.status === "completed";
  const isInProgress = node.status === "in_progress";
  const isLocked = node.status === "locked";

  /* pulse ring animation */
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!isInProgress) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1100,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isInProgress, pulse]);

  const pScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.55],
  });
  const pOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0],
  });

  // Determine label side based on horizontal position
  const isAtLeft = x < SW * 0.3;
  const isAtRight = x > SW * 0.6;
  const labelStyle = isAtLeft
    ? { left: NODE_SIZE + 10, right: undefined, textAlign: "left" as const }
    : isAtRight
      ? { right: SW - x, left: undefined, textAlign: "right" as const }
      : {
          left: -10,
          right: -10,
          textAlign: "center" as const,
          top: NODE_SIZE + 4,
        };

  return (
    <TouchableOpacity
      activeOpacity={isLocked ? 1 : 0.75}
      onPress={() => !isLocked && onPress(node)}
      style={[styles.nodeWrap, { left: x, top: y }]}
    >
      {/* Hard shadow view — sits behind the main circle */}
      {!isLocked && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: NODE_SIZE,
            height: NODE_SIZE,
            borderRadius: NODE_SIZE / 2,
            backgroundColor: isCompleted ? branchColor : "rgba(0,0,0,0.5)",
            top: 3,
            left: 3,
          }}
        />
      )}

      {/* Pulse ring */}
      {isInProgress && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: NODE_SIZE + 20,
            height: NODE_SIZE + 20,
            borderRadius: (NODE_SIZE + 20) / 2,
            borderWidth: 2.5,
            borderColor: branchColor,
            top: -10,
            left: -10,
            transform: [{ scale: pScale }],
            opacity: pOpacity,
          }}
        />
      )}

      {/* Main circle */}
      <View
        style={[
          styles.nodeCircle,
          isCompleted && {
            backgroundColor: branchColor,
            borderWidth: 2.5,
            borderColor: "rgba(0,0,0,0.5)",
          },
          isInProgress && {
            backgroundColor: `${branchColor}25`,
            borderColor: branchColor,
            borderWidth: 2.5,
          },
          isLocked && {
            backgroundColor: colors.bgElevated,
            borderColor: "rgba(255,255,255,0.07)",
            borderWidth: 1.5,
            opacity: 0.38,
          },
        ]}
      >
        {isCompleted && <Ionicons name="checkmark" size={26} color="#fff" />}
        {isInProgress && <Emoji size={24}>{BRANCH_ICON[node.branch]}</Emoji>}
        {isLocked && (
          <Ionicons
            name="lock-closed"
            size={20}
            color="rgba(255,255,255,0.25)"
          />
        )}
      </View>

      {/* XP badge on completed */}
      {isCompleted && (
        <View
          style={[
            styles.xpBadge,
            { backgroundColor: branchColor, borderColor: colors.bgBase },
          ]}
        >
          <Text style={styles.xpBadgeText}>✓</Text>
        </View>
      )}

      {/* Goal origin badge — shows for custom AI-built nodes */}
      {!!goalTitle && (
        <TouchableOpacity
          onPress={onGoalBadgePress}
          activeOpacity={0.8}
          style={[
            styles.goalBadge,
            { backgroundColor: `${branchColor}CC`, borderColor: colors.bgBase },
          ]}
        >
          <Text style={styles.goalBadgeText}>✦</Text>
        </TouchableOpacity>
      )}

      {/* Label — side for left/right nodes, below for center */}
      {!isLocked && (
        <Text
          numberOfLines={2}
          style={[
            styles.nodeLabel,
            {
              color: isInProgress ? colors.textPrimary : colors.textSecondary,
              fontFamily: isInProgress
                ? "SpaceGrotesk-Bold"
                : "SpaceGrotesk-Medium",
              fontWeight: isInProgress ? "700" : "500",
            },
            isAtLeft || isAtRight
              ? {
                  position: "absolute",
                  top: (NODE_SIZE - 28) / 2,
                  width: 90,
                  ...labelStyle,
                }
              : {
                  marginTop: 6,
                  textAlign: "center",
                  width: NODE_SIZE + 16,
                  marginLeft: -8,
                },
          ]}
        >
          {node.title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

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
  const [selectedNode, setSelectedNode] = React.useState<SkillNode | null>(null);
  const [treeTab, setTreeTab] = React.useState<'default' | 'custom'>('default');
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
    // Seed custom store with demo goals so goal filter pills are visible on first launch
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

  const { placed, banners, totalHeight } = useMemo(
    () => buildPath(visibleNodes),
    [visibleNodes],
  );

  // When goal filter is active, progress counts across all goal nodes (not just this branch)
  const countBase = goalFilterActive ? visibleNodes : branchNodes;
  const done = countBase.filter((n) => n.status === "completed").length;
  const pct =
    countBase.length > 0 ? Math.round((done / countBase.length) * 100) : 0;
  const todayQ =
    dailyQuests.find((q) => !q.completed_at) ?? dailyQuests[0] ?? null;

  const handlePress = useCallback((n: SkillNode) => {
    setSelectedNode(n);
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

      {/* Default/Custom tree tab switcher */}
      <View style={styles.treePillsContainer}>
        <TouchableOpacity
          style={[
            styles.treePill,
            {
              backgroundColor: treeTab === 'default' ? colors.brandPrimary : 'transparent',
              borderColor: treeTab === 'default' ? colors.textPrimary : colors.textMuted,
              borderWidth: treeTab === 'default' ? 2 : 1.5,
            },
          ]}
          onPress={() => setTreeTab('default')}
        >
          <Text
            style={[
              styles.treePillText,
              {
                color: treeTab === 'default' ? '#fff' : colors.textMuted,
                fontFamily: 'SpaceGrotesk-SemiBold',
              },
            ]}
          >
            Default
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.treePill,
            {
              backgroundColor: treeTab === 'custom' ? colors.brandPrimary : 'transparent',
              borderColor: treeTab === 'custom' ? colors.textPrimary : colors.textMuted,
              borderWidth: treeTab === 'custom' ? 2 : 1.5,
            },
          ]}
          onPress={() => setTreeTab('custom')}
        >
          <Text
            style={[
              styles.treePillText,
              {
                color: treeTab === 'custom' ? '#fff' : colors.textMuted,
                fontFamily: 'SpaceGrotesk-SemiBold',
              },
            ]}
          >
            Custom ✨
          </Text>
        </TouchableOpacity>
      </View>

      {/* Custom tree tab content — empty state or custom goals */}
      {treeTab === 'custom' && (
        customTrees.length === 0 ? (
          <View style={styles.emptyCustom}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No custom skill trees yet
            </Text>
            <TouchableOpacity onPress={() => router.push('/skill-builder')}>
              <Text style={[styles.emptyLink, { color: colors.brandPrimary }]}>
                Create your first skill tree →
              </Text>
            </TouchableOpacity>
          </View>
        ) : null
      )}

      {/* Goal filter pills — only renders when user has created at least one goal tree and on default tab */}
      {treeTab === 'default' && customTrees.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.goalPillsScroll}
          contentContainerStyle={styles.goalPillsRow}
        >
          {/* "All" pill */}
          {!goalFilterActive ? (
            <NeoBrutalAccent
              accentColor={colors.brandPrimary}
              strokeColor="#000"
              shadowOffsetX={2}
              shadowOffsetY={2}
              borderRadius={9999}
              onPress={() => setSelectedGoalId(null)}
              contentStyle={{
                paddingHorizontal: 14,
                paddingVertical: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "SpaceGrotesk-Bold",
                  fontWeight: "700",
                  color: "#fff",
                }}
              >
                ✦ Tất cả
              </Text>
            </NeoBrutalAccent>
          ) : (
            <NeoBrutalBox
              borderColor={colors.glassBorder}
              backgroundColor={colors.bgElevated}
              shadowColor="#000"
              shadowOffsetX={2}
              shadowOffsetY={2}
              borderRadius={9999}
              onPress={() => setSelectedGoalId(null)}
              contentStyle={{
                paddingHorizontal: 14,
                paddingVertical: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "SpaceGrotesk-Bold",
                  fontWeight: "700",
                  color: colors.textSecondary,
                }}
              >
                ✦ Tất cả
              </Text>
            </NeoBrutalBox>
          )}

          {/* One pill per saved goal tree */}
          {customTrees.map((tree) => {
            const active = selectedGoalId === tree.id;
            return active ? (
              <NeoBrutalAccent
                key={tree.id}
                accentColor={colors.brandPrimary}
                strokeColor="#000"
                shadowOffsetX={2}
                shadowOffsetY={2}
                borderRadius={9999}
                onPress={() => {
                  setSelectedGoalId(tree.id);
                  setShowOnlyCustom(false);
                }}
                contentStyle={{
                  paddingHorizontal: 14,
                  paddingVertical: 2,
                  maxWidth: 180,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "SpaceGrotesk-Bold",
                    fontWeight: "700",
                    color: "#fff",
                  }}
                  numberOfLines={1}
                >
                  🎯{tree.goal}
                </Text>
              </NeoBrutalAccent>
            ) : (
              <NeoBrutalBox
                key={tree.id}
                borderColor={colors.glassBorder}
                backgroundColor={colors.bgElevated}
                shadowColor="#000"
                shadowOffsetX={2}
                shadowOffsetY={2}
                borderRadius={9999}
                onPress={() => {
                  setSelectedGoalId(tree.id);
                  setShowOnlyCustom(false);
                }}
                contentStyle={{
                  paddingHorizontal: 14,
                  paddingVertical: 2,
                  maxWidth: 180,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "SpaceGrotesk-Bold",
                    fontWeight: "700",
                    color: colors.textSecondary,
                  }}
                  numberOfLines={1}
                >
                  🎯{tree.goal}
                </Text>
              </NeoBrutalBox>
            );
          })}

          {/* Tạo mới button */}
          <NeoBrutalAccent
            accentColor={`${colors.brandPrimary}`}
            // strokeColor={colors.brandPrimary}
            shadowOffsetX={2}
            shadowOffsetY={2}
            borderWidth={1.5}
            borderRadius={9999}
            onPress={() => router.push("/skill-builder")}
            contentStyle={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 12,
              paddingVertical: 6,
              gap: 5,
            }}
          >
            <Ionicons name="sparkles" size={12} color={colors.textPrimary} />
            <Text
              style={{
                fontSize: 13,
                fontFamily: "SpaceGrotesk-Bold",
                fontWeight: "700",
                color: colors.textPrimary,
              }}
            >
              Tạo mới
            </Text>
          </NeoBrutalAccent>
        </ScrollView>
      )}

      {/* Branch tabs — only on default tree tab */}
      {treeTab === 'default' && (
        <SkillTreeHeader
          activeBranch={activeBranch}
          onBranchChange={(branch) => {
            setActiveBranch(branch);
            setSelectedGoalId(null);
          }}
          branches={BRANCHES}
          goalFilterActive={goalFilterActive}
        />
      )}

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
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: SW, height: totalHeight }}>
          {/* SVG bezier paths — below nodes */}
          {/* When goal filter active, use brandPrimary as unified connector color */}
          <SvgPaths
            placed={placed}
            branchColor={goalFilterActive ? colors.brandPrimary : branchColor}
            totalHeight={totalHeight}
          />

          {/* Tier banners — use brandPrimary when goal filter active (nodes span multiple branches) */}
          {banners.map((b) => (
            <TierBannerView
              key={`b${b.tier}`}
              banner={b}
              branchColor={goalFilterActive ? colors.brandPrimary : branchColor}
              colors={colors}
            />
          ))}

          {/* Nodes on top */}
          {/* When goal filter active, each node uses its own branch color (nodes may span multiple branches) */}
          {placed.map((p) => {
            const goalEntry = nodeGoalMap[p.node.node_id];
            const nodeColor = goalFilterActive
              ? colorMap[p.node.branch]
              : branchColor;
            return (
              <NodeCircle
                key={p.node.node_id}
                placed={p}
                branchColor={nodeColor}
                colors={colors}
                onPress={handlePress}
                goalTitle={goalEntry?.goalTitle}
                onGoalBadgePress={
                  goalEntry ? () => setGoalSheetId(goalEntry.goalId) : undefined
                }
              />
            );
          })}
        </View>

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
      </ScrollView>

      {/* Skill Node Sheet (E3) */}
      <SkillNodeSheet
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
      />

      {/* ── Goal Overview Sheet ── */}
      <Modal
        visible={!!goalSheetId}
        transparent
        animationType="slide"
        onRequestClose={() => setGoalSheetId(null)}
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

  // Tree tab switcher (Default/Custom)
  treePillsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  treePill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  treePillText: {
    fontSize: 13,
  },
  emptyCustom: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 14,
    marginBottom: 12,
  },
  emptyLink: {
    fontSize: 13,
    fontFamily: "SpaceGrotesk-SemiBold",
    fontWeight: "600",
  },

  // Goal filter pills
  goalPillsScroll: { marginTop: 12, flexGrow: 0, flexShrink: 0, maxHeight: 32 },
  goalPillsRow: {
    paddingHorizontal: 20,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  goalPillText: {
    fontSize: 12,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "700",
  },

  tabsScroll: { marginTop: 8, flexGrow: 0, flexShrink: 0, maxHeight: 38 },
  tabsRow: {
    paddingHorizontal: 20,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  tabSep: { width: 1, height: 20, alignSelf: "center", marginHorizontal: 4 },
  tabText: { fontSize: 13 },

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

  // Node
  nodeWrap: { position: "absolute", width: NODE_SIZE, alignItems: "center" },
  nodeCircle: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  nodeLabel: { fontSize: 10, lineHeight: 13 },

  // XP badge (top-right of completed node)
  xpBadge: {
    position: "absolute",
    top: -2,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  xpBadgeText: { fontSize: 8, color: "#fff", fontWeight: "800" },

  // Tier banner
  bannerWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  bannerText: {
    fontSize: 10,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "700",
    letterSpacing: 1.8,
    textTransform: "uppercase",
  },

  // Today quest
  questText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "SpaceGrotesk-SemiBold",
    fontWeight: "600",
    color: "#fff",
  },

  // Modal
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
  sheetHdr: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 18,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "700",
  },
  sheetSub: {
    fontSize: 11,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "700",
    marginTop: 2,
    letterSpacing: 0.5,
  },
  sheetDesc: { fontSize: 14, lineHeight: 22, marginBottom: 20 },
  sheetStats: { flexDirection: "row", gap: 28, marginBottom: 24 },
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
    marginTop: 3,
  },
  sheetBtnText: {
    fontSize: 15,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "700",
  },

  // Goal badge on custom nodes
  goalBadge: {
    position: "absolute",
    bottom: -2,
    left: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  goalBadgeText: { fontSize: 7, color: "#fff", fontWeight: "900" },

  // Goal overview sheet
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
