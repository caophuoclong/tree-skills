import { getInitialNodes } from "@/src/business-logic/data/skill-tree-nodes";
import { useSkillTreeStore } from "@/src/business-logic/stores/skillTreeStore";
import type { Branch, NodeStatus, SkillNode } from "@/src/business-logic/types";
import { NeoBrutalAccent, NeoBrutalBox } from "@/src/ui/atoms";
import { SkillTreeBranch } from "@/src/ui/organisms/SkillTreeBranch";
import { useTheme } from "@/src/ui/tokens";
import { Radius, Spacing } from "@/src/ui/tokens/spacing";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const BRANCH_LABELS: Record<Branch, string> = {
  career: "Sự nghiệp",
  finance: "Tài chính",
  softskills: "Kỹ năng mềm",
  wellbeing: "Sức khoẻ",
};

const STATUS_LABELS: Record<NodeStatus, string> = {
  locked: "Đã khóa",
  in_progress: "Đang học",
  completed: "Hoàn thành",
};

const getStatusColors = (colors: any): Record<NodeStatus, string> => ({
  locked: colors.textMuted,
  in_progress: colors.brandPrimary,
  completed: colors.success,
});

const getBranchColors = (colors: any): Record<string, string> => ({
  career: colors.career,
  finance: colors.finance,
  softskills: colors.softskills,
  wellbeing: colors.wellbeing,
});

