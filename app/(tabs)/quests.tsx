import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useQuestManager } from '@/src/business-logic/hooks/useQuestManager';
import { useStaminaSystem } from '@/src/business-logic/hooks/useStaminaSystem';
import { getComboMultiplier } from '@/src/business-logic/hooks/useXPEngine';
import { useUserStore } from '@/src/business-logic/stores/userStore';
import { useTheme } from '@/src/ui/tokens';
import type { Quest } from '@/src/business-logic/types';


// ─── Branch helpers ───────────────────────────────────────────────────────────

const getBranchColors = (colors: any): Record<string, string> => ({
  career: colors.career,
  finance: colors.finance,
  softskills: colors.softskills,
  wellbeing: colors.wellbeing,
});

const BRANCH_LABELS: Record<string, string> = {
  career: 'SỰ NGHIỆP',
  finance: 'TÀI CHÍNH',
  softskills: 'KỸ NĂNG MỀM',
  wellbeing: 'SỨC KHỎE',
};

// ─── Quest Card ───────────────────────────────────────────────────────────────

interface QuestItemProps {
  quest: Quest;
  onComplete: (id: string) => void;
}

function QuestItem({ quest, onComplete }: QuestItemProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const BRANCH_COLORS = useMemo(() => getBranchColors(colors), [colors]);
  const branchColor = BRANCH_COLORS[quest.branch] ?? colors.brandPrimary;
  const isCompleted = quest.completed_at !== null;

  return (
    <TouchableOpacity
      style={[
        styles.questCard,
        { borderColor: `${branchColor}40`, opacity: isCompleted ? 0.6 : 1 },
      ]}
      onPress={() => router.push(`/quest/${quest.quest_id}`)}
      activeOpacity={0.85}
    >
      <View style={[styles.accentBar, { backgroundColor: branchColor }]} />
      {/* Top row */}
      <View style={styles.questCardTop}>
        <View style={styles.questCardTopLeft}>
          <View
            style={[
              styles.branchChip,
              { backgroundColor: `${branchColor}26` },
            ]}
          >
            <Text style={[styles.branchChipText, { color: branchColor }]}>
              {BRANCH_LABELS[quest.branch] ?? quest.branch}
            </Text>
          </View>
          <Text style={styles.durationText}>· {quest.duration_min} PHÚT</Text>
        </View>
        {isCompleted ? (
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={colors.brandPrimary}
          />
        ) : (
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => onComplete(quest.quest_id)}
            hitSlop={8}
          />
        )}
      </View>

      {/* Title */}
      <Text
        style={[
          styles.questTitle,
          isCompleted && styles.questTitleDone,
        ]}
      >
        {quest.title}
      </Text>

      {/* XP Badge */}
      <View style={styles.xpBadge}>
        <Text style={styles.xpBadgeText}>+{quest.xp_reward} XP</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function QuestsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { quests, completedCount, totalCount, completeQuest } = useQuestManager();
  const { stamina } = useStaminaSystem();
  const { dailyStats } = useUserStore();
  const combo = dailyStats.session_combo;
  const multiplier = getComboMultiplier(combo);
  const comboActive = combo >= 3;

  const handleComplete = useCallback(
    (questId: string) => {
      completeQuest(questId);
    },
    [completeQuest],
  );

  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Nhiệm vụ hôm nay</Text>
          <View style={styles.staminaRow}>
            <Text style={styles.staminaIcon}>⚡</Text>
            <View style={styles.staminaBarTrack}>
              <View
                style={[
                  styles.staminaBarFill,
                  { width: `${stamina}%` as any },
                ]}
              />
            </View>
            <Text style={styles.staminaText}>{stamina}%</Text>
          </View>
        </View>

        {/* ── Progress row ───────────────────────────────────── */}
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Tiến độ hoàn thành</Text>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressPercent}%` as any },
              ]}
            />
          </View>
          <View style={styles.completePill}>
            <Text style={styles.completePillText}>
              XONG {completedCount}/{totalCount}
            </Text>
          </View>
        </View>

        {/* ── Combo Banner ───────────────────────────────────── */}
        {comboActive && (
          <View style={[styles.comboBanner, {
            borderColor: combo >= 5 ? `${colors.softskills}60` : `${colors.career}60`,
            shadowColor: combo >= 5 ? colors.softskills : colors.career,
          }]}>
            <Text style={styles.comboFire}>
              {combo >= 5 ? '🔥🔥🔥' : combo >= 4 ? '🔥🔥' : '🔥'}
            </Text>
            <View style={styles.comboTextGroup}>
              <Text style={styles.comboLabel}>COMBO ĐANG HOẠT ĐỘNG</Text>
              <Text style={styles.comboValue}>
                {combo} quest liên tiếp · XP x{multiplier.toFixed(2)}
              </Text>
            </View>
            <View style={[styles.comboMultiplierPill, {
              backgroundColor: combo >= 5 ? `${colors.softskills}25` : `${colors.career}25`,
            }]}>
              <Text style={[styles.comboMultiplierText, {
                color: combo >= 5 ? colors.softskills : colors.career,
              }]}>
                x{multiplier.toFixed(2)}
              </Text>
            </View>
          </View>
        )}

        {/* ── Quest Cards ────────────────────────────────────── */}
        <View style={styles.questList}>
          {quests.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🌱</Text>
              <Text style={styles.emptyText}>
                Chưa có nhiệm vụ nào. Hãy hoàn thành onboarding để bắt đầu!
              </Text>
            </View>
          ) : (
            quests.map((quest) => (
              <QuestItem
                key={quest.quest_id}
                quest={quest}
                onComplete={handleComplete}
              />
            ))
          )}
        </View>

        {/* ── Active Challenges ──────────────────────────────── */}
        <View style={styles.challengesSection}>
          <View style={styles.challengesHeader}>
            <Text style={styles.challengesTrophyEmoji}>🏆</Text>
            <Text style={styles.challengesTitle}>Thử thách đang chạy</Text>
          </View>

          <View style={[styles.challengeCard, { borderColor: `${colors.wellbeing}40` }]}>
            <View style={[styles.accentBar, { backgroundColor: colors.wellbeing }]} />
            <View style={styles.challengeCardMain}>
              <View style={styles.challengeTag}>
                <Text style={styles.challengeTagText}>SỰ KIỆN CÓ HẠN</Text>
              </View>
              <Text style={styles.challengeTitle}>7 Ngày Kỷ luật Thép</Text>
              <View style={styles.challengeStats}>
                <Ionicons name="people-outline" size={14} color={colors.textMuted} />
                <Text style={styles.challengeSubtitle}>
                  2.4k người đang tham gia
                </Text>
              </View>
            </View>
            
            <View style={styles.challengeProgressWrapper}>
              <View style={styles.challengeProgressHeader}>
                <Text style={styles.challengeProgressLabel}>Ngày 3/7</Text>
                <View style={styles.challengeRewards}>
                  <Ionicons name="gift-outline" size={14} color={colors.softskills} />
                  <Text style={styles.challengeRewardText}>+500 XP</Text>
                </View>
              </View>
              <View style={styles.challengeProgressBarTrack}>
                <View style={[styles.challengeProgressBarFill, { width: '42%' }]} />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  staminaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  staminaIcon: {
    fontSize: 13,
  },
  staminaBarTrack: {
    width: 52,
    height: 4,
    backgroundColor: colors.bgElevated,
    borderRadius: 2,
    overflow: 'hidden',
  },
  staminaBarFill: {
    height: 4,
    backgroundColor: colors.finance,
    borderRadius: 2,
  },
  staminaText: {
    fontSize: 11,
    color: colors.finance,
    fontWeight: '600',
    minWidth: 30,
  },

  // Progress row
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  progressLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    flexShrink: 0,
  },
  progressBarTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.bgElevated,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 4,
    backgroundColor: colors.brandPrimary,
    borderRadius: 2,
  },
  completePill: {
    backgroundColor: 'rgba(124,106,247,0.15)',
    borderWidth: 1,
    borderColor: colors.brandPrimary,
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  completePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.brandPrimary,
  },

  // Combo Banner
  comboBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  comboFire: {
    fontSize: 22,
  },
  comboTextGroup: {
    flex: 1,
    gap: 2,
  },
  comboLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.5,
  },
  comboValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  comboMultiplierPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  comboMultiplierText: {
    fontSize: 16,
    fontWeight: '800',
  },

  // Quest List
  questList: {
    gap: 12,
  },
  questCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  questCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questCardTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  branchChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  branchChipText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  durationText: {
    fontSize: 10,
    color: colors.textMuted,
    marginLeft: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  questTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 8,
  },
  questTitleDone: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  xpBadge: {
    backgroundColor: 'rgba(251,191,36,0.15)',
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  xpBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.softskills,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  // Active Challenges
  challengesSection: {
    marginTop: 28,
  },
  challengesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  challengesTrophyEmoji: {
    fontSize: 20,
  },
  challengesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  challengeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    shadowColor: colors.brandPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  challengeCardMain: {
    marginBottom: 16,
  },
  challengeTag: {
    backgroundColor: 'rgba(244,114,182,0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  challengeTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.wellbeing,
    letterSpacing: 1.5,
  },
  challengeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  challengeStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  challengeSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
  },
  challengeProgressWrapper: {
    gap: 8,
  },
  challengeProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengeProgressLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  challengeRewards: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  challengeRewardText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.softskills,
  },
  challengeProgressBarTrack: {
    height: 6,
    backgroundColor: colors.bgElevated,
    borderRadius: 3,
    overflow: 'hidden',
  },
  challengeProgressBarFill: {
    height: 6,
    backgroundColor: colors.brandPrimary,
    borderRadius: 3,
  },

  // Bottom
  bottomSpacer: {
    height: 100,
  },
});
