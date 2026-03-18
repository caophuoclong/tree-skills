import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCustomSkillTreeStore } from '@/src/business-logic/stores/customSkillTreeStore';
import { useSkillTreeStore } from '@/src/business-logic/stores/skillTreeStore';
import type { Branch, CustomCluster, CustomQuest, CustomSkillItem, Difficulty, QuestDuration } from '@/src/business-logic/types';
import { useTheme } from '@/src/ui/tokens';

// ─── Config ────────────────────────────────────────────────────────────────────
const BRANCH_CONFIG: Record<Branch, { label: string; color: string; emoji: string }> = {
  career:     { label: 'Sự nghiệp',    color: '#7C6AF7', emoji: '💼' },
  finance:    { label: 'Tài chính',    color: '#22C55E', emoji: '💰' },
  softskills: { label: 'Kỹ năng mềm', color: '#F59E0B', emoji: '💬' },
  wellbeing:  { label: 'Sức khỏe',    color: '#EC4899', emoji: '🧘' },
};
const BRANCHES = Object.keys(BRANCH_CONFIG) as Branch[];

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; color: string }> = {
  easy:   { label: 'Dễ',        color: '#22C55E' },
  medium: { label: 'TB',        color: '#F59E0B' },
  hard:   { label: 'Khó',       color: '#EF4444' },
};
const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

const DURATIONS: QuestDuration[] = [5, 15, 30];

