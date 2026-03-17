import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@/src/ui/atoms/Text';
import { Avatar } from '@/src/ui/atoms/Avatar';
import { Badge } from '@/src/ui/atoms/Badge';
import { GlassView } from '@/src/ui/atoms/GlassView';
import { XPProgressBar } from '@/src/ui/molecules/XPProgressBar';
import { StreakBadge } from '@/src/ui/molecules/StreakBadge';
import { BranchProgressRow } from '@/src/ui/molecules/BranchProgressRow';
import { useUserStore } from '@/src/business-logic/stores/userStore';
import { useSkillTreeStore } from '@/src/business-logic/stores/skillTreeStore';
import { Colors } from '@/src/ui/tokens/colors';
import { Spacing, Radius } from '@/src/ui/tokens/spacing';
import type { Branch } from '@/src/business-logic/types';

const BRANCHES: Branch[] = ['career', 'finance', 'softskills', 'wellbeing'];

function getRankLabel(level: number): string {
  if (level <= 1) return 'Người mới bắt đầu';
  if (level <= 3) return 'Học viên';
  if (level <= 5) return 'Người tiến bộ';
  if (level <= 7) return 'Kỹ năng gia';
  if (level <= 9) return 'Chuyên gia';
  return 'Grandmaster';
}

function getBranchPercent(nodes: ReturnType<typeof useSkillTreeStore.getState>['nodes'], branch: Branch): number {
  const branchNodes = nodes.filter((n) => n.branch === branch);
  if (branchNodes.length === 0) return 0;
  const completed = branchNodes.filter((n) => n.status === 'completed').length;
  return Math.round((completed / branchNodes.length) * 100);
}

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

function SettingsRow({ icon, label, onPress, danger = false }: SettingsRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.settingsRow, pressed && styles.settingsRowPressed]}
      onPress={onPress}
    >
      <View style={styles.settingsRowLeft}>
        <View style={[styles.settingsIconWrap, danger && styles.settingsIconDanger]}>
          <Ionicons
            name={icon}
            size={18}
            color={danger ? Colors.danger : Colors.brandPrimary}
          />
        </View>
        <AppText
          variant="body"
          color={danger ? Colors.danger : Colors.textPrimary}
        >
          {label}
        </AppText>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const user = useUserStore((s) => s.user);
  const dailyStats = useUserStore((s) => s.dailyStats);
  const logout = useUserStore((s) => s.logout);
  const nodes = useSkillTreeStore((s) => s.nodes);

  const level = user?.level ?? 1;
  const name = user?.name ?? 'Người dùng';
  const streak = user?.streak ?? 0;
  const bestStreak = user?.best_streak ?? 0;
  const stamina = user?.stamina ?? 100;
  const currentXP = user?.current_xp_in_level ?? 0;
  const xpToNext = user?.xp_to_next_level ?? 100;
  const avatarUrl = user?.avatar_url ?? null;
  const rankLabel = getRankLabel(level);

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(auth)/welcome');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Card */}
        <GlassView style={styles.headerCard}>
          <View style={styles.headerTop}>
            <Avatar uri={avatarUrl} name={name} size="lg" />
            <View style={styles.headerInfo}>
              <AppText variant="title" color={Colors.textPrimary} style={styles.nameText}>
                {name}
              </AppText>
              <View style={styles.levelRow}>
                <Badge variant="level" value={level} />
                <AppText variant="caption" color={Colors.textSecondary}>
                  {rankLabel}
                </AppText>
              </View>
              <StreakBadge count={streak} />
            </View>
          </View>
          <View style={styles.xpBarWrap}>
            <XPProgressBar current={currentXP} target={xpToNext} level={level} />
          </View>
        </GlassView>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <GlassView style={styles.statCard}>
            <AppText variant="displayLG" color={Colors.brandPrimary} style={styles.statValue}>
              {dailyStats.quests_completed_today}
            </AppText>
            <AppText variant="micro" color={Colors.textMuted} style={styles.statLabel}>
              Nhiệm vụ{'\n'}hoàn thành
            </AppText>
          </GlassView>

          <GlassView style={styles.statCard}>
            <AppText variant="displayLG" color={Colors.warning} style={styles.statValue}>
              {bestStreak}
            </AppText>
            <AppText variant="micro" color={Colors.textMuted} style={styles.statLabel}>
              Streak{'\n'}tốt nhất
            </AppText>
          </GlassView>

          <GlassView style={styles.statCard}>
            <AppText variant="displayLG" color={Colors.staminaOk} style={styles.statValue}>
              {stamina}%
            </AppText>
            <AppText variant="micro" color={Colors.textMuted} style={styles.statLabel}>
              Sức{'\n'}khoẻ
            </AppText>
          </GlassView>
        </View>

        {/* Branch Progress */}
        <GlassView style={styles.sectionCard}>
          <AppText variant="title" color={Colors.textPrimary} style={styles.sectionTitle}>
            Tiến độ theo nhánh
          </AppText>
          {BRANCHES.map((branch) => (
            <BranchProgressRow
              key={branch}
              branch={branch}
              percent={getBranchPercent(nodes, branch)}
            />
          ))}
        </GlassView>

        {/* Settings / Actions */}
        <GlassView style={styles.sectionCard}>
          <AppText variant="title" color={Colors.textPrimary} style={styles.sectionTitle}>
            Cài đặt
          </AppText>
          <SettingsRow
            icon="person-outline"
            label="Chỉnh sửa hồ sơ"
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="notifications-outline"
            label="Thông báo"
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="trophy-outline"
            label="Bảng xếp hạng"
            onPress={() => router.push('/leaderboard')}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="heart-outline"
            label="Sức khoẻ & hỗ trợ"
            onPress={() => router.push('/wellbeing')}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="log-out-outline"
            label="Đăng xuất"
            onPress={handleLogout}
            danger
          />
        </GlassView>

        {/* App Version */}
        <AppText variant="micro" color={Colors.textMuted} style={styles.version}>
          Life Skill Tree v1.0.0
        </AppText>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },

  // Header Card
  headerCard: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  headerInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  nameText: {
    fontWeight: '700',
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  xpBarWrap: {
    marginTop: Spacing.xs,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontWeight: '800',
    textAlign: 'center',
  },
  statLabel: {
    textAlign: 'center',
    lineHeight: 16,
  },

  // Section Card
  sectionCard: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: Spacing.md,
  },

  // Settings Rows
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  settingsRowPressed: {
    opacity: 0.6,
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  settingsIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: `${Colors.brandPrimary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIconDanger: {
    backgroundColor: `${Colors.danger}1A`,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.glassBorder,
  },

  // Version
  version: {
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
