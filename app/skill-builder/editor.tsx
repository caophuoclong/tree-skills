import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Branch } from '@/src/business-logic/types';
import { useTheme } from '@/src/ui/tokens';
import { SkillBuilderClusterCard } from '@/src/ui/organisms/SkillBuilderClusterCard';
import { useSkillBuilderEditor } from '@/src/hooks/useSkillBuilderEditor';

const BRANCH_CONFIG: Record<Branch, { label: string; color: string; emoji: string }> = {
  career: { label: 'Sự nghiệp', color: '#7C6AF7', emoji: '💼' },
  finance: { label: 'Tài chính', color: '#22C55E', emoji: '💰' },
  softskills: { label: 'Kỹ năng mềm', color: '#F59E0B', emoji: '💬' },
  wellbeing: { label: 'Sức khỏe', color: '#EC4899', emoji: '🧘' },
};

export default function EditorScreen() {
  const { colors } = useTheme();
  const {
    currentDraft,
    addCluster,
    removeCluster,
    discardDraft,
    handleConfirmDraft,
    getTotalSkills,
    getTotalQuests,
  } = useSkillBuilderEditor();

  if (!currentDraft) {
    router.replace('/skill-builder');
    return null;
  }

  const totalSkills = getTotalSkills();
  const totalQuests = getTotalQuests();

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
            handleConfirmDraft(() => router.replace('/(tabs)/tree'));
          },
        },
      ],
    );
  };

  const handleDiscard = () => {
    Alert.alert('Huỷ bỏ lộ trình?', 'Lộ trình chưa lưu sẽ bị xoá.', [
      { text: 'Tiếp tục', style: 'cancel' },
      {
        text: 'Huỷ bỏ',
        style: 'destructive',
        onPress: () => {
          discardDraft();
          router.replace('/(tabs)/tree');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgBase }]} edges={['top']}>
      <View style={[styles.editorHeader, { borderBottomColor: colors.glassBorder }]}>
        <TouchableOpacity onPress={handleDiscard}>
          <Text style={[styles.headerAction, { color: colors.textMuted }]}>Huỷ</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={[styles.editorHeaderTitle, { color: colors.textPrimary }]}>Chỉnh sửa lộ trình</Text>
          <Text style={[styles.editorHeaderSub, { color: colors.textMuted }]} numberOfLines={1}>
            {currentDraft.goal}
          </Text>
        </View>
        <TouchableOpacity onPress={handleConfirm} disabled={totalSkills === 0}>
          <Text
            style={[
              styles.headerAction,
              { color: totalSkills > 0 ? colors.brandPrimary : colors.textMuted, fontWeight: '800' },
            ]}
          >
            Lưu
          </Text>
        </TouchableOpacity>
      </View>

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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 8, gap: 5 }}
        >
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

      <View style={[styles.hintRow, { backgroundColor: `${colors.brandPrimary}10` }]}>
        <Ionicons name="information-circle-outline" size={13} color={colors.brandPrimary} />
        <Text style={[styles.hintText, { color: colors.textMuted }]}>
          Tap tên để sửa · Tap <Text style={{ color: colors.brandPrimary }}>☰</Text> để mở/sửa nhiệm vụ · Tap
          badge khó/thời gian để đổi
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {currentDraft.clusters.map((cluster) => (
          <SkillBuilderClusterCard
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
          <TouchableOpacity
            onPress={handleConfirm}
            style={[styles.confirmBtn, { backgroundColor: colors.brandPrimary }]}
            activeOpacity={0.85}
          >
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

const styles = StyleSheet.create({
  safe: { flex: 1 },

  editorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  headerAction: { fontSize: 15, fontFamily: 'SpaceGrotesk-SemiBold', fontWeight: '600', minWidth: 44, textAlign: 'center' },
  editorHeaderTitle: { fontSize: 15, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700' },
  editorHeaderSub: { fontSize: 11, marginTop: 1 },

  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    gap: 4,
  },
  statItem: { alignItems: 'center', paddingHorizontal: 8 },
  statNum: { fontSize: 16, fontWeight: '800' },
  statLbl: { fontSize: 9, fontFamily: 'SpaceGrotesk-SemiBold', fontWeight: '600', letterSpacing: 0.5 },
  statDivider: { width: 1, height: 28, marginHorizontal: 2 },
  miniChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  miniChipCount: { fontSize: 11, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700' },

  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 10,
  },
  hintText: { fontSize: 11, flex: 1, lineHeight: 16 },

  scrollContent: { padding: 16, paddingBottom: 80, gap: 12 },

  addClusterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  addClusterText: { fontSize: 14, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700' },

  confirmBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18, borderRadius: 28, marginTop: 4 },
  confirmBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
