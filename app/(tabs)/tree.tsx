import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useMemo } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSkillTreeStore } from '@/src/business-logic/stores/skillTreeStore';
import { useQuestStore } from '@/src/business-logic/stores/questStore';
import { getDemoNodes } from '@/src/business-logic/data/skill-tree-nodes';
import { Emoji } from '@/src/ui/atoms';
import { useTheme } from '@/src/ui/tokens';

import type { Branch, SkillNode } from '@/src/business-logic/types';

const getBranchColors = (colors: any): Record<string, string> => ({
  career: colors.career,
  finance: colors.finance,
  softskills: colors.softskills,
  wellbeing: colors.wellbeing,
});

const BRANCH_NAMES: Record<Branch, string> = {
  career: 'Tech & Career',
  finance: 'Finance & Money',
  softskills: 'Communication',
  wellbeing: 'Health & Mind',
};

const TIER_LABELS: Record<number, string> = {
  3: 'CẤP ĐỘ 3 · NÂNG CAO',
  2: 'CẤP ĐỘ 2 · TRUNG CẤP',
  1: 'CẤP ĐỘ 1 · NỀN TẢNG',
};

// ─── Node component ───────────────────────────────────────────────────────────

interface NodeCircleProps {
  node: SkillNode;
  branchColor: string;
  onPress: (node: SkillNode) => void;
}

