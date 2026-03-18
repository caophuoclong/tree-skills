import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useUserStore } from '@/src/business-logic/stores/userStore';
import { Emoji, NeoBrutalAccent, NeoBrutalBox, NeoBrutalThemed, ProgressBar } from '@/src/ui/atoms';
import { useTheme } from '@/src/ui/tokens';

// ─── Types & Constants ────────────────────────────────────────────────────────

interface LeaderboardEntry {
  id: string;
  name: string;
  streak: number;
  xp: number;
  initials: string;
  avatarBg: string;
}

type TimeTab = 'weekly' | 'alltime';

const MEDAL_COLORS = ['#F59E0B', '#9CA3AF', '#CD7C2F'] as const;

function getMedalEmoji(rank: number): string | null {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function LeaderboardScreen() {
  const { colors } = useTheme();
  const user = useUserStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<TimeTab>('weekly');

  // Derive user display values
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
    { id: '1', name: 'Sarah Chen',    streak: 21, xp: 2840, initials: 'SC', avatarBg: colors.career },
    { id: '2', name: 'James Park',    streak: 18, xp: 2520, initials: 'JP', avatarBg: colors.finance },
    { id: '3', name: 'Aisha Patel',   streak: 15, xp: 2100, initials: 'AP', avatarBg: colors.softskills },
    { id: '4', name: 'Marcus Lee',    streak: 12, xp: 1900, initials: 'ML', avatarBg: colors.wellbeing },
    { id: '5', name: 'Zoe Williams',  streak: 10, xp: 1650, initials: 'ZW', avatarBg: colors.brandPrimary },
    { id: '6', name: 'Noah Kim',      streak:  9, xp: 1400, initials: 'NK', avatarBg: colors.career },
    { id: '7', name: 'Luna Tran',     streak:  7, xp: 1100, initials: 'LT', avatarBg: colors.finance },
    { id: '8', name: 'Ethan Nguyen',  streak:  5, xp:  850, initials: 'EN', avatarBg: colors.softskills },
    { id: 'current', name: userName,  streak: userStreak, xp: userXP, initials: userInitials, avatarBg: colors.brandPrimary },
  ];

  const MOCK_ALLTIME: LeaderboardEntry[] = [
    { id: '1', name: 'Sarah Chen',    streak: 89, xp: 12840, initials: 'SC', avatarBg: colors.career },
    { id: '2', name: 'James Park',    streak: 76, xp: 11200, initials: 'JP', avatarBg: colors.finance },
    { id: '3', name: 'Aisha Patel',   streak: 65, xp:  9800, initials: 'AP', avatarBg: colors.softskills },
    { id: '4', name: 'Marcus Lee',    streak: 54, xp:  8400, initials: 'ML', avatarBg: colors.wellbeing },
    { id: '5', name: 'Zoe Williams',  streak: 48, xp:  7200, initials: 'ZW', avatarBg: colors.brandPrimary },
    { id: '6', name: 'Noah Kim',      streak: 42, xp:  6100, initials: 'NK', avatarBg: colors.career },
    { id: '7', name: 'Luna Tran',     streak: 35, xp:  5000, initials: 'LT', avatarBg: colors.finance },
    { id: '8', name: 'Ethan Nguyen',  streak: 28, xp:  3900, initials: 'EN', avatarBg: colors.softskills },
    { id: 'current', name: userName,  streak: userStreak, xp: userXP, initials: userInitials, avatarBg: colors.brandPrimary },
  ];

  const data = activeTab === 'weekly' ? MOCK_WEEKLY : MOCK_ALLTIME;
  const sortedData = [...data].sort((a, b) => b.xp - a.xp);
  const userRank = sortedData.findIndex((item) => item.id === 'current') + 1;

  // XP gap to person above
  const myIndex = sortedData.findIndex((item) => item.id === 'current');
  const personAbove = myIndex > 0 ? sortedData[myIndex - 1] : null;
  const xpGap = personAbove ? personAbove.xp - userXP : 0;

  // Progress toward person above (for ProgressBar)
  const maxXP = sortedData[0]?.xp ?? 1;
  const progressPct = Math.round((userXP / maxXP) * 100);

  // Split top-3 podium vs rest
  const top3 = sortedData.slice(0, 3);
  const rest = sortedData.slice(3);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgBase }]} edges={['top']}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <View style={[styles.header, { borderBottomColor: colors.glassBorder }]}>
        <NeoBrutalBox
          borderColor={colors.glassBorder}
          backgroundColor={colors.bgElevated}
          shadowColor="#000"
          shadowOffsetX={2}
          shadowOffsetY={2}
          borderWidth={1.5}
          borderRadius={18}
          onPress={() => router.back()}
          contentStyle={styles.backBtnContent}
        >
          <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
        </NeoBrutalBox>

        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Bảng xếp hạng
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* ── Tab pills ───────────────────────────────────────────────────────── */}
      <View style={styles.tabsRow}>
        {(['weekly', 'alltime'] as TimeTab[]).map((tab) => {
          const active = activeTab === tab;
          const label = tab === 'weekly' ? 'Hàng tuần' : 'Tất cả';
          return active ? (
            <NeoBrutalAccent
              key={tab}
              accentColor={`${colors.brandPrimary}22`}
              strokeColor={colors.brandPrimary}
              shadowOffsetX={2}
              shadowOffsetY={2}
              borderWidth={1.5}
              borderRadius={20}
              onPress={() => setActiveTab(tab)}
              contentStyle={styles.tabPillContent}
            >
              <Text style={[styles.tabPillText, { color: colors.brandPrimary }]}>{label}</Text>
            </NeoBrutalAccent>
          ) : (
            <NeoBrutalBox
              key={tab}
              borderColor={colors.glassBorder}
              backgroundColor={colors.bgSurface}
              shadowColor="#000"
              shadowOffsetX={2}
              shadowOffsetY={2}
              borderWidth={1.5}
              borderRadius={20}
              onPress={() => setActiveTab(tab)}
              style={{ opacity: 0.6 }}
              contentStyle={styles.tabPillContent}
            >
              <Text style={[styles.tabPillText, { color: colors.textMuted }]}>{label}</Text>
            </NeoBrutalBox>
          );
        })}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Your card ─────────────────────────────────────────────────────── */}
        <NeoBrutalBox
          borderColor={colors.brandPrimary}
          backgroundColor={`${colors.brandPrimary}0E`}
          shadowColor={colors.brandPrimary}
          shadowOffsetX={5}
          shadowOffsetY={5}
          borderWidth={1.5}
          borderRadius={16}
          style={{ marginBottom: 20 }}
        >
          {/* Left accent bar */}
          <View
            style={[styles.accentBar, { backgroundColor: colors.brandPrimary }]}
            pointerEvents="none"
          />

          <View style={styles.userCardBody}>
            {/* Avatar */}
            <NeoBrutalAccent
              accentColor={colors.brandPrimary}
              strokeColor="#000"
              shadowOffsetX={2}
              shadowOffsetY={2}
              borderWidth={1.5}
              borderRadius={22}
              contentStyle={styles.userAvatarContent}
            >
              <Text style={styles.userAvatarText}>{userInitials}</Text>
            </NeoBrutalAccent>

            {/* Name + info */}
            <View style={{ flex: 1 }}>
              <Text style={[styles.userInfoName, { color: colors.textPrimary }]}>
                {userName}
              </Text>
              <Text style={[styles.userInfoSub, { color: colors.textSecondary }]}>
                Hạng #{userRank > 0 ? userRank : '—'} · Chuỗi {userStreak} ngày{' '}
                <Emoji size={11}>🔥</Emoji>
              </Text>
              {personAbove && xpGap > 0 && (
                <Text style={[styles.userRankGap, { color: colors.softskills }]}>
                  Còn {xpGap.toLocaleString()} XP để vượt {personAbove.name}
                </Text>
              )}
            </View>

            {/* XP */}
            <Text style={[styles.userXP, { color: colors.brandPrimary }]}>
              {userXP.toLocaleString()}{'\n'}
              <Text style={[styles.userXPLabel, { color: colors.textMuted }]}>XP</Text>
            </Text>
          </View>

          {/* Progress bar toward #1 */}
          <View style={styles.userProgressWrap}>
            <ProgressBar
              value={progressPct}
              color={colors.brandPrimary}
              variant="thin"
            />
          </View>
        </NeoBrutalBox>

        {/* ── Section label ─────────────────────────────────────────────────── */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          {activeTab === 'weekly' ? 'TOP TUẦN NÀY' : 'TOP MỌI THỜI ĐẠI'}
        </Text>

        {/* ── Podium — top 3 ────────────────────────────────────────────────── */}
        <View style={styles.podiumRow}>
          {top3.map((entry, i) => {
            const medalColor = MEDAL_COLORS[i];
            const medal = getMedalEmoji(i + 1)!;
            return (
              <NeoBrutalAccent
                key={entry.id}
                accentColor={`${medalColor}18`}
                strokeColor={medalColor}
                shadowOffsetX={3}
                shadowOffsetY={3}
                borderWidth={1.5}
                borderRadius={14}
                style={{ flex: 1 }}
                contentStyle={styles.podiumContent}
              >
                <Emoji size={20}>{medal}</Emoji>
                {/* Mini avatar */}
                <View style={[styles.podiumAvatar, { backgroundColor: entry.avatarBg }]}>
                  <Text style={styles.podiumAvatarText}>{entry.initials}</Text>
                </View>
                <Text style={[styles.podiumName, { color: colors.textPrimary }]} numberOfLines={1}>
                  {entry.name.split(' ').pop()}
                </Text>
                <Text style={[styles.podiumXP, { color: medalColor }]}>
                  {entry.xp.toLocaleString()}
                </Text>
                <Text style={[styles.podiumXPLabel, { color: colors.textMuted }]}>XP</Text>
              </NeoBrutalAccent>
            );
          })}
        </View>

        {/* ── Rest of list (rank 4+) ─────────────────────────────────────────── */}
        {rest.length > 0 && (
          <NeoBrutalThemed
            shadowOffsetX={3}
            shadowOffsetY={3}
            borderWidth={1.5}
            borderRadius={14}
            style={{ marginTop: 10 }}
          >
            {rest.map((entry, i) => {
              const rank = i + 4;
              const isMe = entry.id === 'current';
              return (
                <View
                  key={entry.id}
                  style={[
                    styles.listRow,
                    i < rest.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.glassBorder },
                    isMe && { backgroundColor: `${colors.brandPrimary}0A` },
                  ]}
                >
                  <Text style={[styles.rankNum, { color: colors.textMuted }]}>{rank}</Text>

                  {/* Avatar circle */}
                  <View style={[styles.listAvatar, { backgroundColor: entry.avatarBg }]}>
                    <Text style={styles.listAvatarText}>{entry.initials}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={[styles.listName, { color: isMe ? colors.brandPrimary : colors.textPrimary }]}>
                      {entry.name}{isMe ? ' (Bạn)' : ''}
                    </Text>
                    <Text style={[styles.listStreak, { color: colors.textMuted }]}>
                      Chuỗi {entry.streak} ngày 🔥
                    </Text>
                  </View>

                  <Text style={[styles.listXP, { color: colors.textPrimary }]}>
                    {entry.xp.toLocaleString()} <Text style={{ color: colors.textMuted, fontSize: 10 }}>XP</Text>
                  </Text>
                </View>
              );
            })}
          </NeoBrutalThemed>
        )}

        {/* ── Quote card ────────────────────────────────────────────────────── */}
        <NeoBrutalBox
          borderColor={colors.glassBorder}
          backgroundColor={colors.bgSurface}
          shadowColor="#000"
          shadowOffsetX={3}
          shadowOffsetY={3}
          borderWidth={1.5}
          borderRadius={14}
          style={{ marginTop: 16 }}
          contentStyle={styles.quoteContent}
        >
          <Text style={[styles.quoteSymbol, { color: colors.brandPrimary }]}>✦</Text>
          <Text style={[styles.quoteText, { color: colors.textSecondary }]}>
            &quot;Bạn được xếp hạng bởi sự kiên trì, không phải kết quả.&quot;
          </Text>
        </NeoBrutalBox>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtnContent: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '800', textAlign: 'center' },

  // Tabs
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
  },
  tabPillContent: { paddingHorizontal: 16, paddingVertical: 6 },
  tabPillText: { fontSize: 13, fontWeight: '700' },

  // Scroll
  scrollContent: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 40 },

  // User card
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  userCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 18,
    paddingRight: 14,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 12,
  },
  userAvatarContent: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  userInfoName: { fontSize: 15, fontWeight: '700' },
  userInfoSub: { fontSize: 11, marginTop: 2 },
  userRankGap: { fontSize: 10, fontWeight: '600', marginTop: 3 },
  userXP: { fontSize: 16, fontWeight: '900', textAlign: 'right', lineHeight: 20 },
  userXPLabel: { fontSize: 10, fontWeight: '600' },
  userProgressWrap: { paddingHorizontal: 18, paddingBottom: 14 },

  // Section label
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.8,
    marginBottom: 10,
    marginTop: 4,
  },

  // Podium
  podiumRow: { flexDirection: 'row', gap: 10, marginBottom: 0 },
  podiumContent: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    gap: 4,
  },
  podiumAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  podiumAvatarText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  podiumName: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  podiumXP: { fontSize: 13, fontWeight: '900' },
  podiumXPLabel: { fontSize: 9, fontWeight: '600', marginTop: -2 },

  // List rows
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  rankNum: { width: 22, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  listAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listAvatarText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  listName: { fontSize: 14, fontWeight: '600' },
  listStreak: { fontSize: 11, marginTop: 1 },
  listXP: { fontSize: 14, fontWeight: '800' },

  // Quote
  quoteContent: { alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 6 },
  quoteSymbol: { fontSize: 18, fontWeight: '900' },
  quoteText: { fontSize: 13, fontStyle: 'italic', textAlign: 'center', lineHeight: 20 },
});
