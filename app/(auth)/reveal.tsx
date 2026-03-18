import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useOnboardingStore } from '@/src/business-logic/stores/onboardingStore';
import { useTheme } from '@/src/ui/tokens';
import type { Branch } from '@/src/business-logic/types';


// ─── Branch pill config ──────────────────────────────────────────────────────

interface BranchPillData {
  branch: Branch;
  label: string;
  emoji: string;
  color: string;
}

const getBranchPills = (colors: any): BranchPillData[] => [
  { branch: 'career', label: 'Career', emoji: '📘', color: colors.career },
  { branch: 'finance', label: 'Finance', emoji: '💰', color: colors.finance },
  { branch: 'softskills', label: 'Soft Skills', emoji: '🎯', color: colors.softskills },
  { branch: 'wellbeing', label: 'Well-being', emoji: '💚', color: colors.wellbeing },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function RevealScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const BRANCH_PILLS = useMemo(() => getBranchPills(colors), [colors]);
  const treeConfig = useOnboardingStore((s) => s.treeConfig);
  const primaryBranch: Branch = treeConfig?.primaryBranch ?? 'career';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ── Header ─────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Subtitle ─────────────────────────────────────── */}
        <Text style={styles.journeyLabel}>New Journey</Text>
        <Text style={styles.mainTitle}>Your Skill Tree is ready!</Text>
        <Text style={styles.mainSubtitle}>
          Your personal growth map has been set up just for you.
        </Text>

        {/* ── Sprout ───────────────────────────────────────── */}
        <Text style={styles.sproutEmoji}>🌱</Text>

        {/* ── Tree illustration card ────────────────────────── */}
        <View style={styles.treeCard}>
          <View style={styles.treeGlow} />
          <Text style={styles.treeEmoji}>🌳</Text>
        </View>

        {/* ── Branch pills label ────────────────────────────── */}
        <Text style={styles.branchesLabel}>SKILL BRANCHES</Text>

        {/* ── Branch pills ─────────────────────────────────── */}
        <View style={styles.pillsContainer}>
          {BRANCH_PILLS.map((pill) => (
            <View
              key={pill.branch}
              style={[
                styles.pill,
                { backgroundColor: `${pill.color}26` },
                pill.branch === primaryBranch && {
                  borderWidth: 1,
                  borderColor: `${pill.color}60`,
                },
              ]}
            >
              <Text style={styles.pillEmoji}>{pill.emoji}</Text>
              <Text style={[styles.pillText, { color: pill.color }]}>
                {pill.label}
              </Text>
            </View>
          ))}
        </View>

        {/* ── CTA Button ───────────────────────────────────── */}
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaBtnText}>Let's start your first quest →</Text>
        </TouchableOpacity>

        {/* ── Footer label ─────────────────────────────────── */}
        <Text style={styles.footerLabel}>
          Ready to unlock Gen Z potential
        </Text>

        <View style={{ height: 32 }} />
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

  // Header
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  // Labels
  journeyLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: 8,
  },
  mainSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  sproutEmoji: {
    fontSize: 32,
    marginTop: 16,
    textAlign: 'center',
  },

  // Tree card
  treeCard: {
    width: '100%',
    height: 200,
    backgroundColor: colors.bgSurface,
    borderRadius: 16,
    marginTop: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  treeGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(124,106,247,0.15)',
  },
  treeEmoji: {
    fontSize: 80,
  },

  // Branches label
  branchesLabel: {
    fontSize: 11,
    fontFamily: 'SpaceGrotesk-SemiBold', fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 24,
  },

  // Branch pills
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    width: '100%',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    gap: 6,
  },
  pillEmoji: {
    fontSize: 16,
  },
  pillText: {
    fontSize: 13,
    fontFamily: 'SpaceGrotesk-SemiBold', fontWeight: '600',
  },

  // CTA
  ctaBtn: {
    width: '100%',
    backgroundColor: colors.brandPrimary,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    shadowColor: colors.brandPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaBtnText: {
    fontSize: 16,
    fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700',
    color: '#FFFFFF',
  },

  // Footer label
  footerLabel: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
  },
});
