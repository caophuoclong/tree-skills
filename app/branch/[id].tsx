import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/src/ui/atoms/Text';
import { SkillTreeBranch } from '@/src/ui/organisms/SkillTreeBranch';
import { useSkillTreeStore } from '@/src/business-logic/stores/skillTreeStore';
import { getInitialNodes } from '@/src/business-logic/data/skill-tree-nodes';
import { Colors, BranchColors } from '@/src/ui/tokens/colors';
import { Spacing, Radius } from '@/src/ui/tokens/spacing';
import type { Branch, SkillNode, NodeStatus } from '@/src/business-logic/types';

const BRANCH_LABELS: Record<Branch, string> = {
  career: 'Sự nghiệp',
  finance: 'Tài chính',
  softskills: 'Kỹ năng mềm',
  wellbeing: 'Sức khoẻ',
};

const STATUS_LABELS: Record<NodeStatus, string> = {
  locked: 'Đã khóa',
  in_progress: 'Đang học',
  completed: 'Hoàn thành',
};

const STATUS_COLORS: Record<NodeStatus, string> = {
  locked: Colors.textMuted,
  in_progress: Colors.brandPrimary,
  completed: Colors.success,
};

export default function BranchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { nodes, setNodes } = useSkillTreeStore();

  // Init nodes if needed
  useEffect(() => {
    if (nodes.length === 0) {
      setNodes(getInitialNodes());
    }
  }, []);

  const branch = (id as Branch) ?? 'career';
  const branchColor = BranchColors[branch] ?? Colors.brandPrimary;
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={[styles.branchDot, { backgroundColor: branchColor }]} />
          <AppText variant="bodyLG" style={[styles.headerTitle, { color: branchColor }]}>
            {branchLabel}
          </AppText>
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
            <Pressable style={styles.modalSheet} onPress={() => {}}>
              {/* Status badge */}
              <View style={styles.modalStatusRow}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: `${STATUS_COLORS[selectedNode.status]}20` },
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: STATUS_COLORS[selectedNode.status] },
                    ]}
                  />
                  <AppText
                    variant="caption"
                    style={{ color: STATUS_COLORS[selectedNode.status] }}
                  >
                    {STATUS_LABELS[selectedNode.status]}
                  </AppText>
                </View>
              </View>

              {/* Node title */}
              <AppText variant="bodyLG" style={styles.modalTitle}>
                {selectedNode.title}
              </AppText>

              {/* Description */}
              <AppText variant="body" color={Colors.textSecondary} style={styles.modalDesc}>
                {selectedNode.description}
              </AppText>

              {/* Stats row */}
              <View style={styles.modalStats}>
                <View style={styles.statItem}>
                  <Ionicons name="flash" size={14} color={Colors.brandGlow} />
                  <AppText variant="caption" color={Colors.textSecondary}>
                    {selectedNode.xp_required} XP cần thiết
                  </AppText>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <Ionicons name="list" size={14} color={branchColor} />
                  <AppText variant="caption" color={Colors.textSecondary}>
                    {selectedNode.quests_completed}/{selectedNode.quests_total} nhiệm vụ
                  </AppText>
                </View>
              </View>

              {/* Locked message */}
              {selectedNode.status === 'locked' && (
                <View style={styles.lockedBanner}>
                  <Ionicons name="lock-closed" size={14} color={Colors.textMuted} />
                  <AppText variant="caption" color={Colors.textMuted}>
                    Chưa mở khóa — hoàn thành các nút trước để tiếp tục
                  </AppText>
                </View>
              )}

              {/* Close button */}
              <TouchableOpacity
                style={[styles.closeButton, { borderColor: branchColor }]}
                onPress={closeModal}
                activeOpacity={0.8}
              >
                <AppText variant="body" style={{ color: branchColor, fontWeight: '600' }}>
                  Đóng
                </AppText>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    backgroundColor: Colors.bgSurface,
  },
  backButtonPlaceholder: {
    width: 36,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  branchDot: {
    width: 10,
    height: 10,
    borderRadius: Radius.full,
  },
  headerTitle: {
    fontWeight: '700',
  },
  treeWrapper: {
    flex: 1,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.bgElevated,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  modalStatusRow: {
    flexDirection: 'row',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
  },
  modalTitle: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  modalDesc: {
    lineHeight: 22,
  },
  modalStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.glassBorder,
  },
  lockedBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: `${Colors.textMuted}15`,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginTop: Spacing.xs,
  },
});
