import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSkillTreeStore } from '@/src/business-logic/stores/skillTreeStore';
import { getDemoNodes } from '@/src/business-logic/data/skill-tree-nodes';
import { Colors, BranchColors } from '@/src/ui/tokens/colors';
import type { Branch, SkillNode } from '@/src/business-logic/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const BRANCHES: { id: Branch; label: string }[] = [
  { id: 'career', label: 'Career' },
  { id: 'finance', label: 'Finance' },
  { id: 'softskills', label: 'Soft Skills' },
  { id: 'wellbeing', label: 'Well-being' },
];

const BRANCH_NAMES: Record<Branch, string> = {
  career: 'Tech & Career',
  finance: 'Finance & Money',
  softskills: 'Communication',
  wellbeing: 'Health & Mind',
};

const TIER_LABELS: Record<number, string> = {
  3: 'TIER 3 · ADVANCED',
  2: 'TIER 2 · INTERMEDIATE',
  1: 'TIER 1 · FOUNDATION',
};

// ─── Node component ───────────────────────────────────────────────────────────

interface NodeCircleProps {
  node: SkillNode;
  branchColor: string;
}

function NodeCircle({ node, branchColor }: NodeCircleProps) {
  const isCompleted = node.status === 'completed';
  const isInProgress = node.status === 'in_progress';
  const isLocked = node.status === 'locked';

  const ICONS: Record<Branch, string> = {
    career: '💼',
    finance: '💰',
    softskills: '💬',
    wellbeing: '🧘',
  };

  return (
    <View style={styles.nodeWrapper}>
      <View
        style={[
          styles.nodeCircle,
          isCompleted && {
            backgroundColor: `${Colors.brandPrimary}33`,
            borderColor: Colors.brandPrimary,
            borderWidth: 2,
          },
          isInProgress && {
            borderColor: branchColor,
            borderWidth: 2.5,
            shadowColor: branchColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 12,
            elevation: 8,
          },
          isLocked && {
            backgroundColor: '#1A1A2E',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1.5,
          },
        ]}
      >
        {isCompleted && (
          <Ionicons name="checkmark" size={24} color={Colors.brandPrimary} />
        )}
        {isInProgress && (
          <Text style={styles.nodeIcon}>{ICONS[node.branch]}</Text>
        )}
        {isLocked && <Text style={styles.lockIcon}>🔒</Text>}
      </View>
      <Text style={styles.nodeLabel} numberOfLines={2}>
        {node.title}
      </Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function TreeScreen() {
  const { nodes, activeBranch, setNodes, setActiveBranch } = useSkillTreeStore();

  useEffect(() => {
    if (nodes.length === 0) {
      setNodes(getDemoNodes());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const branchNodes = nodes.filter((n) => n.branch === activeBranch);
  const completedCount = branchNodes.filter((n) => n.status === 'completed').length;
  const totalCount = branchNodes.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const branchColor = BranchColors[activeBranch];

  // Group nodes by tier descending (3, 2, 1)
  const tier3 = branchNodes.filter((n) => n.tier === 3);
  const tier2 = branchNodes.filter((n) => n.tier === 2);
  const tier1 = branchNodes.filter((n) => n.tier === 1);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Header ─────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Skill Tree</Text>
          <Text style={styles.headerSub}>Gen Z Growth Path</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="search-outline" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Branch tabs ────────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabsContent}
      >
        {BRANCHES.map((branch) => {
          const isActive = activeBranch === branch.id;
          const color = BranchColors[branch.id];
          return (
            <TouchableOpacity
              key={branch.id}
              style={[
                styles.tab,
                isActive
                  ? { backgroundColor: `${color}26` }
                  : { backgroundColor: 'transparent' },
              ]}
              onPress={() => setActiveBranch(branch.id)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: isActive ? color : Colors.textMuted },
                  isActive && styles.tabTextActive,
                ]}
              >
                {branch.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Current branch card ────────────────────────────── */}
      <View style={styles.branchCard}>
        <Text style={styles.branchCardLabel}>CURRENT BRANCH</Text>
        <Text style={styles.branchCardName}>{BRANCH_NAMES[activeBranch]}</Text>
        <Text style={styles.branchCardTier}>Tier: Intermediate</Text>
        <View style={styles.branchProgressRow}>
          <Text style={styles.branchProgressText}>
            {completedCount}/{totalCount} nodes completed
          </Text>
          <View style={styles.branchProgressTrack}>
            <View
              style={[
                styles.branchProgressFill,
                {
                  width: `${progressPercent}%` as any,
                  backgroundColor: branchColor,
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* ── Node tree ──────────────────────────────────────── */}
      <ScrollView
        style={styles.treeScroll}
        contentContainerStyle={styles.treeContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tier 1 — Foundation (top, already unlocked/done) */}
        {tier1.length > 0 && (
          <View style={styles.tierSection}>
            <Text style={styles.tierLabel}>{TIER_LABELS[1]}</Text>
            <View style={styles.connectorLine} />
            <View style={styles.nodesRow}>
              {tier1.map((node) => (
                <NodeCircle key={node.node_id} node={node} branchColor={branchColor} />
              ))}
            </View>
          </View>
        )}

        {/* Connector */}
        {tier1.length > 0 && tier2.length > 0 && (
          <View style={styles.tierConnector} />
        )}

        {/* Tier 2 — Intermediate */}
        {tier2.length > 0 && (
          <View style={styles.tierSection}>
            <Text style={styles.tierLabel}>{TIER_LABELS[2]}</Text>
            <View style={styles.connectorLine} />
            <View style={styles.nodesRow}>
              {tier2.map((node) => (
                <NodeCircle key={node.node_id} node={node} branchColor={branchColor} />
              ))}
            </View>
          </View>
        )}

        {/* Connector */}
        {tier2.length > 0 && tier3.length > 0 && (
          <View style={styles.tierConnector} />
        )}

        {/* Tier 3 — Advanced (bottom, locked until lower tiers done) */}
        {tier3.length > 0 && (
          <View style={styles.tierSection}>
            <Text style={styles.tierLabel}>{TIER_LABELS[3]}</Text>
            <View style={styles.connectorLine} />
            <View style={styles.nodesRow}>
              {tier3.map((node) => (
                <NodeCircle key={node.node_id} node={node} branchColor={branchColor} />
              ))}
            </View>
          </View>
        )}

        {/* Today's Quest Banner */}
        <View style={styles.questBanner}>
          <Text style={styles.questBannerText}>
            ✦ Today's Quest: Coding Sprint
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  headerLeft: {
    gap: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  headerSub: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 4,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Branch tabs
  tabsScroll: {
    marginTop: 16,
    height: 40,
    flexGrow: 0,
    flexShrink: 0,
  },
  tabsContent: {
    paddingHorizontal: 20,
    gap: 8,
    flexDirection: 'row',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    fontWeight: '700',
  },

  // Branch card
  branchCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: Colors.bgSurface,
    borderRadius: 12,
    padding: 16,
  },
  branchCardLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  branchCardName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  branchCardTier: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  branchProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  branchProgressText: {
    fontSize: 11,
    color: Colors.textSecondary,
    flexShrink: 0,
  },
  branchProgressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.bgElevated,
    borderRadius: 2,
    overflow: 'hidden',
  },
  branchProgressFill: {
    height: 4,
    borderRadius: 2,
  },

  // Tree scroll
  treeScroll: {
    flex: 1,
    marginTop: 24,
  },
  treeContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  // Tier section
  tierSection: {
    alignItems: 'center',
    width: '100%',
  },
  tierLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
    textAlign: 'center',
  },
  connectorLine: {
    width: 2,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 12,
  },
  nodesRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 8,
  },

  // Tier connector
  tierConnector: {
    width: 2,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 8,
  },

  // Node
  nodeWrapper: {
    alignItems: 'center',
    width: 80,
  },
  nodeCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeIcon: {
    fontSize: 24,
  },
  lockIcon: {
    fontSize: 20,
  },
  nodeLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 14,
  },

  // Today's Quest Banner
  questBanner: {
    marginTop: 24,
    marginHorizontal: 0,
    width: '100%',
    backgroundColor: `${Colors.brandPrimary}E6`,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  questBannerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
