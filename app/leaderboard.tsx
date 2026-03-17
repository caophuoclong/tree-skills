import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@/src/ui/atoms/Text';
import { Avatar } from '@/src/ui/atoms/Avatar';
import { GlassView } from '@/src/ui/atoms/GlassView';
import { useUserStore } from '@/src/business-logic/stores/userStore';
import { Colors } from '@/src/ui/tokens/colors';
import { Spacing, Radius } from '@/src/ui/tokens/spacing';

type TimeFilter = 'week' | 'month' | 'alltime';

interface LeaderboardEntry {
  id: string;
  name: string;
  level: number;
  total_xp: number;
  avatar_url: string | null;
}

const BASE_MOCK_DATA: LeaderboardEntry[] = [
  { id: '1', name: 'Nguyễn Minh Tuấn', level: 10, total_xp: 4850, avatar_url: null },
  { id: '2', name: 'Trần Thị Hương', level: 9, total_xp: 4200, avatar_url: null },
  { id: '3', name: 'Lê Văn Đức', level: 9, total_xp: 3950, avatar_url: null },
  { id: '4', name: 'Phạm Thị Lan', level: 8, total_xp: 3400, avatar_url: null },
  { id: '5', name: 'Hoàng Văn Nam', level: 7, total_xp: 2800, avatar_url: null },
  { id: '6', name: 'Vũ Thị Mai', level: 6, total_xp: 2200, avatar_url: null },
  { id: '7', name: 'Đặng Văn Hùng', level: 5, total_xp: 1750, avatar_url: null },
  { id: '8', name: 'Bùi Thị Nga', level: 4, total_xp: 1200, avatar_url: null },
  { id: '9', name: 'Đỗ Văn Thắng', level: 3, total_xp: 750, avatar_url: null },
  { id: '10', name: 'Ngô Thị Thu', level: 2, total_xp: 300, avatar_url: null },
];

// Scale down XP for time-filtered views
const WEEK_MULTIPLIER = 0.15;
const MONTH_MULTIPLIER = 0.45;

function getMockDataForFilter(filter: TimeFilter): LeaderboardEntry[] {
  if (filter === 'alltime') return BASE_MOCK_DATA;
  const multiplier = filter === 'week' ? WEEK_MULTIPLIER : MONTH_MULTIPLIER;
  return BASE_MOCK_DATA.map((entry) => ({
    ...entry,
    total_xp: Math.round(entry.total_xp * multiplier),
  }));
}

function getRankMedal(rank: number): string | null {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
}

const PODIUM_COLORS: Record<number, string> = {
  1: '#FFD700',
  2: '#C0C0C0',
  3: '#CD7F32',
};

const FILTER_LABELS: Record<TimeFilter, string> = {
  week: 'Tuần này',
  month: 'Tháng này',
  alltime: 'Mọi thời đại',
};