function NodeCircle({ node, branchColor, onPress }: NodeCircleProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isCompleted = node.status === 'completed';
  const isInProgress = node.status === 'in_progress';
  const isLocked = node.status === 'locked';

  // Pulse ring animation for in-progress nodes
  const pulseAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!isInProgress) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isInProgress, pulseAnim]);

  const pulseScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] });
  const pulseOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] });

  const ICONS: Record<Branch, string> = {
    career: '💼',
    finance: '💰',
    softskills: '💬',
    wellbeing: '🧘',
  };

  return (
    <TouchableOpacity
      style={styles.nodeWrapper}
      onPress={() => onPress(node)}
      activeOpacity={0.8}
    >
      <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
        {/* Pulse ring — only for in_progress */}
        {isInProgress && (
          <Animated.View
            style={{
              position: 'absolute',
              width: 80,
              height: 80,
              borderRadius: 40,
              borderWidth: 2,
              borderColor: branchColor,
              transform: [{ scale: pulseScale }],
              opacity: pulseOpacity,
            }}
          />
        )}

        <View
          style={[
            styles.nodeCircle,
            isCompleted && {
              backgroundColor: `${branchColor}25`,
              borderColor: branchColor,
              borderWidth: 2.5,
              shadowColor: branchColor,
              shadowOpacity: 0.6,
              shadowRadius: 12,
              elevation: 6,
            },
            isInProgress && {
              borderColor: branchColor,
              borderWidth: 3,
              shadowColor: branchColor,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.9,
              shadowRadius: 16,
              elevation: 10,
            },
            isLocked && {
              backgroundColor: '#1A1A2E',
              borderColor: 'rgba(255,255,255,0.05)',
              borderWidth: 1.5,
              opacity: 0.4,
            },
          ]}
        >
          {isCompleted && (
            <Ionicons name="checkmark" size={26} color={branchColor} />
          )}
          {isInProgress && (
            <Emoji size={24}>{ICONS[node.branch]}</Emoji>
          )}
          {isLocked && <Ionicons name="lock-closed" size={20} color="rgba(255,255,255,0.2)" />}
        </View>
      </View>

      <Text style={[styles.nodeLabel, isLocked && { color: colors.textMuted }]} numberOfLines={2}>
        {node.title}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function TreeScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const BranchColors = useMemo(() => getBranchColors(colors), [colors]);
  const BRANCHES: { id: Branch; label: string }[] = useMemo(() => [
    { id: 'career', label: 'Sự nghiệp' },
    { id: 'finance', label: 'Tài chính' },
    { id: 'softskills', label: 'Kỹ năng mềm' },
    { id: 'wellbeing', label: 'Sức khỏe' },
  ], []);
  const { nodes, activeBranch, setNodes, setActiveBranch } = useSkillTreeStore();
  const { dailyQuests } = useQuestStore();
  const [selectedNode, setSelectedNode] = React.useState<SkillNode | null>(null);
  const [modalVisible, setModalVisible] = React.useState(false);

  // Get today's first incomplete quest for the banner
  const todayBannerQuest = dailyQuests.find((q) => !q.completed_at) ?? dailyQuests[0] ?? null;

  const handleNodePress = (node: SkillNode) => {
    setSelectedNode(node);
    setModalVisible(true);
  };

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
          <Text style={styles.headerTitle}>Cây kỹ năng</Text>
          <Text style={styles.headerSub}>Lộ trình phát triển bản thân</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="search-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color={colors.textSecondary} />
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
                  ? {
                      backgroundColor: `${color}20`,
                      borderColor: `${color}60`,
                      borderWidth: 1,
                      shadowColor: color,
                      shadowOpacity: 0.4,
                      shadowRadius: 8,
                      elevation: 4,
                    }
                  : { backgroundColor: 'transparent', borderWidth: 1, borderColor: 'transparent' },
              ]}
              onPress={() => setActiveBranch(branch.id)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: isActive ? color : colors.textMuted },
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
      <View style={[styles.branchCard, {
        borderWidth: 1,
        borderColor: `${branchColor}30`,
        shadowColor: branchColor,
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 3,
      }]}>
        <Text style={styles.branchCardLabel}>NHÁNH HIỆN TẠI</Text>
        <Text style={styles.branchCardName}>{BRANCH_NAMES[activeBranch]}</Text>
        <Text style={styles.branchCardTier}>Cấp độ: Trung cấp</Text>
        <View style={styles.branchProgressRow}>
          <Text style={styles.branchProgressText}>
            {completedCount}/{totalCount} nút đã hoàn tất
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
            <Text style={[styles.tierLabel, { color: branchColor, opacity: 0.8 }]}>{TIER_LABELS[1]}</Text>
            <View style={[styles.connectorLine, {
              backgroundColor: `${branchColor}60`,
              shadowColor: branchColor,
              shadowOpacity: 0.5,
              shadowRadius: 4,
            }]} />
            <View style={styles.nodesRow}>
              {tier1.map((node) => (
                <NodeCircle key={node.node_id} node={node} branchColor={branchColor} onPress={handleNodePress} />
              ))}
            </View>
          </View>
        )}

        {/* Connector tier1 → tier2 */}
        {tier1.length > 0 && tier2.length > 0 && (
          <View style={[styles.tierConnector, {
            backgroundColor: `${branchColor}40`,
            shadowColor: branchColor,
            shadowOpacity: 0.4,
            shadowRadius: 6,
          }]} />
        )}

        {/* Tier 2 — Intermediate */}
        {tier2.length > 0 && (
          <View style={styles.tierSection}>
            <Text style={[styles.tierLabel, { color: branchColor, opacity: 0.7 }]}>{TIER_LABELS[2]}</Text>
            <View style={[styles.connectorLine, {
              backgroundColor: `${branchColor}50`,
              shadowColor: branchColor,
              shadowOpacity: 0.4,
              shadowRadius: 4,
            }]} />
            <View style={styles.nodesRow}>
              {tier2.map((node) => (
                <NodeCircle key={node.node_id} node={node} branchColor={branchColor} onPress={handleNodePress} />
              ))}
            </View>
          </View>
        )}

        {/* Connector tier2 → tier3 */}
        {tier2.length > 0 && tier3.length > 0 && (
          <View style={[styles.tierConnector, {
            backgroundColor: `${branchColor}30`,
            shadowColor: branchColor,
            shadowOpacity: 0.3,
            shadowRadius: 5,
          }]} />
        )}

        {/* Tier 3 — Advanced (bottom, locked until lower tiers done) */}
        {tier3.length > 0 && (
          <View style={styles.tierSection}>
            <Text style={[styles.tierLabel, { color: branchColor, opacity: 0.6 }]}>{TIER_LABELS[3]}</Text>
            <View style={[styles.connectorLine, {
              backgroundColor: `${branchColor}35`,
              shadowColor: branchColor,
              shadowOpacity: 0.25,
              shadowRadius: 4,
            }]} />
            <View style={styles.nodesRow}>
              {tier3.map((node) => (
                <NodeCircle key={node.node_id} node={node} branchColor={branchColor} onPress={handleNodePress} />
              ))}
            </View>
          </View>
        )}

        {/* Today's Quest Banner */}
        <View style={[styles.questBanner, {
          backgroundColor: `${branchColor}E6`,
          shadowColor: branchColor,
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 6,
        }]}>
          <Text style={styles.questBannerText}>
            ✦ Nhiệm vụ hôm nay:{' '}
            {todayBannerQuest?.title ?? 'Không có nhiệm vụ mới'}
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Node Detail Bottom Sheet ─────────────────────── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.sheetContent}>
            <View style={styles.sheetHeader}>
              <View style={[styles.sheetIcon, { backgroundColor: `${branchColor}20` }]}>
                <Ionicons 
                  name={selectedNode?.branch === 'career' ? 'briefcase' : 
                        selectedNode?.branch === 'finance' ? 'cash' : 
                        selectedNode?.branch === 'softskills' ? 'chatbubbles' : 'leaf'} 
                  size={24} 
                  color={branchColor} 
                />
              </View>
              <View style={styles.sheetHeaderText}>
                <Text style={styles.sheetTitle}>{selectedNode?.title}</Text>
                <Text style={[styles.sheetBranch, { color: branchColor }]}>
                  {activeBranch.toUpperCase()} · CẤP {selectedNode?.tier}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.sheetDescription}>
              {selectedNode?.description ?? 'Nâng cao kỹ năng của bạn với các nhiệm vụ thực tế và nhận phần thưởng XP tương xứng.'}
            </Text>

            <View style={styles.sheetStats}>
              <View style={styles.sheetStatItem}>
                <Text style={styles.sheetStatLabel}>XP YÊU CẦU</Text>
                <Text style={styles.sheetStatValue}>{selectedNode?.xp_required ?? 100} XP</Text>
              </View>
              <View style={styles.sheetStatItem}>
                <Text style={styles.sheetStatLabel}>TIẾN ĐỘ</Text>
                <Text style={styles.sheetStatValue}>
                  {selectedNode?.quests_completed}/{selectedNode?.quests_total} Nhiệm vụ
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[
                styles.sheetButton, 
                { backgroundColor: selectedNode?.status === 'locked' ? colors.bgElevated : branchColor }
              ]}
              disabled={selectedNode?.status === 'locked'}
              onPress={() => {
                setModalVisible(false);
                // In a real app, we might check if this node has specific quests
                router.push('/(tabs)/quests');
              }}
            >
              <Text style={styles.sheetButtonText}>
                {selectedNode?.status === 'locked' ? 'Chưa đủ điều kiện unlock' : 'Bắt đầu ngay'}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgBase,
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
    color: colors.textPrimary,
  },
  headerSub: {
    fontSize: 12,
    color: colors.textMuted,
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
    backgroundColor: colors.bgSurface,
    borderRadius: 12,
    padding: 16,
  },
  branchCardLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  branchCardName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 4,
  },
  branchCardTier: {
    fontSize: 12,
    color: colors.textSecondary,
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
    color: colors.textSecondary,
    flexShrink: 0,
  },
  branchProgressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.bgElevated,
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
    color: colors.textMuted,
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
    width: 3,
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
    backgroundColor: colors.bgSurface,
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
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 14,
  },

  // Today's Quest Banner
  questBanner: {
    marginTop: 24,
    marginHorizontal: 0,
    width: '100%',
    backgroundColor: `${colors.brandPrimary}E6`,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  questBannerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Modal / Bottom Sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContent: {
    backgroundColor: colors.bgSurface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    minHeight: 350,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  sheetIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetHeaderText: {
    flex: 1,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sheetBranch: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  sheetDescription: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  sheetStats: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 32,
  },
  sheetStatItem: {
    gap: 4,
  },
  sheetStatLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 1,
  },
  sheetStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sheetButton: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  sheetButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
