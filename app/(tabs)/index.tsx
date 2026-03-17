import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useQuestManager } from '@/src/business-logic/hooks/useQuestManager';
import { useGrowthStreak } from '@/src/business-logic/hooks/useGrowthStreak';
import { useStaminaSystem } from '@/src/business-logic/hooks/useStaminaSystem';
import { useSkillTreeStore } from '@/src/business-logic/stores/skillTreeStore';
import { useUserStore } from '@/src/business-logic/stores/userStore';
import { Colors } from '@/src/ui/tokens/colors';
import type { Branch } from '@/src/business-logic/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function useBranchProgress() {
  const { nodes } = useSkillTreeStore();
  const branches: Branch[] = ['career', 'finance', 'softskills', 'wellbeing'];
  return branches.map((branch) => {
    const branchNodes = nodes.filter((n) => n.branch === branch);
    if (branchNodes.length === 0) return { branch, percent: 0 };
    const completed = branchNodes.filter((n) => n.status === 'completed').length;
    return { branch, percent: Math.round((completed / branchNodes.length) * 100) };
  });
}

// ─── Progress Ring ────────────────────────────────────────────────────────────

interface ProgressRingProps {
  percent: number;
  color: string;
  label: string;
}

function ProgressRing({ percent, color, label }: ProgressRingProps) {
  return (
    <View style={styles.ringWrapper}>
      <View
        style={[
          styles.ring,
          {
            borderColor: color,
            shadowColor: color,
          },
        ]}
      >
        <Text style={[styles.ringPercent, { color }]}>{percent}%</Text>
      </View>
      <Text style={styles.ringLabel}>{label}</Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { user } = useUserStore();
  const { quests } = useQuestManager();
  const { streak } = useGrowthStreak();
  const { stamina } = useStaminaSystem();
  const branchProgress = useBranchProgress();

  const name = user?.name ?? 'Alex Kim';
  const level = user?.level ?? 4;
  const currentXP = user?.current_xp_in_level ?? 1240;
  const targetXP = user?.xp_to_next_level ?? 1500;
  const xpPercent = Math.round((currentXP / targetXP) * 100);
  const pendingCount = quests.filter((q) => q.completed_at === null).length;

  const careerPct = branchProgress.find((b) => b.branch === 'career')?.percent ?? 76;
  const financePct = branchProgress.find((b) => b.branch === 'finance')?.percent ?? 60;
  const softskillsPct = branchProgress.find((b) => b.branch === 'softskills')?.percent ?? 85;
  const wellbeingPct = branchProgress.find((b) => b.branch === 'wellbeing')?.percent ?? 40;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitials}>{getInitials(name)}</Text>
              </View>
              <View style={styles.avatarMeta}>
                <Text style={styles.levelLabel}>LEVEL {level}</Text>
                <Text style={styles.userName}>{name}</Text>
              </View>
            </View>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => {}}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications-outline" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => {}}
              activeOpacity={0.7}
            >
              <Ionicons name="settings-outline" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── LIFE SKILLS section ─────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>LIFE SKILLS</Text>

          <View style={styles.bentoRow}>
            {/* Left card: 2x2 progress rings */}
            <View style={[styles.bentoCard, styles.bentoCardLeft]}>
              <View style={styles.ringsGrid}>
                <ProgressRing percent={careerPct} color={Colors.career} label="Career" />
                <ProgressRing percent={financePct} color={Colors.finance} label="Finance" />
                <ProgressRing percent={softskillsPct} color={Colors.softskills} label="Skills" />
                <ProgressRing percent={wellbeingPct} color={Colors.wellbeing} label="Health" />
              </View>
            </View>

            {/* Right column */}
            <View style={styles.bentoRight}>
              {/* Streak card */}
              <View style={[styles.bentoCard, styles.bentoCardSmall]}>
                <Text style={styles.streakFire}>🔥</Text>
                <Text style={styles.streakNumber}>{streak || 12}</Text>
                <Text style={styles.streakLabel}>DAYS STREAK</Text>
              </View>

              {/* Mental Energy card */}
              <View style={[styles.bentoCard, styles.bentoCardSmall]}>
                <Text style={styles.energyLabel}>⚡ MENTAL ENERGY</Text>
                <View style={styles.energyBarTrack}>
                  <View
                    style={[
                      styles.energyBarFill,
                      { width: `${stamina}%` as any },
                    ]}
                  />
                </View>
                <Text style={styles.energyPercent}>{stamina}%</Text>
              </View>
            </View>
          </View>

          {/* Second bento row */}
          <View style={styles.bentoRow2}>
            {/* Quests card */}
            <View style={[styles.bentoCard, styles.bentoCard2Left]}>
              <Text style={styles.card2Label}>QUESTS</Text>
              <Text style={styles.card2Number}>{pendingCount || 3}</Text>
              <Text style={styles.card2Sub}>Pending today</Text>
              <View style={styles.dotRow}>
                <View style={[styles.dot, { backgroundColor: Colors.career }]} />
                <View style={[styles.dot, { backgroundColor: Colors.finance }]} />
                <View style={[styles.dot, { backgroundColor: Colors.wellbeing }]} />
              </View>
            </View>

            {/* Experience card */}
            <View style={[styles.bentoCard, styles.bentoCard2Right]}>
              <View style={styles.xpHeaderRow}>
                <Text style={styles.card2Label}>EXPERIENCE</Text>
                <View style={styles.levelPill}>
                  <Text style={styles.levelPillText}>LVL {level}</Text>
                </View>
              </View>
              <Text style={styles.xpValue}>
                {currentXP.toLocaleString()} / {targetXP.toLocaleString()} XP
              </Text>
              <Text style={styles.xpNextLabel}>NEXT: LVL {level + 1}</Text>
              <View style={styles.xpBarTrack}>
                <View
                  style={[styles.xpBarFill, { width: `${xpPercent}%` as any }]}
                />
              </View>
              <Text style={styles.xpUntilLabel}>
                {targetXP - currentXP} XP until your next milestone
              </Text>
            </View>
          </View>
        </View>

        {/* ── Suggested banner ────────────────────────────────── */}
        <TouchableOpacity
          style={styles.suggestedBanner}
          onPress={() => router.push('/(tabs)/quests')}
          activeOpacity={0.9}
        >
          <View style={styles.suggestedLeft}>
            <Text style={styles.suggestedStar}>✦</Text>
            <View style={styles.suggestedText}>
              <Text style={styles.suggestedTitle}>Suggested: Networking</Text>
              <Text style={styles.suggestedSub}>
                Connect with 2 mentors for +50 XP
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
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
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  avatarInitials: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.brandPrimary,
  },
  avatarMeta: {
    gap: 2,
  },
  levelLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.brandPrimary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
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

  // Section
  section: {
    marginTop: 0,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  // Bento row 1
  bentoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  bentoCard: {
    backgroundColor: Colors.bgSurface,
    borderRadius: 16,
    padding: 16,
  },
  bentoCardLeft: {
    flex: 1.4,
  },
  bentoRight: {
    flex: 1,
    gap: 12,
  },
  bentoCardSmall: {
    flex: 1,
    padding: 12,
  },

  // Progress rings grid
  ringsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  ringWrapper: {
    alignItems: 'center',
    width: '46%',
  },
  ring: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  ringPercent: {
    fontSize: 15,
    fontWeight: '700',
  },
  ringLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },

  // Streak card
  streakFire: {
    fontSize: 22,
  },
  streakNumber: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 34,
  },
  streakLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
  },

  // Energy card
  energyLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  energyBarTrack: {
    height: 4,
    backgroundColor: Colors.bgElevated,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  energyBarFill: {
    height: 4,
    backgroundColor: Colors.finance,
    borderRadius: 2,
  },
  energyPercent: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'right',
  },

  // Bento row 2
  bentoRow2: {
    flexDirection: 'row',
    gap: 12,
  },
  bentoCard2Left: {
    flex: 1,
  },
  bentoCard2Right: {
    flex: 1.6,
  },

  // Quests card
  card2Label: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  card2Number: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 36,
  },
  card2Sub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  dotRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // XP card
  xpHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  levelPill: {
    backgroundColor: Colors.brandPrimary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  xpValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 8,
  },
  xpNextLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  xpBarTrack: {
    height: 4,
    backgroundColor: Colors.bgElevated,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
  },
  xpBarFill: {
    height: 4,
    backgroundColor: Colors.brandPrimary,
    borderRadius: 2,
  },
  xpUntilLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
  },

  // Suggested banner
  suggestedBanner: {
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    backgroundColor: Colors.brandPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  suggestedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  suggestedStar: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  suggestedText: {
    flex: 1,
  },
  suggestedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  suggestedSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },

  // Bottom
  bottomSpacer: {
    height: 100,
  },
});
