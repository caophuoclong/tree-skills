import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
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
import { Colors } from '@/src/ui/tokens/colors';
import type { Quest } from '@/src/business-logic/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

const BRANCH_CATEGORY_LABELS: Record<string, string> = {
  career: 'Career Quest',
  finance: 'Finance Quest',
  softskills: 'Soft Skills Quest',
  wellbeing: 'Wellbeing Quest',
};

const WHY_TEXT: Record<string, string> = {
  career:
    'Building professional connections is one of the highest ROI activities for career growth. Most opportunities come through people you know, not job boards.',
  finance:
    'Financial habits compound over time. Small consistent actions today create the freedom to make bigger choices tomorrow.',
  softskills:
    'Communication skills are the multiplier for all other skills. Improving how you connect with others unlocks exponential growth.',
  wellbeing:
    'Your mental and physical state directly affects every other area of your life. Investing in wellbeing is investing in your overall performance.',
};

const RESOURCES: Record<string, { label: string; url: string }[]> = {
  career: [
    { label: 'LinkedIn Networking Guide', url: 'linkedin.com/learning' },
    { label: 'Cold Email Templates', url: 'resources.io/templates' },
  ],
  finance: [
    { label: 'Budgeting 101', url: 'investopedia.com/budgeting' },
    { label: 'Emergency Fund Calculator', url: 'nerdwallet.com/calculator' },
  ],
  softskills: [
    { label: 'Active Listening Techniques', url: 'mindtools.com/listening' },
    { label: 'Public Speaking Guide', url: 'toastmasters.org' },
  ],
  wellbeing: [
    { label: 'Mindfulness Starter Guide', url: 'headspace.com/mindfulness' },
    { label: 'Stress Management Toolkit', url: 'mentalhealth.org/tools' },
  ],
};

function parseSteps(description: string): string[] {
  const sentences = description
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return sentences.length > 0 ? sentences : [description];
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function QuestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { quests, completeQuest } = useQuestManager();

  const quest: Quest | undefined = quests.find((q) => q.quest_id === id);

  const isCompleted = quest ? quest.completed_at !== null : false;
  const branchColor =
    quest ? (BRANCH_COLORS[quest.branch] ?? Colors.brandPrimary) : Colors.brandPrimary;

  const handleComplete = useCallback(() => {
    if (!quest || isCompleted) return;
    completeQuest(quest.quest_id);
    setTimeout(() => router.back(), 600);
  }, [quest, isCompleted, completeQuest]);

  if (!quest) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Quest not found.</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const steps = parseSteps(quest.description);
  const resources = RESOURCES[quest.branch] ?? [];
  const whyText = WHY_TEXT[quest.branch] ?? quest.description;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ── Header ─────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerBranchLabel, { color: branchColor }]}>
          {BRANCH_CATEGORY_LABELS[quest.branch] ?? 'Quest'}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Title card ─────────────────────────────────────── */}
        <View style={styles.titleCard}>
          <Text style={styles.questTitle}>{quest.title}</Text>
          <View style={styles.tagsRow}>
            <View
              style={[
                styles.tagChip,
                { backgroundColor: `${branchColor}26` },
              ]}
            >
              <Text style={[styles.tagText, { color: branchColor }]}>
                {BRANCH_LABELS[quest.branch] ?? quest.branch}
              </Text>
            </View>
            <View style={styles.tagChipNeutral}>
              <Text style={styles.tagTextNeutral}>{quest.duration_min} MIN</Text>
            </View>
            <View style={styles.tagChipXP}>
              <Ionicons name="flash" size={10} color={Colors.softskills} />
              <Text style={styles.tagTextXP}>+{quest.xp_reward} XP</Text>
            </View>
          </View>
        </View>

        {/* ── Why This Matters ──────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>WHY THIS MATTERS</Text>
          <Text style={styles.sectionBody}>{whyText}</Text>
        </View>

        {/* ── How to Complete ───────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>HOW TO COMPLETE</Text>
          <View style={styles.stepsContainer}>
            {steps.map((step, index) => (
              <View key={index} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Resources ────────────────────────────────────── */}
        {resources.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>RESOURCES</Text>
            {resources.map((resource, index) => (
              <View
                key={index}
                style={[
                  styles.resourceRow,
                  index < resources.length - 1 && styles.resourceRowBorder,
                ]}
              >
                <Ionicons
                  name="link-outline"
                  size={16}
                  color={Colors.brandPrimary}
                />
                <Text style={styles.resourceText}>{resource.label}</Text>
                <Ionicons
                  name="open-outline"
                  size={14}
                  color={Colors.textMuted}
                />
              </View>
            ))}
          </View>
        )}

        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* ── Footer ───────────────────────────────────────── */}
      <View style={styles.footer}>
        <Text style={styles.footerNote}>
          ⚡ No Stamina cost · Pure XP gain
        </Text>
        {isCompleted ? (
          <View style={styles.completedBtn}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.finance} />
            <Text style={styles.completedBtnText}>Completed</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.completeBtn}
            onPress={handleComplete}
            activeOpacity={0.85}
          >
            <Text style={styles.completeBtnText}>Mark as Complete</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.skipText}>Skip for today</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },

  // Not found
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  notFoundText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  backBtn: {
    padding: 8,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  backButton: {
    marginRight: 4,
  },
  headerBranchLabel: {
    fontSize: 16,
    fontWeight: '600',
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  // Title card
  titleCard: {
    backgroundColor: Colors.bgSurface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 0,
  },
  questTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  tagChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tagChipNeutral: {
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  tagTextNeutral: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  tagChipXP: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(251,191,36,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  tagTextXP: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.softskills,
  },

  // Sections
  section: {
    marginTop: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  // Steps
  stepsContainer: {
    gap: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.brandPrimary,
  },
  stepText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 20,
    paddingTop: 2,
  },

  // Resources
  resourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  resourceRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  resourceText: {
    fontSize: 14,
    color: Colors.textPrimary,
    flex: 1,
  },

  // Footer spacer
  footerSpacer: {
    height: 20,
  },

  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
    backgroundColor: Colors.bgBase,
  },
  footerNote: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 16,
  },
  completeBtn: {
    backgroundColor: Colors.brandPrimary,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  completedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    gap: 8,
    backgroundColor: `${Colors.finance}1A`,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: `${Colors.finance}33`,
  },
  completedBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.finance,
  },
  skipText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
  },
});