export default function BranchScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const STATUS_COLORS = useMemo(() => getStatusColors(colors), [colors]);
  const BranchColors = useMemo(() => getBranchColors(colors), [colors]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { nodes, setNodes } = useSkillTreeStore();

  // Init nodes if needed
  useEffect(() => {
    if (nodes.length === 0) {
      setNodes(getInitialNodes());
    }
  }, []);

  const branch = (id as Branch) ?? "career";
  const branchColor = BranchColors[branch] ?? colors.brandPrimary;
  const branchLabel = BRANCH_LABELS[branch] ?? branch;

  const branchNodes = nodes.filter((n) => n.branch === branch);

  // Animated entry — slide in from right
  const translateX = useSharedValue(300);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateX.value = withSpring(0, { damping: 20, stiffness: 180 });
    opacity.value = withSpring(1, { damping: 20, stiffness: 180 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  // Node detail modal
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);

  const handleNodePress = (node: SkillNode) => {
    setSelectedNode(node);
  };

  const closeModal = () => setSelectedNode(null);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <NeoBrutalBox
          borderColor={colors.glassBorder}
          backgroundColor={colors.bgElevated}
          shadowColor="#000"
          shadowOffsetX={2}
          shadowOffsetY={2}
          borderWidth={1.5}
          borderRadius={14}
          onPress={() => router.back()}
          contentStyle={{
            width: 36,
            height: 36,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </NeoBrutalBox>

        <View style={styles.headerCenter}>
          <View style={[styles.branchDot, { backgroundColor: branchColor }]} />
          <Text
            style={[
              styles.headerTitle,
              { color: branchColor, fontSize: 16, fontFamily: 'SpaceGrotesk-Bold', fontWeight: "700" },
            ]}
          >
            {branchLabel}
          </Text>
        </View>

        {/* Spacer to balance the back button */}
        <View style={styles.backButtonPlaceholder} />
      </View>

      {/* Animated content */}
      <Animated.View style={[styles.treeWrapper, animatedStyle]}>
        <SkillTreeBranch branch={branch} nodes={branchNodes} />
      </Animated.View>

      {/* Node detail modal */}
      {selectedNode && (
        <Modal
          visible={!!selectedNode}
          transparent
          animationType="fade"
          onRequestClose={closeModal}
        >
          <Pressable style={styles.modalOverlay} onPress={closeModal}>
            <Pressable
              style={[styles.modalSheet, { borderColor: branchColor }]}
              onPress={() => {}}
            >
              {/* NB accent strip */}
              <View
                style={[
                  styles.sheetAccentStrip,
                  { backgroundColor: branchColor },
                ]}
              />
              {/* Drag handle */}
              <View style={styles.sheetHandle} />

              {/* Status badge */}
              <View style={styles.modalStatusRow}>
                <NeoBrutalBox
                  borderColor={`${STATUS_COLORS[selectedNode.status]}60`}
                  backgroundColor={`${STATUS_COLORS[selectedNode.status]}18`}
                  shadowColor={STATUS_COLORS[selectedNode.status]}
                  shadowOffsetX={2}
                  shadowOffsetY={2}
                  borderWidth={1.5}
                  borderRadius={9999}
                  contentStyle={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 5,
                  }}
                >
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: STATUS_COLORS[selectedNode.status] },
                    ]}
                  />
                  <Text
                    style={{
                      fontSize: 11,
                      fontFamily: 'SpaceGrotesk-Bold', fontWeight: "700",
                      color: STATUS_COLORS[selectedNode.status],
                    }}
                  >
                    {STATUS_LABELS[selectedNode.status]}
                  </Text>
                </NeoBrutalBox>
              </View>

              {/* Node title */}
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                {selectedNode.title}
              </Text>

              {/* Description */}
              <Text style={[styles.modalDesc, { color: colors.textSecondary }]}>
                {selectedNode.description}
              </Text>

              {/* Stats row */}
              <NeoBrutalBox
                borderColor={`${branchColor}40`}
                backgroundColor={colors.bgElevated}
                shadowColor={branchColor}
                shadowOffsetX={3}
                shadowOffsetY={3}
                borderWidth={1.5}
                borderRadius={12}
                contentStyle={styles.modalStats}
              >
                <View style={styles.statItem}>
                  <Ionicons
                    name="flash"
                    size={14}
                    color={colors.brandPrimary}
                  />
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                    {selectedNode.xp_required} XP cần thiết
                  </Text>
                </View>
                <View
                  style={[
                    styles.statDivider,
                    { backgroundColor: colors.glassBorder },
                  ]}
                />
                <View style={styles.statItem}>
                  <Ionicons name="list" size={14} color={branchColor} />
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                    {selectedNode.quests_completed}/{selectedNode.quests_total}{" "}
                    nhiệm vụ
                  </Text>
                </View>
              </NeoBrutalBox>

              {/* Locked message */}
              {selectedNode.status === "locked" && (
                <NeoBrutalBox
                  borderColor={`${colors.textMuted}40`}
                  backgroundColor={colors.bgElevated}
                  shadowColor="#000"
                  shadowOffsetX={2}
                  shadowOffsetY={2}
                  borderWidth={1.5}
                  borderRadius={10}
                  contentStyle={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 8,
                    padding: 12,
                  }}
                >
                  <Ionicons
                    name="lock-closed"
                    size={14}
                    color={colors.textMuted}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.textMuted,
                      flex: 1,
                      lineHeight: 18,
                    }}
                  >
                    Chưa mở khóa — hoàn thành các nút trước để tiếp tục
                  </Text>
                </NeoBrutalBox>
              )}

              {/* Close button */}
              <NeoBrutalAccent
                accentColor={`${branchColor}18`}
                strokeColor={branchColor}
                shadowOffsetX={3}
                shadowOffsetY={3}
                borderWidth={2}
                borderRadius={14}
                onPress={closeModal}
                contentStyle={{
                  height: 48,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontFamily: 'SpaceGrotesk-Bold', fontWeight: "700",
                    color: branchColor,
                  }}
                >
                  Đóng
                </Text>
              </NeoBrutalAccent>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bgBase,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: Spacing.screenPadding,
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.glassBorder,
    },
    backButton: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: Radius.md,
      backgroundColor: colors.bgSurface,
    },
    backButtonPlaceholder: {
      width: 36,
    },
    headerCenter: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing.sm,
    },
    branchDot: {
      width: 10,
      height: 10,
      borderRadius: Radius.full,
    },
    headerTitle: {
      fontFamily: 'SpaceGrotesk-Bold', fontWeight: "700",
    },
    treeWrapper: {
      flex: 1,
    },

    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "flex-end",
    },
    modalSheet: {
      backgroundColor: colors.bgElevated,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.xl,
      gap: Spacing.md,
      borderWidth: 2,
      overflow: "hidden",
    },
    sheetAccentStrip: {
      height: 4,
      marginHorizontal: -Spacing.lg,
      marginBottom: 0,
    },
    sheetHandle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: "rgba(255,255,255,0.14)",
      alignSelf: "center",
      marginTop: 12,
    },
    modalStatusRow: {
      flexDirection: "row",
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: Radius.full,
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: 'SpaceGrotesk-Bold', fontWeight: "700",
    },
    modalDesc: {
      lineHeight: 22,
    },
    modalStats: {
      flexDirection: "row",
      alignItems: "center",
      padding: Spacing.md,
      gap: Spacing.md,
    },
    statItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.xs,
      flex: 1,
    },
    statDivider: {
      width: 1,
      height: 20,
    },
    // lockedBanner now rendered as NeoBrutalBox inline
    closeButton: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: Spacing.md,
      borderRadius: Radius.lg,
      borderWidth: 1,
      marginTop: Spacing.xs,
    },
  });
