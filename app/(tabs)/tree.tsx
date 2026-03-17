import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/src/ui/atoms/Text';
import { SkillTreeBranch } from '@/src/ui/organisms/SkillTreeBranch';
import { useSkillTreeStore } from '@/src/business-logic/stores/skillTreeStore';
import { getInitialNodes } from '@/src/business-logic/data/skill-tree-nodes';
import { Colors, BranchColors } from '@/src/ui/tokens/colors';
import { Spacing, Radius } from '@/src/ui/tokens/spacing';
import type { Branch } from '@/src/business-logic/types';

const BRANCHES: { id: Branch; label: string }[] = [
  { id: 'career', label: 'Sự nghiệp' },
  { id: 'finance', label: 'Tài chính' },
  { id: 'softskills', label: 'Kỹ năng mềm' },
  { id: 'wellbeing', label: 'Sức khoẻ' },
];

export default function TreeScreen() {
  const { nodes, activeBranch, setNodes, setActiveBranch } = useSkillTreeStore();

  useEffect(() => {
    if (nodes.length === 0) {
      setNodes(getInitialNodes());
    }
  }, []);

  const branchNodes = nodes.filter((n) => n.branch === activeBranch);
  const completedCount = branchNodes.filter((n) => n.status === 'completed').length;
  const totalCount = branchNodes.length;
  const progressPercent = totalCount > 0 ? completedCount / totalCount : 0;
  const branchColor = BranchColors[activeBranch];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <AppText variant="title" style={styles.title}>
          Cây Kỹ Năng
        </AppText>
        <AppText variant="body" color={Colors.textMuted}>
          Chọn nhánh để xem chi tiết
        </AppText>
      </View>

      {/* Branch selector tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {BRANCHES.map((branch) => {
            const isActive = activeBranch === branch.id;
            const color = BranchColors[branch.id];
            return (
              <TouchableOpacity
                key={branch.id}
                style={[
                  styles.tab,
                  isActive && {
                    borderColor: color,
                    backgroundColor: `${color}18`,
                  },
                  !isActive && styles.tabInactive,
                ]}
                onPress={() => setActiveBranch(branch.id)}
                activeOpacity={0.7}
              >
                <AppText
                  variant="caption"
                  style={[
                    styles.tabLabel,
                    { color: isActive ? color : Colors.textMuted },
                    isActive && styles.tabLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  {branch.label}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* SkillTreeBranch organism */}
      <View style={styles.treeContainer}>
        <SkillTreeBranch branch={activeBranch} nodes={branchNodes} />
      </View>

      {/* Bottom progress summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <AppText variant="caption" color={Colors.textSecondary}>
            {completedCount}/{totalCount} nút hoàn thành
          </AppText>
          <AppText variant="caption" color={branchColor}>
            {Math.round(progressPercent * 100)}%
          </AppText>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progressPercent * 100}%` as any,
                backgroundColor: branchColor,
              },
            ]}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },
  header: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: 4,
  },
  title: {
    color: Colors.textPrimary,
  },
  tabsWrapper: {
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.sm,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    minWidth: 0,
  },
  tabInactive: {
    backgroundColor: Colors.bgSurface,
  },
  tabLabel: {
    textAlign: 'center',
    fontSize: 11,
  },
  tabLabelActive: {
    fontWeight: '600',
  },
  treeContainer: {
    flex: 1,
  },
  summaryContainer: {
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
    backgroundColor: Colors.bgSurface,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
});
