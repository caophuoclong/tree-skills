import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
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
import { useTheme } from '@/src/ui/tokens';
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
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

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
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
  
  const milestones = [
    { id: 1, title: 'Tân binh', description: 'Đạt 3 ngày liên tiếp', icon: 'medal-outline', unlocked: streak >= 3, color: colors.career },
    { id: 2, title: 'Kiên trì', description: 'Đạt 7 ngày liên tiếp', icon: 'ribbon-outline', unlocked: streak >= 7, color: colors.finance },
    { id: 3, title: 'Kỷ luật', description: 'Đạt 14 ngày liên tiếp', icon: 'shield-checkmark-outline', unlocked: streak >= 14, color: colors.softskills },
    { id: 4, title: 'Huyền thoại', description: 'Đạt 30 ngày liên tiếp', icon: 'star-outline', unlocked: streak >= 30, color: colors.wellbeing },
    { id: 5, title: 'Bậc thầy Sự nghiệp', description: 'Hoàn thành nhánh Sự nghiệp', icon: 'briefcase', unlocked: careerPct >= 100, color: colors.career },
    { id: 6, title: 'Bậc thầy Tài chính', description: 'Hoàn thành nhánh Tài chính', icon: 'wallet', unlocked: financePct >= 100, color: colors.finance },
    { id: 7, title: 'Bậc thầy Kỹ năng', description: 'Hoàn thành nhánh Kỹ năng mềm', icon: 'people', unlocked: softskillsPct >= 100, color: colors.softskills },
    { id: 8, title: 'Bậc thầy Sức khỏe', description: 'Hoàn thành nhánh Sức khỏe', icon: 'pulse', unlocked: wellbeingPct >= 100, color: colors.wellbeing },
  ];

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất không?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
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
              <Text style={styles.levelBadgeText}>Cấp {level}</Text>
            </View>
          </View>
          <Text style={styles.userName}>{name}</Text>
          <Text style={styles.userSubtitle}>
            Cấp {level} · {currentXP.toLocaleString()} XP
          </Text>
        </View>

        {/* ── Premium banner ─────────────────────────────── */}
        <View style={styles.premiumBanner}>
          <Text style={styles.premiumStar}>✦</Text>
          <Text style={styles.premiumTitle}>Gói Premium · Đang kích hoạt</Text>
          <Text style={styles.premiumRenew}>Hết hạn 17 Thg 4</Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={colors.textMuted}
            style={styles.premiumChevron}
          />
        </View>

        {/* ── Streak card ────────────────────────────────── */}
        <View style={styles.streakCard}>
          <View style={[styles.accentBar, { backgroundColor: colors.warning }]} />
          <Text style={styles.streakTitle}>🔥 Chuỗi {streak} ngày</Text>
          <Text style={styles.streakBest}>Kỷ lục: {bestStreak} ngày</Text>
        </View>

        {/* ── Stats row ──────────────────────────────────── */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>47</Text>
            <Text style={styles.statLabel}>Nhiệm vụ xong</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>23</Text>
            <Text style={styles.statLabel}>Ngày hoạt động</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{bestStreak}</Text>
            <Text style={styles.statLabel}>Kỷ lục chuỗi</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>3/4</Text>
            <Text style={styles.statLabel}>Nhánh kỹ năng</Text>
          </View>
        </View>

        {/* ── Milestone Badges ─────────────────────────── */}
        <View style={styles.milestoneSection}>
          <Text style={styles.sectionTitle}>Huy hiệu cột mốc</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.milestoneList}>
            {milestones.map((m) => (
              <View key={m.id} style={[styles.milestoneCard, !m.unlocked && styles.milestoneLocked, m.unlocked && { borderColor: `${m.color}60` }]}>
                {m.unlocked && <View style={[styles.accentBar, { backgroundColor: m.color }]} />}
                <View style={[styles.milestoneIcon, { backgroundColor: m.unlocked ? `${m.color}20` : colors.bgElevated }]}>
                  <Ionicons name={m.icon as any} size={24} color={m.unlocked ? m.color : colors.textMuted} />
                </View>
                <Text style={[styles.milestoneTitle, !m.unlocked && { color: colors.textMuted }]}>{m.title}</Text>
                <Text style={styles.milestoneDesc}>{m.description}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── Skill Branch Progress ──────────────────────── */}
        <View style={styles.branchSection}>
          <Text style={styles.sectionTitle}>Tiến độ nhánh kỹ năng</Text>
          <View style={styles.branchRows}>
            <BranchProgressRow
              label="Sự nghiệp"
              percent={careerPct}
              color={colors.career}
            />
            <BranchProgressRow
              label="Tài chính"
              percent={financePct}
              color={colors.finance}
            />
            <BranchProgressRow
              label="Kỹ năng mềm"
              percent={softskillsPct}
              color={colors.softskills}
            />
            <BranchProgressRow
              label="Sức khỏe"
              percent={wellbeingPct}
              color={colors.wellbeing}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.settingsRow}
          onPress={() => router.push('/settings')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="settings-outline"
            size={18}
            color={colors.textPrimary}
          />
          <Text style={styles.settingsText}>Cài đặt</Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={colors.textMuted}
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
            color={colors.textPrimary}
          />
          <Text style={styles.settingsText}>Bảng xếp hạng</Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={colors.textMuted}
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
            color={colors.danger}
          />
          <Text style={[styles.settingsText, { color: colors.danger }]}>
            Đăng xuất
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={colors.textMuted}
          />
        </TouchableOpacity>

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
    backgroundColor: colors.bgSurface,
    borderWidth: 3,
    borderColor: colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 24,
    fontWeight: '800', // Display bold
    color: colors.textPrimary,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.brandPrimary,
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
    color: colors.textPrimary,
    marginBottom: 4,
  },
  userSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },

  // Premium banner
  premiumBanner: {
    marginHorizontal: 20,
    backgroundColor: colors.bgSurface,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumStar: {
    fontSize: 16,
    color: colors.brandPrimary,
    marginRight: 8,
  },
  premiumTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  premiumRenew: {
    fontSize: 11,
    color: colors.textMuted,
    marginRight: 4,
  },
  premiumChevron: {
    marginLeft: 4,
  },

  // Streak card
  streakCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
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
  streakTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  streakBest: {
    fontSize: 12,
    color: colors.textSecondary,
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 13,
  },

  // Branch section
  branchSection: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  branchRows: {
    gap: 12,
  },

  // Milestones
  milestoneSection: {
    marginTop: 24,
  },
  milestoneList: {
    paddingLeft: 20,
    paddingRight: 10,
    gap: 12,
    flexDirection: 'row',
  },
  milestoneCard: {
    width: 130,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  milestoneLocked: {
    opacity: 0.6,
  },
  milestoneIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  milestoneTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  milestoneDesc: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
  },
  branchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  branchLabel: {
    fontSize: 13,
    color: colors.textPrimary,
    flex: 1,
  },
  branchPercent: {
    fontSize: 13,
    color: colors.textMuted,
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  settingsText: {
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
  },

  // Bottom
  bottomSpacer: {
    height: 100,
  },
});
