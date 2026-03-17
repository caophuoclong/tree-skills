import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useUserStore } from '@/src/business-logic/stores/userStore';
import { useTheme } from '@/src/ui/tokens';

// ─── Types & Data ─────────────────────────────────────────────────────────────

interface LeaderboardEntry {
  id: string;
  name: string;
  streak: number;
  xp: number;
  initials: string;
  avatarBg: string;
}

type TimeTab = 'weekly' | 'alltime';

function getMedalEmoji(rank: number): string | null {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
}

export default function LeaderboardScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const user = useUserStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<TimeTab>('weekly');

  // Derive user display values FIRST so they can be used in mock data
  const userName = user?.name ?? 'Bạn';
  const userXP = user?.total_xp ?? 1240;
  const userStreak = user?.streak ?? 12;
  const userInitials = userName
    .split(' ')
    .map((w) => w[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const MOCK_WEEKLY: LeaderboardEntry[] = [
    { id: '1', name: 'Sarah Chen', streak: 21, xp: 2840, initials: 'SC', avatarBg: colors.career },
    { id: '2', name: 'James Park', streak: 18, xp: 2520, initials: 'JP', avatarBg: colors.finance },
    { id: '3', name: 'Aisha Patel', streak: 15, xp: 2100, initials: 'AP', avatarBg: colors.softskills },
    { id: '4', name: 'Marcus Lee', streak: 12, xp: 1900, initials: 'ML', avatarBg: colors.wellbeing },
    { id: '5', name: 'Zoe Williams', streak: 10, xp: 1650, initials: 'ZW', avatarBg: colors.brandPrimary },
    { id: '6', name: 'Noah Kim', streak: 9, xp: 1400, initials: 'NK', avatarBg: colors.career },
    { id: '7', name: 'Luna Tran', streak: 7, xp: 1100, initials: 'LT', avatarBg: colors.finance },
    { id: '8', name: 'Ethan Nguyen', streak: 5, xp: 850, initials: 'EN', avatarBg: colors.softskills },
    { id: 'current', name: userName, streak: userStreak, xp: userXP, initials: userInitials, avatarBg: colors.brandPrimary },
  ];

  const MOCK_ALLTIME: LeaderboardEntry[] = [
    { id: '1', name: 'Sarah Chen', streak: 89, xp: 12840, initials: 'SC', avatarBg: colors.career },
    { id: '2', name: 'James Park', streak: 76, xp: 11200, initials: 'JP', avatarBg: colors.finance },
    { id: '3', name: 'Aisha Patel', streak: 65, xp: 9800, initials: 'AP', avatarBg: colors.softskills },
    { id: '4', name: 'Marcus Lee', streak: 54, xp: 8400, initials: 'ML', avatarBg: colors.wellbeing },
    { id: '5', name: 'Zoe Williams', streak: 48, xp: 7200, initials: 'ZW', avatarBg: colors.brandPrimary },
    { id: '6', name: 'Noah Kim', streak: 42, xp: 6100, initials: 'NK', avatarBg: colors.career },
    { id: '7', name: 'Luna Tran', streak: 35, xp: 5000, initials: 'LT', avatarBg: colors.finance },
    { id: '8', name: 'Ethan Nguyen', streak: 28, xp: 3900, initials: 'EN', avatarBg: colors.softskills },
    { id: 'current', name: userName, streak: userStreak, xp: userXP, initials: userInitials, avatarBg: colors.brandPrimary },
  ];

  const data = activeTab === 'weekly' ? MOCK_WEEKLY : MOCK_ALLTIME;
  const sortedData = [...data].sort((a, b) => b.xp - a.xp);
  const userRank = sortedData.findIndex(item => item.id === 'current') + 1;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Header ─────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bảng xếp hạng Kiên trì</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* ── Tabs ───────────────────────────────────────────── */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'weekly' && styles.tabActive]}
          onPress={() => setActiveTab('weekly')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'weekly' && styles.tabTextActive,
            ]}
          >
            Hàng tuần
          </Text>
          {activeTab === 'weekly' && <View style={styles.tabUnderline} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'alltime' && styles.tabActive]}
          onPress={() => setActiveTab('alltime')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'alltime' && styles.tabTextActive,
            ]}
          >
            Tất cả
          </Text>
          {activeTab === 'alltime' && <View style={styles.tabUnderline} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Current user card ──────────────────────────── */}
        {(() => {
          // Compute the person directly above us to show gap
          const myIndex = sortedData.findIndex(item => item.id === 'current');
          const personAbove = myIndex > 0 ? sortedData[myIndex - 1] : null;
          const xpGap = personAbove ? personAbove.xp - userXP : 0;
          return (
            <View style={styles.userCard}>
              <View style={[styles.accentBar, { backgroundColor: colors.brandPrimary }]} />
              <View style={styles.userCardRow}>
                <View style={[styles.userAvatar, { backgroundColor: colors.brandPrimary }]}>
                  <Text style={styles.userAvatarText}>{userInitials}</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userInfoName}>{userName}</Text>
                  <Text style={styles.userInfoStreak}>
                    Hạng #{userRank > 0 ? userRank : '—'} · Chuỗi {userStreak} ngày 🔥
                  </Text>
                  {personAbove && xpGap > 0 && (
                    <Text style={[styles.userRankGap, { color: colors.softskills }]}>
                      Còn {xpGap.toLocaleString()} XP nữa để vượt {personAbove.name}
                    </Text>
                  )}
                </View>
                <Text style={styles.userXP}>{userXP.toLocaleString()} XP</Text>
              </View>
              <View style={styles.userProgressTrack}>
                <View style={styles.userProgressFill} />
              </View>
            </View>
          );
        })()}

        {/* ── Top Performers label ───────────────────────── */}
        <Text style={styles.topLabel}>BẢNG XẾP HẠNG TUẦN</Text>

        {/* ── Ranked list ────────────────────────────────── */}
        <View style={styles.listContainer}>
          {sortedData.map((entry, index) => {
            const rank = index + 1;
            const medal = getMedalEmoji(rank);
            return (
              <View
                key={entry.id}
                style={[
                  styles.listRow,
                  index < data.length - 1 && styles.listRowBorder,
                ]}
              >
                <View style={styles.rankCol}>
                  {medal ? (
                    <Text style={styles.medalEmoji}>{medal}</Text>
                  ) : (
                    <Text style={styles.rankNum}>{rank}</Text>
                  )}
                </View>
                <View style={[styles.listAvatar, { backgroundColor: entry.avatarBg }]}>
                  <Text style={styles.listAvatarText}>{entry.initials}</Text>
                </View>
                <View style={styles.listInfo}>
                  <Text style={styles.listName}>{entry.name} {entry.id === 'current' ? '(Bạn)' : ''}</Text>
                  <Text style={styles.listStreak}>Chuỗi {entry.streak} ngày</Text>
                </View>
                <Text style={styles.listXP}>{entry.xp.toLocaleString()} XP</Text>
              </View>
            );
          })}
        </View>

        {/* ── Quote ─────────────────────────────────────── */}
        <Text style={styles.quote}>
          &quot;Bạn được xếp hạng bởi sự kiên trì, không phải kết quả.&quot;
        </Text>

        <View style={{ height: 100 }} />
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginLeft: 8,
  },
  headerSpacer: {
    width: 36,
  },

  // Tabs
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  tab: {
    paddingVertical: 8,
    marginRight: 24,
    position: 'relative',
  },
  tabActive: {},
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.textPrimary,
  },
  tabUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.brandPrimary,
    borderRadius: 1,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  // User card
  userCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
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
  userCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userInfoName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  userInfoStreak: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  userRankGap: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
  },
  userXP: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.brandPrimary,
  },
  userProgressTrack: {
    height: 3,
    backgroundColor: colors.bgElevated,
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  userProgressFill: {
    height: 3,
    width: '52%',
    backgroundColor: colors.brandPrimary,
    borderRadius: 2,
  },

  // Top label
  topLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  // List
  listContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  listRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  rankCol: {
    width: 28,
    alignItems: 'center',
  },
  medalEmoji: {
    fontSize: 18,
  },
  rankNum: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
  },
  listAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listAvatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listInfo: {
    flex: 1,
    gap: 2,
  },
  listName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  listStreak: {
    fontSize: 11,
    color: colors.textMuted,
  },
  listXP: {
    fontSize: 14,
    fontWeight: '800', // Bolder
    color: colors.textPrimary,
  },

  // Quote
  quote: {
    fontSize: 13,
    fontStyle: 'italic',
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 20,
  },
});
