import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAdaptiveDark } from '@/src/business-logic/hooks/useAdaptiveDark';
import { useUserStore } from '@/src/business-logic/stores/userStore';
import { useQuestManager } from '@/src/business-logic/hooks/useQuestManager';
import { useSkillTreeStore } from '@/src/business-logic/stores/skillTreeStore';

import { HomeGrid } from '@/src/ui/organisms/HomeGrid';
import { WellbeingWarningBanner } from '@/src/ui/organisms/WellbeingWarningBanner';
import { QuestCard } from '@/src/ui/molecules/QuestCard';
import { Avatar } from '@/src/ui/atoms/Avatar';
import { AppText } from '@/src/ui/atoms/Text';

import { Colors } from '@/src/ui/tokens/colors';
import { Spacing } from '@/src/ui/tokens/spacing';
import type { MoodScore, Branch } from '@/src/business-logic/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Chào buổi sáng!';
  if (hour >= 12 && hour < 18) return 'Chào buổi chiều!';
  return 'Chào buổi tối!';
}

const VIET_DAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

function getVietnameseDateString(): string {
  const now = new Date();
  const dayName = VIET_DAYS[now.getDay()];
  const day = now.getDate();
  const month = now.getMonth() + 1;
  return `${dayName}, ${day} tháng ${month}`;
}

// Derive branch progress from skill tree nodes
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

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function HomeScreen() {
  const router = useRouter();
  const { bgBase } = useAdaptiveDark();
  const { user } = useUserStore();
  const { quests, completeQuest, isLoading } = useQuestManager();
  const branchProgress = useBranchProgress();

  const [moodCheckedIn, setMoodCheckedIn] = useState(false);

  const stamina = user?.stamina ?? 100;
  const previewQuests = quests.slice(0, 3);

  const handleMoodSelect = (score: MoodScore) => {
    setMoodCheckedIn(true);
    // Score recorded via the MoodWidget callback — state update hides widget
    void score;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgBase }]} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ---------------------------------------------------------------- */}
        {/* Header                                                           */}
        {/* ---------------------------------------------------------------- */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <AppText variant="caption" color={Colors.textSecondary} style={styles.dateText}>
              {getVietnameseDateString()}
            </AppText>
            <AppText variant="title" color={Colors.textPrimary} style={styles.greetingText}>
              {getGreeting()}
            </AppText>
            {user?.name ? (
              <AppText variant="body" color={Colors.brandPrimary} style={styles.nameText}>
                {user.name}
              </AppText>
            ) : null}
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.bellButton}
              onPress={() => router.push('/notifications' as never)}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications-outline" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
            <Avatar
              uri={user?.avatar_url}
              name={user?.name}
              size="sm"
            />
          </View>
        </View>

        {/* ---------------------------------------------------------------- */}
        {/* Wellbeing Warning Banner (shown when stamina < 30)              */}
        {/* ---------------------------------------------------------------- */}
        <WellbeingWarningBanner stamina={stamina} showHotline={stamina === 0} />

        {/* ---------------------------------------------------------------- */}
        {/* Bento Grid                                                       */}
        {/* ---------------------------------------------------------------- */}
        <View style={styles.sectionGap} />
        <HomeGrid
          userName={user?.name ?? ''}
          level={user?.level ?? 1}
          currentXP={user?.current_xp_in_level ?? 0}
          targetXP={user?.xp_to_next_level ?? 100}
          streak={user?.streak ?? 0}
          stamina={stamina}
          pendingQuestCount={quests.filter((q) => q.completed_at === null).length}
          branchProgress={branchProgress}
          hasMoodToday={moodCheckedIn}
          onMoodSelect={handleMoodSelect}
        />

        {/* ---------------------------------------------------------------- */}
        {/* Daily Quest Preview                                              */}
        {/* ---------------------------------------------------------------- */}
        <View style={styles.sectionGap} />
        <View style={styles.sectionHeader}>
          <AppText variant="title" color={Colors.textPrimary}>
            Nhiệm vụ hôm nay
          </AppText>
          <TouchableOpacity onPress={() => router.push('/(tabs)/quests')} activeOpacity={0.7}>
            <AppText variant="caption" color={Colors.brandPrimary}>
              Xem tất cả
            </AppText>
          </TouchableOpacity>
        </View>

        <View style={styles.questList}>
          {isLoading || previewQuests.length === 0 ? (
            <View style={styles.emptyState}>
              <AppText variant="body" color={Colors.textSecondary}>
                Đang tải nhiệm vụ...
              </AppText>
            </View>
          ) : (
            previewQuests.map((quest) => (
              <QuestCard
                key={quest.quest_id}
                quest={quest}
                onComplete={completeQuest}
              />
            ))
          )}
        </View>

        {/* ---------------------------------------------------------------- */}
        {/* Bottom spacing (above tab bar)                                  */}
        {/* ---------------------------------------------------------------- */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 0,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerLeft: {
    flex: 1,
    gap: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 2,
  },
  dateText: {
    marginBottom: 2,
  },
  greetingText: {
    fontWeight: '700',
    fontSize: 20,
  },
  nameText: {
    fontWeight: '600',
    marginTop: 2,
  },
  bellButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Section spacing
  sectionGap: {
    height: Spacing.sectionGap,
  },

  // Quest section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.sm,
  },
  questList: {
    paddingHorizontal: Spacing.screenPadding,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },

  // Bottom
  bottomSpacer: {
    height: 100,
  },
});
