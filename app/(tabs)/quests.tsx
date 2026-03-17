import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
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
import { Colors } from '@/src/ui/tokens/colors';
import type { Quest } from '@/src/business-logic/types';

// ─── Branch helpers ───────────────────────────────────────────────────────────

const BRANCH_COLORS: Record<string, string> = {
  career: Colors.career,
  finance: Colors.finance,
  softskills: Colors.softskills,
  wellbeing: Colors.wellbeing,
};

const BRANCH_LABELS: Record<string, string> = {
  career: 'CAREER',
  finance: 'FINANCE',
  softskills: 'SOFT SKILLS',
  wellbeing: 'WELLBEING',
};

// ─── Quest Card ───────────────────────────────────────────────────────────────

interface QuestItemProps {
  quest: Quest;
  onComplete: (id: string) => void;
}

function QuestItem({ quest, onComplete }: QuestItemProps) {
  const branchColor = BRANCH_COLORS[quest.branch] ?? Colors.brandPrimary;
  const isCompleted = quest.completed_at !== null;

  return (
    <TouchableOpacity
      style={[
        styles.questCard,
        { borderLeftColor: branchColor, opacity: isCompleted ? 0.6 : 1 },
      ]}
      onPress={() => router.push(`/quest/${quest.quest_id}`)}
      activeOpacity={0.85}
    >
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
          <Text style={styles.durationText}>· {quest.duration_min} MIN</Text>
        </View>
        {isCompleted ? (
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={Colors.brandPrimary}
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
  const { quests, completedCount, totalCount, completeQuest } = useQuestManager();
  const { stamina } = useStaminaSystem();

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
          <Text style={styles.headerTitle}>Today's Quests</Text>
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
          <Text style={styles.progressLabel}>Daily Completion</Text>
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
              {completedCount}/{totalCount} COMPLETE
            </Text>
          </View>
        </View>

        {/* ── Quest Cards ────────────────────────────────────── */}
        <View style={styles.questList}>
          {quests.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🌱</Text>
              <Text style={styles.emptyText}>
                No quests yet. Complete onboarding to get started!
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
            <Text style={styles.challengesTitle}>Active Challenges</Text>
          </View>

          <View style={styles.challengeCard}>
            <Text style={styles.challengeEventLabel}>LIMITED EVENT</Text>
            <Text style={styles.challengeTitle}>7 Days Hard Discipline</Text>
            <Text style={styles.challengeSubtitle}>
              Join 2.4k others in this sprint
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
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
    color: Colors.textPrimary,
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
    backgroundColor: Colors.bgElevated,
    borderRadius: 2,
    overflow: 'hidden',
  },
  staminaBarFill: {
    height: 4,
    backgroundColor: Colors.finance,
    borderRadius: 2,
  },
  staminaText: {
    fontSize: 11,
    color: Colors.finance,
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
    color: Colors.textSecondary,
    flexShrink: 0,
  },
  progressBarTrack: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.bgElevated,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 4,
    backgroundColor: Colors.brandPrimary,
    borderRadius: 2,
  },
  completePill: {
    backgroundColor: 'rgba(124,106,247,0.15)',
    borderWidth: 1,
    borderColor: Colors.brandPrimary,
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  completePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.brandPrimary,
  },

  // Quest List
  questList: {
    gap: 12,
  },
  questCard: {
    backgroundColor: Colors.bgSurface,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 3,
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
    color: Colors.textMuted,
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
    color: Colors.textPrimary,
    marginTop: 8,
  },
  questTitleDone: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
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
    color: Colors.softskills,
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
    color: Colors.textSecondary,
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
    color: Colors.textPrimary,
  },
  challengeCard: {
    backgroundColor: Colors.bgSurface,
    borderRadius: 16,
    height: 120,
    overflow: 'hidden',
    padding: 16,
    justifyContent: 'center',
  },
  challengeEventLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  challengeSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  // Bottom
  bottomSpacer: {
    height: 100,
  },
});