export default function LeaderboardScreen() {
  const user = useUserStore((s) => s.user);
  const [activeFilter, setActiveFilter] = useState<TimeFilter>('week');

  const mockData = useMemo(() => getMockDataForFilter(activeFilter), [activeFilter]);

  // Determine current user rank by comparing total_xp to mock entries
  const userXP = user?.total_xp ?? 0;
  const userEntry: LeaderboardEntry | null = user
    ? {
        id: 'current-user',
        name: user.name,
        level: user.level,
        total_xp: userXP,
        avatar_url: user.avatar_url,
      }
    : null;

  // Merge user into ranked list if not null
  const rankedList = useMemo(() => {
    if (!userEntry) return mockData;
    // Filter out any mock entry that might match user's XP to avoid duplicates, then insert user
    const filtered = mockData.filter((e) => e.total_xp !== userEntry.total_xp || e.id === 'current-user');
    const combined = [...filtered, userEntry].sort((a, b) => b.total_xp - a.total_xp);
    return combined;
  }, [mockData, userEntry]);

  const userRank = userEntry
    ? rankedList.findIndex((e) => e.id === 'current-user') + 1
    : null;

  const topThree = rankedList.slice(0, 3);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <AppText variant="title" color={Colors.textPrimary} style={styles.headerTitle}>
          Bảng Xếp Hạng
        </AppText>
        <View style={styles.headerSpacer} />
      </View>

      {/* Time Filter Tabs */}
      <View style={styles.filterRow}>
        {(Object.keys(FILTER_LABELS) as TimeFilter[]).map((filter) => (
          <Pressable
            key={filter}
            style={[styles.filterTab, activeFilter === filter && styles.filterTabActive]}
            onPress={() => setActiveFilter(filter)}
          >
            <AppText
              variant="caption"
              color={activeFilter === filter ? Colors.brandPrimary : Colors.textMuted}
              style={[styles.filterTabText, activeFilter === filter && styles.filterTabTextActive]}
            >
              {FILTER_LABELS[filter]}
            </AppText>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Podium — Top 3 */}
        {topThree.length >= 3 && (
          <View style={styles.podiumSection}>
            {/* Reorder: 2nd, 1st, 3rd for visual podium layout */}
            {[topThree[1], topThree[0], topThree[2]].map((entry, visualIndex) => {
              const actualRank = visualIndex === 0 ? 2 : visualIndex === 1 ? 1 : 3;
              const isCenter = visualIndex === 1;
              const medalColor = PODIUM_COLORS[actualRank];
              const medal = getRankMedal(actualRank);

              return (
                <View
                  key={entry.id}
                  style={[styles.podiumSlot, isCenter && styles.podiumSlotCenter]}
                >
                  <AppText style={styles.podiumMedal}>{medal}</AppText>
                  <Avatar
                    uri={entry.avatar_url}
                    name={entry.name}
                    size={isCenter ? 'lg' : 'md'}
                  />
                  <AppText
                    variant="micro"
                    color={Colors.textPrimary}
                    style={styles.podiumName}
                    numberOfLines={2}
                  >
                    {entry.name.split(' ').slice(-1)[0]}
                  </AppText>
                  <AppText variant="micro" color={medalColor} style={styles.podiumXP}>
                    {entry.total_xp.toLocaleString()} XP
                  </AppText>
                  <View
                    style={[
                      styles.podiumBar,
                      {
                        height: isCenter ? 72 : actualRank === 2 ? 52 : 40,
                        backgroundColor: `${medalColor}40`,
                        borderTopColor: medalColor,
                      },
                    ]}
                  />
                </View>
              );
            })}
          </View>
        )}

        {/* Current User Rank Card */}
        {userEntry && userRank !== null && (
          <GlassView style={styles.userRankCard}>
            <View style={styles.userRankLeft}>
              <AppText variant="caption" color={Colors.brandPrimary} style={styles.userRankNum}>
                #{userRank}
              </AppText>
              <Avatar uri={userEntry.avatar_url} name={userEntry.name} size="sm" />
              <View style={styles.userRankInfo}>
                <AppText variant="body" color={Colors.textPrimary} style={styles.userRankName}>
                  {userEntry.name}
                </AppText>
                <AppText variant="micro" color={Colors.textMuted}>
                  Level {userEntry.level}
                </AppText>
              </View>
            </View>
            <View style={styles.userRankRight}>
              <AppText variant="body" color={Colors.brandPrimary} style={styles.userRankXP}>
                {userEntry.total_xp.toLocaleString()}
              </AppText>
              <AppText variant="micro" color={Colors.textMuted}>
                XP
              </AppText>
            </View>
          </GlassView>
        )}

        {/* Full Leaderboard List */}
        <GlassView style={styles.listCard}>
          {rankedList.map((entry, index) => {
            const rank = index + 1;
            const isCurrentUser = entry.id === 'current-user';
            const medal = getRankMedal(rank);

            return (
              <View key={entry.id}>
                <View
                  style={[
                    styles.listRow,
                    isCurrentUser && styles.listRowHighlight,
                  ]}
                >
                  <View style={styles.rankWrap}>
                    {medal ? (
                      <AppText style={styles.medalText}>{medal}</AppText>
                    ) : (
                      <AppText
                        variant="caption"
                        color={Colors.textMuted}
                        style={styles.rankNum}
                      >
                        {rank}
                      </AppText>
                    )}
                  </View>

                  <Avatar uri={entry.avatar_url} name={entry.name} size="sm" />

                  <View style={styles.listEntryInfo}>
                    <AppText
                      variant="body"
                      color={isCurrentUser ? Colors.brandPrimary : Colors.textPrimary}
                      style={[styles.listEntryName, isCurrentUser && styles.listEntryNameHighlight]}
                      numberOfLines={1}
                    >
                      {entry.name}{isCurrentUser ? ' (Bạn)' : ''}
                    </AppText>
                    <AppText variant="micro" color={Colors.textMuted}>
                      Level {entry.level}
                    </AppText>
                  </View>

                  <View style={styles.listEntryXPWrap}>
                    <AppText
                      variant="caption"
                      color={isCurrentUser ? Colors.brandPrimary : Colors.textSecondary}
                      style={styles.listEntryXP}
                    >
                      {entry.total_xp.toLocaleString()}
                    </AppText>
                    <AppText variant="micro" color={Colors.textMuted}>
                      XP
                    </AppText>
                  </View>
                </View>

                {index < rankedList.length - 1 && (
                  <View style={styles.rowDivider} />
                )}
              </View>
            );
          })}
        </GlassView>

        {/* Info Note */}
        <View style={styles.infoNote}>
          <Ionicons name="information-circle-outline" size={14} color={Colors.textMuted} />
          <AppText variant="micro" color={Colors.textMuted}>
            Bảng xếp hạng được cập nhật hàng tuần
          </AppText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnPressed: {
    opacity: 0.6,
    backgroundColor: Colors.glassBg,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },

  // Filter Tabs
  filterRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.md,
    padding: 4,
    marginBottom: Spacing.sm,
  },
  filterTab: {
    flex: 1,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
    borderRadius: Radius.sm,
  },
  filterTabActive: {
    backgroundColor: `${Colors.brandPrimary}22`,
  },
  filterTabText: {
    fontWeight: '500',
  },
  filterTabTextActive: {
    fontWeight: '700',
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },

  // Podium
  podiumSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginVertical: Spacing.sm,
  },
  podiumSlot: {
    alignItems: 'center',
    gap: 6,
    width: 90,
  },
  podiumSlotCenter: {
    marginBottom: 0,
  },
  podiumMedal: {
    fontSize: 24,
    textAlign: 'center',
  },
  podiumName: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 11,
  },
  podiumXP: {
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 10,
  },
  podiumBar: {
    width: '100%',
    borderTopWidth: 2,
    borderRadius: 4,
  },

  // Current User Rank Card
  userRankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderColor: `${Colors.brandPrimary}50`,
    borderWidth: 1.5,
  },
  userRankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  userRankNum: {
    fontWeight: '800',
    fontSize: 16,
    width: 28,
    textAlign: 'center',
  },
  userRankInfo: {
    gap: 2,
    flex: 1,
  },
  userRankName: {
    fontWeight: '700',
  },
  userRankRight: {
    alignItems: 'flex-end',
  },
  userRankXP: {
    fontWeight: '800',
  },

  // List
  listCard: {
    padding: 0,
    overflow: 'hidden',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  listRowHighlight: {
    backgroundColor: `${Colors.brandPrimary}12`,
  },
  rankWrap: {
    width: 28,
    alignItems: 'center',
  },
  medalText: {
    fontSize: 20,
    textAlign: 'center',
  },
  rankNum: {
    fontWeight: '700',
    textAlign: 'center',
  },
  listEntryInfo: {
    flex: 1,
    gap: 2,
  },
  listEntryName: {
    fontWeight: '500',
  },
  listEntryNameHighlight: {
    fontWeight: '700',
  },
  listEntryXPWrap: {
    alignItems: 'flex-end',
  },
  listEntryXP: {
    fontWeight: '700',
  },
  rowDivider: {
    height: 1,
    backgroundColor: Colors.glassBorder,
    marginHorizontal: Spacing.md,
  },

  // Info Note
  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
});
