import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SkillNode } from '@/src/ui/molecules/SkillNode';
import { AppText } from '@/src/ui/atoms/Text';
import { Button } from '@/src/ui/atoms/Button';
import { useTheme } from '@/src/ui/tokens';
import { Spacing } from '@/src/ui/tokens/spacing';
import type { SkillNode as SkillNodeType, Branch } from '@/src/business-logic/types';

const TIER_LABELS = ['Beginner', 'Intermediate', 'Advanced'];

interface SkillTreeBranchProps {
  branch: Branch;
  nodes: SkillNodeType[];
  activeNodeId?: string;
}

const getBranchColors = (colors: any): Record<string, string> => ({
  career: colors.career,
  finance: colors.finance,
  softskills: colors.softskills,
  wellbeing: colors.wellbeing,
});

export function SkillTreeBranch({ branch, nodes, activeNodeId }: SkillTreeBranchProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const BranchColors = useMemo(() => getBranchColors(colors), [colors]);
  const router = useRouter();
  const branchColor = BranchColors[branch as string] ?? colors.brandPrimary;

  const tiers = [1, 2, 3].map((tier) => nodes.filter((n) => n.tier === tier));

  const handleNodePress = (node: SkillNodeType) => {
    if (node.status === 'in_progress') {
      router.push(`/(tabs)/quests`);
    }
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {tiers.map((tierNodes, i) => (
        <View key={i} style={styles.tier}>
          {/* Tier label */}
          <View style={styles.tierLabel}>
            <View style={[styles.tierLine, { backgroundColor: branchColor }]} />
            <AppText variant="micro" color={branchColor} style={styles.tierText}>
              {TIER_LABELS[i]}
            </AppText>
            <View style={[styles.tierLine, { backgroundColor: branchColor }]} />
          </View>

          {/* Nodes row */}
          <View style={styles.nodesRow}>
            {tierNodes.map((node) => (
              <View key={node.node_id} style={styles.nodeWrapper}>
                <SkillNode
                  branch={node.branch}
                  status={node.status}
                  label={node.title}
                  level={node.tier}
                  xpRequired={node.xp_required}
                  onPress={() => handleNodePress(node)}
                />
                {node.status === 'in_progress' && (
                  <AppText variant="micro" color={branchColor} style={styles.questCount}>
                    {node.quests_completed}/{node.quests_total} quests
                  </AppText>
                )}
              </View>
            ))}
          </View>

          {/* Connector dot between tiers */}
          {i < 2 && (
            <View style={[styles.connector, { backgroundColor: branchColor }]} />
          )}
        </View>
      ))}

      {/* Active node CTA */}
      {activeNodeId && (
        <View style={styles.ctaContainer}>
          <Button
            variant="primary"
            fullWidth
            onPress={() => router.push('/(tabs)/quests')}
          >
            Today&apos;s Quest
          </Button>
        </View>
      )}
    </ScrollView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.lg,
    gap: Spacing.lg,
  },
  tier: {
    gap: Spacing.sm,
  },
  tierLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  tierLine: {
    flex: 1,
    height: 1,
    opacity: 0.4,
  },
  tierText: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  nodesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  nodeWrapper: {
    alignItems: 'center',
    gap: 4,
  },
  questCount: { textAlign: 'center' },
  connector: {
    width: 2,
    height: 24,
    alignSelf: 'center',
    opacity: 0.4,
  },
  ctaContainer: {
    marginTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
});
