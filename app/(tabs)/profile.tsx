import { router } from 'expo-router';
import { useMemo } from 'react';
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useProfileScreen } from '@/src/hooks/useProfileScreen';
import {
  Emoji,
  NeoBrutalBox,
  NeoBrutalThemed,
} from '@/src/ui/atoms';
import {
  BranchProgressList,
  ProfileHeader,
  ProfileStatsRow,
  WeeklyChart,
} from '@/src/ui/molecules';
import { AchievementBadgesSection } from '@/src/ui/organisms/AchievementBadgesSection';
import { HabitHeatmap } from '@/src/ui/organisms/HabitHeatmap';
import {
  ProfileMilestoneBadges,
  ProfileNavSection,
} from '@/src/ui/organisms';
import { IColors, useTheme } from '@/src/ui/tokens';

function getInitials(name: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function ProfileScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const {
    name,
    level,
    currentXP,
    streak,
    bestStreak,
    weeklyActivity,
    careerPct,
    financePct,
    softPct,
    wellPct,
    milestones,
    stats,
    logout,
    premiumShimmer,
  } = useProfileScreen();

  const initials = getInitials(name);

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
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.bgBase }]}
      edges={['top']}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader
          name={name}
          level={level}
          totalXP={currentXP}
          initials={initials}
        />

        <NeoBrutalBox
          borderColor={colors.brandPrimary}
          shadowColor="#000"
          shadowOffsetX={4}
          shadowOffsetY={4}
          borderWidth={2}
          style={{ marginHorizontal: 20 }}
          contentStyle={styles.premiumContent}
          onPress={() => {}}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              styles.premiumShimmer,
              {
                transform: [
                  { translateX: premiumShimmer },
                  { skewX: '-18deg' },
                ],
              },
            ]}
          />
          <Text style={[styles.premiumStar, { color: colors.brandPrimary }]}>
            ✦
          </Text>
          <Text style={[styles.premiumTitle, { color: colors.textPrimary }]}>
            PREMIUM PLAN · ACTIVE
          </Text>
          <Text style={[styles.premiumRenew, { color: colors.textMuted }]}>
            Expires 17 Apr
          </Text>
        </NeoBrutalBox>

        <NeoBrutalBox
          borderColor={colors.warning}
          backgroundColor={colors.bgElevated}
          shadowColor={colors.warning}
          shadowOffsetX={5}
          shadowOffsetY={5}
          borderWidth={2}
          borderRadius={16}
          style={{ marginHorizontal: 20, marginTop: 16 }}
          contentStyle={styles.streakContent}
        >
          <View style={[styles.accentBar, { backgroundColor: colors.warning }]} />
          <Text style={[styles.streakTitle, { color: colors.textPrimary }]}>
            <Emoji size={18}>🔥</Emoji> STREAK: {streak ?? 0} DAYS
          </Text>
          <Text style={[styles.streakBest, { color: colors.textSecondary }]}>
            Best record: {bestStreak ?? 0} days
          </Text>
        </NeoBrutalBox>

        <ProfileStatsRow stats={stats} />

        <HabitHeatmap />

        <ProfileMilestoneBadges milestones={milestones} />

        <AchievementBadgesSection />

        <View style={{ marginHorizontal: 20, marginTop: 24 }}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            THIS WEEK
          </Text>
          <NeoBrutalThemed
            shadowOffsetX={4}
            shadowOffsetY={4}
            borderWidth={2}
            borderRadius={16}
            contentStyle={{ paddingVertical: 20, paddingHorizontal: 16 }}
          >
            <WeeklyChart data={weeklyActivity} />
          </NeoBrutalThemed>
        </View>

        <BranchProgressList
          branches={[
            { label: 'Sự nghiệp', percent: careerPct, color: colors.career, emoji: '💼' },
            { label: 'Tài chính', percent: financePct, color: colors.finance, emoji: '💰' },
            { label: 'Kỹ năng mềm', percent: softPct, color: colors.softskills, emoji: '💬' },
            { label: 'Sức khỏe', percent: wellPct, color: colors.wellbeing, emoji: '🧘' },
          ]}
        />

        <ProfileNavSection onLogout={handleLogout} />

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: IColors) =>
  StyleSheet.create({
    container: { flex: 1 },
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 40 },

    premiumContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 8,
      position: 'relative',
      overflow: 'hidden',
    },
    premiumShimmer: {
      position: 'absolute',
      top: -8,
      bottom: -8,
      width: 72,
      backgroundColor: `${colors.brandPrimary}22`,
    },
    premiumStar: { fontSize: 16 },
    premiumTitle: {
      fontSize: 12,
      fontWeight: '900',
      flex: 1,
      letterSpacing: 0.5,
    },
    premiumRenew: {
      fontSize: 10,
      fontFamily: 'SpaceGrotesk-SemiBold',
      fontWeight: '600',
    },

    streakContent: {
      alignItems: 'center',
      paddingVertical: 20,
      paddingHorizontal: 20,
    },
    accentBar: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 6,
    },
    streakTitle: { fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
    streakBest: {
      fontSize: 10,
      fontFamily: 'SpaceGrotesk-SemiBold',
      fontWeight: '600',
      marginTop: 6,
    },

    sectionTitle: {
      fontSize: 13,
      fontWeight: '900',
      marginBottom: 14,
      letterSpacing: 1.2,
    },
  });
