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

import { useUserStore } from '@/src/business-logic/stores/userStore';
import { useSkillTreeStore } from '@/src/business-logic/stores/skillTreeStore';
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

function getBranchPercent(
  nodes: ReturnType<typeof useSkillTreeStore.getState>['nodes'],
  branch: Branch,
): number {
  const branchNodes = nodes.filter((n) => n.branch === branch);
  if (branchNodes.length === 0) return 0;
  const completed = branchNodes.filter((n) => n.status === 'completed').length;
  return Math.round((completed / branchNodes.length) * 100);
}

// ─── Branch progress row ─────────────────────────────────────────────────────

interface BranchRowProps {
  label: string;
  percent: number;
  color: string;
}

function BranchProgressRow({ label, percent, color }: BranchRowProps) {
  return (
    <View style={styles.branchRow}>
      <Text style={styles.branchLabel}>{label}</Text>
      <Text style={styles.branchPercent}>{percent}%</Text>
      <View style={styles.branchBarTrack}>
        <View
          style={[
            styles.branchBarFill,
            { width: `${percent}%` as any, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const user = useUserStore((s) => s.user);
  const logout = useUserStore((s) => s.logout);
  const nodes = useSkillTreeStore((s) => s.nodes);

  const name = user?.name ?? 'Alex Kim';
  const level = user?.level ?? 4;
  const currentXP = user?.current_xp_in_level ?? 1240;
  const streak = user?.streak ?? 12;
  const bestStreak = user?.best_streak ?? 19;
  const initials = getInitials(name);

  const careerPct = getBranchPercent(nodes, 'career') || 80;
  const financePct = getBranchPercent(nodes, 'finance') || 60;
  const softskillsPct = getBranchPercent(nodes, 'softskills') || 40;
  const wellbeingPct = getBranchPercent(nodes, 'wellbeing') || 30;

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Avatar header ──────────────────────────────── */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>Lvl {level}</Text>
            </View>
          </View>
          <Text style={styles.userName}>{name}</Text>
          <Text style={styles.userSubtitle}>
            Level {level} · {currentXP.toLocaleString()} XP
          </Text>
        </View>

        {/* ── Premium banner ─────────────────────────────── */}
        <View style={styles.premiumBanner}>
          <Text style={styles.premiumStar}>✦</Text>
          <Text style={styles.premiumTitle}>Premium · Active</Text>
          <Text style={styles.premiumRenew}>Renews Apr 17</Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={Colors.textMuted}
            style={styles.premiumChevron}
          />
        </View>

        {/* ── Streak card ────────────────────────────────── */}
        <View style={styles.streakCard}>
          <Text style={styles.streakTitle}>🔥 {streak}-day streak</Text>
          <Text style={styles.streakBest}>Best: {bestStreak} days</Text>
        </View>

        {/* ── Stats row ──────────────────────────────────── */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>47</Text>
            <Text style={styles.statLabel}>Quests Done</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>23</Text>
            <Text style={styles.statLabel}>Days Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{bestStreak}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>3/4</Text>
            <Text style={styles.statLabel}>Branches</Text>
          </View>
        </View>

        {/* ── Skill Branch Progress ──────────────────────── */}
        <View style={styles.branchSection}>
          <Text style={styles.branchSectionTitle}>Skill Branch Progress</Text>
          <View style={styles.branchRows}>
            <BranchProgressRow
              label="Career"
              percent={careerPct}
              color={Colors.career}
            />
            <BranchProgressRow
              label="Finance"
              percent={financePct}
              color={Colors.finance}
            />
            <BranchProgressRow
              label="Soft Skills"
              percent={softskillsPct}
              color={Colors.softskills}
            />
            <BranchProgressRow
              label="Well-being"
              percent={wellbeingPct}
              color={Colors.wellbeing}
            />
          </View>
        </View>

        {/* ── Settings row ───────────────────────────────── */}
        <TouchableOpacity
          style={styles.settingsRow}
          onPress={() => router.push('/leaderboard')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="settings-outline"
            size={18}
            color={Colors.textPrimary}
          />
          <Text style={styles.settingsText}>Settings</Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={Colors.textMuted}
          />
        </TouchableOpacity>

        {/* ── Leaderboard row ────────────────────────────── */}
        <TouchableOpacity
          style={styles.settingsRow}
          onPress={() => router.push('/leaderboard')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="trophy-outline"
            size={18}
            color={Colors.textPrimary}
          />
          <Text style={styles.settingsText}>Leaderboard</Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={Colors.textMuted}
          />
        </TouchableOpacity>

        {/* ── Logout row ─────────────────────────────────── */}
        <TouchableOpacity
          style={[styles.settingsRow, { marginTop: 8 }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons
            name="log-out-outline"
            size={18}
            color={Colors.danger}
          />
          <Text style={[styles.settingsText, { color: Colors.danger }]}>
            Log Out
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={Colors.textMuted}
          />
        </TouchableOpacity>

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
    paddingBottom: 40,
  },

  // Avatar section
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.bgSurface,
    borderWidth: 3,
    borderColor: Colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: Colors.brandPrimary,
    borderRadius: 9999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  levelBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  userSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },

  // Premium banner
  premiumBanner: {
    marginHorizontal: 20,
    backgroundColor: Colors.bgSurface,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumStar: {
    fontSize: 16,
    color: Colors.brandPrimary,
    marginRight: 8,
  },
  premiumTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  premiumRenew: {
    fontSize: 11,
    color: Colors.textMuted,
    marginRight: 4,
  },
  premiumChevron: {
    marginLeft: 4,
  },

  // Streak card
  streakCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: Colors.bgSurface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  streakTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  streakBest: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.bgSurface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 13,
  },

  // Branch section
  branchSection: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  branchSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  branchRows: {
    gap: 12,
  },
  branchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  branchLabel: {
    fontSize: 13,
    color: Colors.textPrimary,
    flex: 1,
  },
  branchPercent: {
    fontSize: 13,
    color: Colors.textMuted,
    width: 36,
    textAlign: 'right',
  },
  branchBarTrack: {
    flex: 2,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  branchBarFill: {
    height: 6,
    borderRadius: 3,
  },

  // Settings rows
  settingsRow: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: Colors.bgSurface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsText: {
    fontSize: 14,
    color: Colors.textPrimary,
    flex: 1,
  },

  // Bottom
  bottomSpacer: {
    height: 100,
  },
});
