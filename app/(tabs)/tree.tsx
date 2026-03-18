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

import { getDemoNodes } from "@/src/business-logic/data/skill-tree-nodes";
import { useQuestStore } from "@/src/business-logic/stores/questStore";
import { useCustomSkillTreeStore } from "@/src/business-logic/stores/customSkillTreeStore";
import { useSkillTreeStore } from "@/src/business-logic/stores/skillTreeStore";
import type { Branch, SkillNode } from "@/src/business-logic/types";
import { Emoji } from "@/src/ui/atoms";
import { useTheme } from "@/src/ui/tokens";

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
      <View
        style={[
          styles.bannerPill,
          {
            backgroundColor: colors.bgSurface,
            borderColor: `${branchColor}35`,
          },
        ]}
      >
        <Emoji size={12}>{TIER_ICON[banner.tier] ?? ""}</Emoji>
        <Text style={[styles.bannerText, { color: branchColor }]}>
          {banner.label}
        </Text>
      </View>
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
  goalTitle?: string;   // if set, show a small goal origin badge
  onGoalBadgePress?: () => void;
}

function NodeCircle({ placed, branchColor, colors, onPress, goalTitle, onGoalBadgePress }: NodeProps) {
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

      {/* Outer accent ring */}
      {!isLocked && (
        <View
          style={{
            position: "absolute",
            top: -3,
            left: -3,
            width: NODE_SIZE + 6,
            height: NODE_SIZE + 6,
            borderRadius: (NODE_SIZE + 6) / 2,
            borderWidth: isInProgress ? 2.5 : 2,
            borderColor: isCompleted ? `${branchColor}80` : `${branchColor}45`,
          }}
        />
      )}

      {/* Main circle */}
      <View
        style={[
          styles.nodeCircle,
          isCompleted && {
            backgroundColor: branchColor,
            shadowColor: branchColor,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.55,
            shadowRadius: 12,
            elevation: 10,
          },
          isInProgress && {
            backgroundColor: `${branchColor}25`,
            borderColor: branchColor,
            borderWidth: 2.5,
            shadowColor: branchColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.9,
            shadowRadius: 18,
            elevation: 14,
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
  const [selected, setSelected] = React.useState<SkillNode | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [showOnlyCustom, setShowOnlyCustom] = React.useState(false);
  const [goalSheetId, setGoalSheetId] = React.useState<string | null>(null);
  const { nodeGoalMap, trees: customTrees } = useCustomSkillTreeStore();

  useEffect(() => {
    if (nodes.length === 0) setNodes(getDemoNodes());
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

  // Visible nodes — filtered or all
  const visibleNodes = useMemo(
    () =>
      showOnlyCustom
        ? branchNodes.filter((n) => n.node_id.startsWith("custom_"))
        : branchNodes,
    [branchNodes, showOnlyCustom],
  );

  const { placed, banners, totalHeight } = useMemo(
    () => buildPath(visibleNodes),
    [visibleNodes],
  );

  const done = branchNodes.filter((n) => n.status === "completed").length;
  const pct =
    branchNodes.length > 0 ? Math.round((done / branchNodes.length) * 100) : 0;
  const todayQ =
    dailyQuests.find((q) => !q.completed_at) ?? dailyQuests[0] ?? null;

  const handlePress = useCallback((n: SkillNode) => {
    setSelected(n);
    setSheetOpen(true);
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
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: colors.bgElevated }]}
        >
          <Ionicons
            name="notifications-outline"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Branch tabs + Tạo button */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabsRow}
      >
        {BRANCHES.map((b) => {
          const active = activeBranch === b.id;
          const col = colorMap[b.id];
          return (
            <TouchableOpacity
              key={b.id}
              activeOpacity={0.8}
              onPress={() => setActiveBranch(b.id)}
              style={[
                styles.tab,
                active
                  ? { backgroundColor: `${col}1E`, borderColor: `${col}55` }
                  : { borderColor: "transparent" },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: active ? col : colors.textMuted },
                  active && { fontWeight: "700" },
                ]}
              >
                {b.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Separator */}
        <View style={[styles.tabSep, { backgroundColor: colors.glassBorder }]} />

        {/* Tạo cây kỹ năng button — inline with tabs */}
        <TouchableOpacity
          activeOpacity={0.82}
          onPress={() => router.push("/skill-builder")}
          style={[
            styles.tab,
            styles.tabCreate,
            { backgroundColor: `${colors.brandPrimary}1C`, borderColor: `${colors.brandPrimary}55` },
          ]}
        >
          <Ionicons name="sparkles" size={12} color={colors.brandPrimary} />
          <Text style={[styles.tabText, { color: colors.brandPrimary, fontWeight: "700" }]}>
            Tạo mới
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Progress strip */}
      <View style={[styles.strip, { backgroundColor: colors.bgSurface }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.stripName, { color: colors.textPrimary }]}>
            {BRANCH_NAME[activeBranch]}
          </Text>
          <Text style={[styles.stripCount, { color: colors.textMuted }]}>
            {done}/{branchNodes.length} hoàn tất
          </Text>
        </View>
        <View style={[styles.track, { backgroundColor: colors.bgElevated }]}>
          <View
            style={[
              styles.fill,
              { width: `${pct}%` as any, backgroundColor: branchColor },
            ]}
          />
        </View>
        <Text style={[styles.pct, { color: branchColor }]}>{pct}%</Text>

        {/* Custom filter chip — only show when >1 custom node in this branch */}
        {customCount > 1 && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowOnlyCustom((v) => !v)}
            style={[
              styles.filterChip,
              showOnlyCustom
                ? { backgroundColor: `${branchColor}28`, borderColor: `${branchColor}70` }
                : { backgroundColor: colors.bgElevated, borderColor: colors.glassBorder },
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
              <View style={[styles.filterDot, { backgroundColor: branchColor }]} />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* ── Winding path canvas ── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: SW, height: totalHeight }}>
          {/* SVG bezier paths — below nodes */}
          <SvgPaths
            placed={placed}
            branchColor={branchColor}
            totalHeight={totalHeight}
          />

          {/* Tier banners */}
          {banners.map((b) => (
            <TierBannerView
              key={`b${b.tier}`}
              banner={b}
              branchColor={branchColor}
              colors={colors}
            />
          ))}

          {/* Nodes on top */}
          {placed.map((p) => {
            const goalEntry = nodeGoalMap[p.node.node_id];
            return (
              <NodeCircle
                key={p.node.node_id}
                placed={p}
                branchColor={branchColor}
                colors={colors}
                onPress={handlePress}
                goalTitle={goalEntry?.goalTitle}
                onGoalBadgePress={goalEntry ? () => setGoalSheetId(goalEntry.goalId) : undefined}
              />
            );
          })}
        </View>

        {/* Today quest banner */}
        {todayQ && (
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.questBanner,
              { backgroundColor: `${branchColor}E8` },
            ]}
            onPress={() => router.push("/(tabs)/quests")}
          >
            <Emoji size={13}>✦</Emoji>
            <Text style={styles.questText} numberOfLines={1}>
              {"  "}Hôm nay: {todayQ.title}
            </Text>
            <Ionicons name="chevron-forward" size={14} color="#fff" />
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Bottom sheet */}
      <Modal
        visible={sheetOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setSheetOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setSheetOpen(false)}>
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

            <View style={styles.sheetHdr}>
              <View
                style={[
                  styles.sheetIcon,
                  { backgroundColor: `${branchColor}22` },
                ]}
              >
                <Emoji size={22}>
                  {selected ? BRANCH_ICON[selected.branch] : "📚"}
                </Emoji>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.sheetTitle, { color: colors.textPrimary }]}
                >
                  {selected?.title}
                </Text>
                <Text style={[styles.sheetSub, { color: branchColor }]}>
                  {activeBranch.toUpperCase()} · CẤP {selected?.tier}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSheetOpen(false)}>
                <Ionicons
                  name="close-circle"
                  size={28}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            <Text style={[styles.sheetDesc, { color: colors.textSecondary }]}>
              {selected?.description}
            </Text>

            <View style={styles.sheetStats}>
              <View>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                  YÊU CẦU XP
                </Text>
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                  {selected?.xp_required} XP
                </Text>
              </View>
              <View>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                  TIẾN ĐỘ
                </Text>
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                  {selected?.quests_completed}/{selected?.quests_total} NV
                </Text>
              </View>
            </View>

            <TouchableOpacity
              disabled={selected?.status === "locked"}
              style={[
                styles.sheetBtn,
                {
                  backgroundColor:
                    selected?.status === "locked"
                      ? colors.bgElevated
                      : branchColor,
                },
              ]}
              onPress={() => {
                setSheetOpen(false);
                router.push("/(tabs)/quests");
              }}
            >
              <Text
                style={[
                  styles.sheetBtnText,
                  {
                    color:
                      selected?.status === "locked" ? colors.textMuted : "#fff",
                  },
                ]}
              >
                {selected?.status === "locked"
                  ? "Chưa đủ điều kiện mở khoá"
                  : "Bắt đầu ngay →"}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

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
            const branchGroups: Partial<Record<Branch, typeof goalTree.clusters>> = {};
            for (const c of goalTree.clusters) {
              if (!branchGroups[c.branch]) branchGroups[c.branch] = [];
              branchGroups[c.branch]!.push(c);
            }
            const BRANCH_COLOR: Record<Branch, string> = {
              career: '#7C6AF7', finance: '#22C55E', softskills: '#F59E0B', wellbeing: '#EC4899',
            };
            const BRANCH_LABEL: Record<Branch, string> = {
              career: 'Sự nghiệp', finance: 'Tài chính', softskills: 'Kỹ năng mềm', wellbeing: 'Sức khỏe',
            };
            const BRANCH_EMOJI_MAP: Record<Branch, string> = {
              career: '💼', finance: '💰', softskills: '💬', wellbeing: '🧘',
            };

            return (
              <View style={[styles.sheet, { backgroundColor: colors.bgSurface, borderColor: colors.glassBorder }]}>
                <View style={styles.handle} />
                <Text style={[styles.goalSheetTitle, { color: colors.textPrimary }]} numberOfLines={2}>
                  🎯 {goalTree.goal}
                </Text>
                <Text style={[styles.goalSheetSub, { color: colors.textMuted }]}>
                  Lộ trình này trải đều trên {Object.keys(branchGroups).length} danh mục
                </Text>

                <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 16 }}>
                  {(Object.entries(branchGroups) as [Branch, typeof goalTree.clusters][]).map(([branch, clusters]) => {
                    const col = BRANCH_COLOR[branch];
                    const totalSkills = clusters.reduce((s, c) => s + c.skills.length, 0);
                    return (
                      <View key={branch} style={[styles.goalBranchSection, { borderColor: `${col}30` }]}>
                        {/* Branch header */}
                        <View style={[styles.goalBranchHeader, { backgroundColor: `${col}15` }]}>
                          <Text style={{ fontSize: 16 }}>{BRANCH_EMOJI_MAP[branch]}</Text>
                          <Text style={[styles.goalBranchLabel, { color: col }]}>{BRANCH_LABEL[branch]}</Text>
                          <Text style={[styles.goalBranchCount, { color: colors.textMuted }]}>
                            {clusters.length} nhóm · {totalSkills} kỹ năng
                          </Text>
                          <TouchableOpacity
                            onPress={() => { setGoalSheetId(null); setActiveBranch(branch); }}
                            style={[styles.goalBranchBtn, { borderColor: `${col}60` }]}
                          >
                            <Text style={[styles.goalBranchBtnText, { color: col }]}>Xem →</Text>
                          </TouchableOpacity>
                        </View>

                        {/* Clusters in this branch */}
                        {clusters.map((cluster) => (
                          <View key={cluster.id} style={styles.goalClusterRow}>
                            <Text style={styles.goalClusterEmoji}>{cluster.emoji}</Text>
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.goalClusterTitle, { color: colors.textPrimary }]}>{cluster.title}</Text>
                              <Text style={[styles.goalClusterSub, { color: colors.textMuted }]}>
                                {cluster.skills.map((s) => s.title).join(' · ')}
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
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  tabsScroll: { marginTop: 14, flexGrow: 0, flexShrink: 0, maxHeight: 38 },
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
    borderWidth: 1,
  },
  tabCreate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  tabSep: { width: 1, height: 20, alignSelf: "center", marginHorizontal: 4 },
  tabText: { fontSize: 13 },

  strip: {
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stripName: { fontSize: 13, fontWeight: "700" },
  stripCount: { fontSize: 11, marginTop: 1 },
  track: { width: 80, height: 5, borderRadius: 3, overflow: "hidden" },
  fill: { height: 5, borderRadius: 3 },
  pct: { fontSize: 13, fontWeight: "700", minWidth: 34, textAlign: "right" },
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
  filterChipText: { fontSize: 10, fontWeight: "700" },
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
    borderWidth: 1,
  },
  bannerText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.8,
    textTransform: "uppercase",
  },

  // Today quest
  questBanner: {
    marginHorizontal: 20,
    marginTop: 4,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  questText: { flex: 1, fontSize: 13, fontWeight: "600", color: "#fff" },

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
  sheetIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetTitle: { fontSize: 18, fontWeight: "700" },
  sheetSub: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
    letterSpacing: 0.5,
  },
  sheetDesc: { fontSize: 14, lineHeight: 22, marginBottom: 20 },
  sheetStats: { flexDirection: "row", gap: 28, marginBottom: 24 },
  statLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  statValue: { fontSize: 16, fontWeight: "700", marginTop: 3 },
  sheetBtn: {
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetBtnText: { fontSize: 15, fontWeight: "700" },

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
  goalBranchSection: { borderWidth: 1, borderRadius: 12, marginBottom: 10, overflow: "hidden" },
  goalBranchHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  goalBranchLabel: { fontSize: 13, fontWeight: "700", flex: 1 },
  goalBranchCount: { fontSize: 11 },
  goalBranchBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  goalBranchBtnText: { fontSize: 11, fontWeight: "700" },
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
  goalClusterTitle: { fontSize: 13, fontWeight: "600" },
  goalClusterSub: { fontSize: 10, marginTop: 2, lineHeight: 14 },
});