// ─── Branch picker ─────────────────────────────────────────────────────────────
function BranchPicker({ value, onChange }: { value: Branch; onChange: (b: Branch) => void }) {
  const { colors } = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', gap: 6, paddingBottom: 2, paddingHorizontal: 1 }}>
        {BRANCHES.map((b) => {
          const cfg = BRANCH_CONFIG[b];
          const active = value === b;
          return (
            <TouchableOpacity
              key={b}
              onPress={() => onChange(b)}
              style={[
                styles.branchPill,
                {
                  backgroundColor: active ? `${cfg.color}22` : colors.bgElevated,
                  borderColor: active ? `${cfg.color}70` : 'transparent',
                },
              ]}
            >
              <Text>{cfg.emoji}</Text>
              <Text style={[styles.branchPillLabel, { color: active ? cfg.color : colors.textMuted }]}>
                {cfg.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

// ─── Quest row ─────────────────────────────────────────────────────────────────
function QuestRow({
  quest,
  clusterId,
  skillId,
  canDelete,
}: {
  quest: CustomQuest;
  clusterId: string;
  skillId: string;
  canDelete: boolean;
}) {
  const { colors } = useTheme();
  const { updateQuest, removeQuest } = useCustomSkillTreeStore();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(quest.title);
  const diffCfg = DIFFICULTY_CONFIG[quest.difficulty];

  const commitTitle = () => {
    if (draft.trim()) updateQuest(clusterId, skillId, quest.id, { title: draft.trim() });
    else setDraft(quest.title);
    setEditing(false);
  };

  const cycleDifficulty = () => {
    const idx = DIFFICULTIES.indexOf(quest.difficulty);
    updateQuest(clusterId, skillId, quest.id, { difficulty: DIFFICULTIES[(idx + 1) % 3] });
  };

  const cycleDuration = () => {
    const idx = DURATIONS.indexOf(quest.duration_min);
    updateQuest(clusterId, skillId, quest.id, { duration_min: DURATIONS[(idx + 1) % 3] });
  };

  return (
    <View style={[styles.questRow, { borderColor: colors.glassBorder }]}>
      {/* Difficulty badge — tap to cycle */}
      <TouchableOpacity
        onPress={cycleDifficulty}
        style={[styles.questDiffBadge, { backgroundColor: `${diffCfg.color}22`, borderColor: `${diffCfg.color}60` }]}
      >
        <Text style={[styles.questDiffText, { color: diffCfg.color }]}>{diffCfg.label}</Text>
      </TouchableOpacity>

      {/* Title */}
      <View style={{ flex: 1 }}>
        {editing ? (
          <TextInput
            autoFocus
            value={draft}
            onChangeText={setDraft}
            onBlur={commitTitle}
            onSubmitEditing={commitTitle}
            style={[styles.questTitleInput, { color: colors.textPrimary, borderColor: colors.brandPrimary }]}
            returnKeyType="done"
          />
        ) : (
          <Pressable onPress={() => setEditing(true)}>
            <Text style={[styles.questTitle, { color: colors.textPrimary }]} numberOfLines={2}>
              {quest.title}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Duration chip — tap to cycle */}
      <TouchableOpacity
        onPress={cycleDuration}
        style={[styles.questDurBadge, { backgroundColor: colors.bgElevated }]}
      >
        <Ionicons name="time-outline" size={10} color={colors.textMuted} />
        <Text style={[styles.questDurText, { color: colors.textMuted }]}>{quest.duration_min}p</Text>
      </TouchableOpacity>

      {/* Delete */}
      {canDelete && (
        <TouchableOpacity onPress={() => removeQuest(clusterId, skillId, quest.id)} hitSlop={8}>
          <Ionicons name="close" size={13} color={colors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Skill row ─────────────────────────────────────────────────────────────────
function SkillRow({
  skill,
  clusterId,
  idx,
  total,
  branchColor,
}: {
  skill: CustomSkillItem;
  clusterId: string;
  idx: number;
  total: number;
  branchColor: string;
}) {
  const { colors } = useTheme();
  const { removeSkill, updateSkill, moveSkillUp, moveSkillDown, addQuest } = useCustomSkillTreeStore();
  const [expanded, setExpanded] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(skill.title);

  const commitTitle = () => {
    if (titleDraft.trim()) updateSkill(clusterId, skill.id, { title: titleDraft.trim() });
    else setTitleDraft(skill.title);
    setEditingTitle(false);
  };

  return (
    <View style={[styles.skillBlock, { borderColor: `${branchColor}20` }]}>
      {/* Skill header row */}
      <View style={styles.skillHeaderRow}>
        {/* Sort arrows */}
        <View style={styles.sortCol}>
          <TouchableOpacity onPress={() => moveSkillUp(clusterId, skill.id)} disabled={idx === 0} style={{ opacity: idx === 0 ? 0.2 : 0.7 }} hitSlop={6}>
            <Ionicons name="chevron-up" size={13} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => moveSkillDown(clusterId, skill.id)} disabled={idx === total - 1} style={{ opacity: idx === total - 1 ? 0.2 : 0.7 }} hitSlop={6}>
            <Ionicons name="chevron-down" size={13} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.bullet, { backgroundColor: `${branchColor}60` }]} />

        {/* Title */}
        <View style={{ flex: 1 }}>
          {editingTitle ? (
            <TextInput
              autoFocus value={titleDraft}
              onChangeText={setTitleDraft}
              onBlur={commitTitle}
              onSubmitEditing={commitTitle}
              style={[styles.skillTitleInput, { color: colors.textPrimary, borderColor: branchColor }]}
              returnKeyType="done"
            />
          ) : (
            <Pressable onPress={() => setEditingTitle(true)}>
              <Text style={[styles.skillTitle, { color: colors.textPrimary }]} numberOfLines={2}>{skill.title}</Text>
              <Text style={[styles.skillMeta, { color: colors.textMuted }]}>
                {skill.duration_weeks === 1 ? '1 tuần' : '2 tuần'} · {skill.quests.length} nhiệm vụ
              </Text>
            </Pressable>
          )}
        </View>

        {/* Expand quests */}
        <TouchableOpacity
          onPress={() => setExpanded((v) => !v)}
          style={[styles.expandBtn, { borderColor: `${branchColor}40` }]}
          hitSlop={6}
        >
          <Ionicons name={expanded ? 'chevron-up' : 'list-outline'} size={13} color={branchColor} />
        </TouchableOpacity>

        {/* Delete skill */}
        <TouchableOpacity onPress={() => removeSkill(clusterId, skill.id)} hitSlop={8}>
          <Ionicons name="close" size={15} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Quest sub-list — expandable */}
      {expanded && (
        <View style={[styles.questSubList, { borderColor: `${branchColor}15` }]}>
          <Text style={[styles.questSubHeader, { color: colors.textMuted }]}>NHIỆM VỤ</Text>
          {skill.quests.map((q) => (
            <QuestRow
              key={q.id}
              quest={q}
              clusterId={clusterId}
              skillId={skill.id}
              canDelete={skill.quests.length > 1}
            />
          ))}
          {skill.quests.length < 5 && (
            <TouchableOpacity
              onPress={() => addQuest(clusterId, skill.id)}
              style={[styles.addQuestBtn, { borderColor: `${branchColor}35` }]}
            >
              <Ionicons name="add" size={13} color={branchColor} />
              <Text style={[styles.addQuestText, { color: branchColor }]}>Thêm nhiệm vụ</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

// ─── Cluster card ──────────────────────────────────────────────────────────────
function ClusterCard({ cluster, onRemove }: { cluster: CustomCluster; onRemove: () => void }) {
  const { colors } = useTheme();
  const { addSkillToCluster, updateCluster } = useCustomSkillTreeStore();
  const [collapsed, setCollapsed] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(cluster.title);
  const cfg = BRANCH_CONFIG[cluster.branch];
  const branchColor = cfg.color;

  const commitTitle = () => {
    if (titleDraft.trim()) updateCluster(cluster.id, { title: titleDraft.trim() });
    else setTitleDraft(cluster.title);
    setEditingTitle(false);
  };

  const handleAddSkill = () => {
    const newSkill: CustomSkillItem = {
      id: Math.random().toString(36).slice(2, 10),
      title: 'Kỹ năng mới',
      description: '',
      branch: cluster.branch,
      duration_weeks: 1,
      quests: [
        { id: Math.random().toString(36).slice(2, 10), title: 'Nhiệm vụ 1', difficulty: 'easy', duration_min: 15 },
        { id: Math.random().toString(36).slice(2, 10), title: 'Nhiệm vụ 2', difficulty: 'medium', duration_min: 30 },
        { id: Math.random().toString(36).slice(2, 10), title: 'Nhiệm vụ 3', difficulty: 'hard', duration_min: 30 },
      ],
      status: 'locked',
    };
    addSkillToCluster(cluster.id, newSkill);
  };

  return (
    <View style={[styles.clusterCard, { backgroundColor: colors.bgSurface, borderColor: `${branchColor}30`, shadowColor: branchColor }]}>
      <View style={[styles.clusterAccent, { backgroundColor: branchColor }]} />

      {/* Cluster header */}
      <View style={styles.clusterHeader}>
        <TouchableOpacity onPress={() => setCollapsed((c) => !c)} style={styles.clusterHeaderInner}>
          <Text style={styles.clusterEmoji}>{cluster.emoji}</Text>
          <View style={{ flex: 1 }}>
            {editingTitle ? (
              <TextInput autoFocus value={titleDraft} onChangeText={setTitleDraft} onBlur={commitTitle} onSubmitEditing={commitTitle}
                style={[styles.clusterTitleInput, { color: colors.textPrimary }]} returnKeyType="done" />
            ) : (
              <Pressable onPress={() => setEditingTitle(true)}>
                <Text style={[styles.clusterTitle, { color: colors.textPrimary }]}>{cluster.title}</Text>
              </Pressable>
            )}
            <View style={[styles.branchBadge, { backgroundColor: `${branchColor}22`, borderColor: `${branchColor}50` }]}>
              <Text style={styles.branchBadgeEmoji}>{cfg.emoji}</Text>
              <Text style={[styles.branchBadgeLabel, { color: branchColor }]}>{cfg.label}</Text>
            </View>
          </View>
          <View style={styles.clusterHeaderRight}>
            <Text style={[styles.clusterCount, { color: colors.textMuted }]}>{cluster.skills.length} KN</Text>
            <Ionicons name={collapsed ? 'chevron-down' : 'chevron-up'} size={16} color={colors.textMuted} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={onRemove} style={styles.removeClusterBtn} hitSlop={8}>
          <Ionicons name="trash-outline" size={15} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {!collapsed && (
        <>
          {/* Branch picker */}
          <View style={{ paddingHorizontal: 14, paddingBottom: 6 }}>
            <Text style={[styles.sectionMicro, { color: colors.textMuted }]}>DANH MỤC</Text>
            <BranchPicker value={cluster.branch} onChange={(b) => updateCluster(cluster.id, { branch: b })} />
          </View>

          {/* Skills */}
          <View style={styles.skillsList}>
            {cluster.skills.length === 0 ? (
              <Text style={[styles.emptyHint, { color: colors.textMuted }]}>Chưa có kỹ năng nào</Text>
            ) : (
              cluster.skills.map((skill, idx) => (
                <SkillRow
                  key={skill.id}
                  skill={skill}
                  clusterId={cluster.id}
                  idx={idx}
                  total={cluster.skills.length}
                  branchColor={branchColor}
                />
              ))
            )}
            <TouchableOpacity
              onPress={handleAddSkill}
              style={[styles.addSkillBtn, { borderColor: `${branchColor}40` }]}
            >
              <Ionicons name="add" size={15} color={branchColor} />
              <Text style={[styles.addSkillText, { color: branchColor }]}>Thêm kỹ năng</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

// ─── Screen ────────────────────────────────────────────────────────────────────
export default function EditorScreen() {
  const { colors } = useTheme();
  const { currentDraft, addCluster, removeCluster, confirmDraft, discardDraft } = useCustomSkillTreeStore();
  const { nodes, setNodes } = useSkillTreeStore();

  if (!currentDraft) {
    router.replace('/skill-builder');
    return null;
  }

  const totalSkills = currentDraft.clusters.reduce((s, c) => s + c.skills.length, 0);
  const totalQuests = currentDraft.clusters.reduce((s, c) => s + c.skills.reduce((q, sk) => q + sk.quests.length, 0), 0);

  const handleAddCluster = () => {
    addCluster({
      id: Math.random().toString(36).slice(2, 10),
      title: 'Nhóm kỹ năng mới',
      branch: 'career',
      emoji: '📌',
      tier: 2,
      skills: [],
    });
  };

  const handleConfirm = () => {
    Alert.alert(
      'Thêm vào cây kỹ năng?',
      `${totalSkills} kỹ năng · ${totalQuests} nhiệm vụ sẽ được thêm vào hồ sơ của bạn.`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Thêm vào cây',
          onPress: () => {
            confirmDraft((_nodeIds, draft) => {
              const newNodes = draft.clusters.flatMap((cluster) =>
                cluster.skills.map((skill) => ({
                  node_id: `custom_${skill.id}`,
                  branch: skill.branch,
                  tier: cluster.tier,
                  title: skill.title,
                  description: skill.description || `Lộ trình: ${draft.goal}`,
                  status: 'locked' as const,
                  xp_required: skill.duration_weeks === 1 ? 50 : 100,
                  quests_total: skill.quests.length,
                  quests_completed: 0,
                })),
              );
              setNodes([...nodes, ...newNodes]);
            });
            router.replace('/(tabs)/tree');
          },
        },
      ],
    );
  };

  const handleDiscard = () => {
    Alert.alert('Huỷ bỏ lộ trình?', 'Lộ trình chưa lưu sẽ bị xoá.', [
      { text: 'Tiếp tục', style: 'cancel' },
      { text: 'Huỷ bỏ', style: 'destructive', onPress: () => { discardDraft(); router.replace('/(tabs)/tree'); } },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgBase }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.editorHeader, { borderBottomColor: colors.glassBorder }]}>
        <TouchableOpacity onPress={handleDiscard}>
          <Text style={[styles.headerAction, { color: colors.textMuted }]}>Huỷ</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={[styles.editorHeaderTitle, { color: colors.textPrimary }]}>Chỉnh sửa lộ trình</Text>
          <Text style={[styles.editorHeaderSub, { color: colors.textMuted }]} numberOfLines={1}>{currentDraft.goal}</Text>
        </View>
        <TouchableOpacity onPress={handleConfirm} disabled={totalSkills === 0}>
          <Text style={[styles.headerAction, { color: totalSkills > 0 ? colors.brandPrimary : colors.textMuted, fontWeight: '800' }]}>Lưu</Text>
        </TouchableOpacity>
      </View>

      {/* Stats strip */}
      <View style={[styles.statsStrip, { backgroundColor: colors.bgSurface }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: colors.textPrimary }]}>{currentDraft.clusters.length}</Text>
          <Text style={[styles.statLbl, { color: colors.textMuted }]}>Nhóm</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.glassBorder }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: colors.textPrimary }]}>{totalSkills}</Text>
          <Text style={[styles.statLbl, { color: colors.textMuted }]}>Kỹ năng</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.glassBorder }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: colors.textPrimary }]}>{totalQuests}</Text>
          <Text style={[styles.statLbl, { color: colors.textMuted }]}>Nhiệm vụ</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.glassBorder }]} />
        {/* Branch breakdown */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}
          contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 8, gap: 5 }}>
          {(Object.keys(BRANCH_CONFIG) as Branch[]).map((b) => {
            const count = currentDraft.clusters.filter((c) => c.branch === b).length;
            if (count === 0) return null;
            const cfg = BRANCH_CONFIG[b];
            return (
              <View key={b} style={[styles.miniChip, { backgroundColor: `${cfg.color}20`, borderColor: `${cfg.color}50` }]}>
                <Text style={{ fontSize: 11 }}>{cfg.emoji}</Text>
                <Text style={[styles.miniChipCount, { color: cfg.color }]}>{count}</Text>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* Hint */}
      <View style={[styles.hintRow, { backgroundColor: `${colors.brandPrimary}10` }]}>
        <Ionicons name="information-circle-outline" size={13} color={colors.brandPrimary} />
        <Text style={[styles.hintText, { color: colors.textMuted }]}>
          Tap tên để sửa · Tap{' '}
          <Text style={{ color: colors.brandPrimary }}>☰</Text>
          {' '}để mở/sửa nhiệm vụ · Tap badge khó/thời gian để đổi
        </Text>
      </View>

      {/* Cluster list */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {currentDraft.clusters.map((cluster) => (
          <ClusterCard
            key={cluster.id}
            cluster={cluster}
            onRemove={() =>
              Alert.alert('Xoá nhóm này?', `"${cluster.title}" và tất cả kỹ năng bên trong sẽ bị xoá.`, [
                { text: 'Huỷ', style: 'cancel' },
                { text: 'Xoá', style: 'destructive', onPress: () => removeCluster(cluster.id) },
              ])
            }
          />
        ))}

        <TouchableOpacity
          onPress={handleAddCluster}
          style={[styles.addClusterBtn, { backgroundColor: colors.bgSurface, borderColor: colors.glassBorder }]}
        >
          <Ionicons name="add-circle-outline" size={20} color={colors.brandPrimary} />
          <Text style={[styles.addClusterText, { color: colors.brandPrimary }]}>Thêm nhóm kỹ năng</Text>
        </TouchableOpacity>

        {totalSkills > 0 && (
          <TouchableOpacity onPress={handleConfirm} style={[styles.confirmBtn, { backgroundColor: colors.brandPrimary }]} activeOpacity={0.85}>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.confirmBtnText}>
              Thêm {totalSkills} kỹ năng · {totalQuests} nhiệm vụ vào cây
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1 },

  editorHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, gap: 8 },
  headerAction: { fontSize: 15, fontFamily: 'SpaceGrotesk-SemiBold', fontWeight: '600', minWidth: 44, textAlign: 'center' },
  editorHeaderTitle: { fontSize: 15, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700' },
  editorHeaderSub: { fontSize: 11, marginTop: 1 },

  statsStrip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, marginHorizontal: 16, marginTop: 10, borderRadius: 12, gap: 4 },
  statItem: { alignItems: 'center', paddingHorizontal: 8 },
  statNum: { fontSize: 16, fontWeight: '800' },
  statLbl: { fontSize: 9, fontFamily: 'SpaceGrotesk-SemiBold', fontWeight: '600', letterSpacing: 0.5 },
  statDivider: { width: 1, height: 28, marginHorizontal: 2 },
  miniChip: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10, borderWidth: 1 },
  miniChipCount: { fontSize: 11, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700' },

  hintRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, marginHorizontal: 16, marginTop: 8, borderRadius: 10 },
  hintText: { fontSize: 11, flex: 1, lineHeight: 16 },

  scrollContent: { padding: 16, paddingBottom: 80, gap: 12 },
  sectionMicro: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5, marginBottom: 4, marginTop: 10 },

  // Cluster
  clusterCard: { borderRadius: 16, borderWidth: 1.5, overflow: 'hidden', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 3 },
  clusterAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  clusterHeader: { flexDirection: 'row', alignItems: 'center', paddingLeft: 14, paddingRight: 10, paddingVertical: 12, gap: 6 },
  clusterHeaderInner: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  clusterEmoji: { fontSize: 22, width: 32, textAlign: 'center' },
  clusterTitle: { fontSize: 15, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', marginBottom: 4 },
  clusterTitleInput: { fontSize: 15, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', borderBottomWidth: 1.5, paddingVertical: 2, marginBottom: 4 },
  clusterHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  clusterCount: { fontSize: 11, fontFamily: 'SpaceGrotesk-SemiBold', fontWeight: '600' },
  removeClusterBtn: { padding: 4 },
  branchBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  branchBadgeEmoji: { fontSize: 10 },
  branchBadgeLabel: { fontSize: 10, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700' },
  branchPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1 },
  branchPillLabel: { fontSize: 12, fontFamily: 'SpaceGrotesk-SemiBold', fontWeight: '600' },

  // Skills
  skillsList: { paddingHorizontal: 14, paddingBottom: 12, gap: 2 },
  emptyHint: { fontSize: 12, textAlign: 'center', paddingVertical: 14, fontStyle: 'italic' },

  skillBlock: { borderBottomWidth: 1, paddingBottom: 6 },
  skillHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  sortCol: { alignItems: 'center', gap: 0 },
  bullet: { width: 7, height: 7, borderRadius: 3.5, flexShrink: 0 },
  skillTitle: { fontSize: 13, fontFamily: 'SpaceGrotesk-Medium', fontWeight: '500', lineHeight: 18 },
  skillMeta: { fontSize: 10, marginTop: 1 },
  skillTitleInput: { fontSize: 13, fontFamily: 'SpaceGrotesk-Medium', fontWeight: '500', borderBottomWidth: 1.5, paddingVertical: 2 },
  expandBtn: { padding: 5, borderRadius: 8, borderWidth: 1 },

  // Quest sub-list
  questSubList: { marginLeft: 30, marginBottom: 6, borderLeftWidth: 1, paddingLeft: 10, paddingTop: 4, gap: 4 },
  questSubHeader: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5, marginBottom: 4 },
  questRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 5, borderBottomWidth: StyleSheet.hairlineWidth },
  questDiffBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
  questDiffText: { fontSize: 9, fontWeight: '800' },
  questTitle: { fontSize: 12, lineHeight: 17 },
  questTitleInput: { fontSize: 12, borderBottomWidth: 1.5, paddingVertical: 1 },
  questDurBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8 },
  questDurText: { fontSize: 10, fontFamily: 'SpaceGrotesk-SemiBold', fontWeight: '600' },
  addQuestBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, borderWidth: 1, borderStyle: 'dashed', borderRadius: 6, justifyContent: 'center', marginTop: 4 },
  addQuestText: { fontSize: 11, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700' },

  // Add skill
  addSkillBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 4, marginTop: 4, borderWidth: 1, borderStyle: 'dashed', borderRadius: 8, justifyContent: 'center' },
  addSkillText: { fontSize: 12, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700' },

  // Add cluster
  addClusterBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed' },
  addClusterText: { fontSize: 14, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700' },

  // Confirm
  confirmBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18, borderRadius: 28, marginTop: 4 },
  confirmBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
