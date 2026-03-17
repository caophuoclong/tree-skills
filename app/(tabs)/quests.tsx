import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useQuestManager } from '@/src/business-logic/hooks/useQuestManager';
import { useStaminaSystem } from '@/src/business-logic/hooks/useStaminaSystem';
import type { LevelUpReward } from '@/src/business-logic/hooks/useXPEngine';
import { useUserStore } from '@/src/business-logic/stores/userStore';
import { QuestCard } from '@/src/ui/molecules/QuestCard';
import { LevelUpModal } from '@/src/ui/organisms/LevelUpModal';
import { AppText } from '@/src/ui/atoms/Text';
import { Colors } from '@/src/ui/tokens/colors';
import { Spacing, Radius } from '@/src/ui/tokens/spacing';
import type { Branch } from '@/src/business-logic/types/index';

type FilterKey = 'all' | Branch;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'career', label: 'Sự nghiệp' },
  { key: 'finance', label: 'Tài chính' },
  { key: 'softskills', label: 'Kỹ năng mềm' },
  { key: 'wellbeing', label: 'Sức khoẻ' },
];

function getTodayLabel(): string {
  const now = new Date();
  return now.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });
}

export default function QuestsScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [levelUpReward, setLevelUpReward] = useState<LevelUpReward | null>(null);

  const { quests, completedCount, totalCount, isLoading, completeQuest } = useQuestManager();
  const { stamina } = useStaminaSystem();
  const { user } = useUserStore();
  const prevLevelRef = useRef<number>(user?.level ?? 1);

  const handleCompleteQuest = useCallback(
    (questId: string) => {
      const prevLevel = prevLevelRef.current;
      completeQuest(questId);

      // Check for level up after completing quest
      // We read the user from store after completing
      const currentLevel = user?.level ?? 1;
      if (currentLevel > prevLevel) {
        const rewards: Record<number, string> = {
          2: 'Mở khóa nhiệm vụ khó hơn',
          3: 'Mở khóa nhánh kỹ năng mới',
          4: 'Mở khóa thống kê chi tiết',
          5: 'Mở khóa bảng xếp hạng',
          6: 'Mở khóa nhiệm vụ cộng đồng',
          7: 'Mở khóa mentor badges',
          8: 'Mở khóa danh hiệu đặc biệt',
          9: 'Mở khóa chế độ thử thách',
          10: 'Danh hiệu Grandmaster',
        };
        setLevelUpReward({
          level: currentLevel,
          message: `Lên level ${currentLevel}!`,
          unlocks: rewards[currentLevel] ?? 'Tiếp tục phát triển',
        });
        prevLevelRef.current = currentLevel;
      }
    },
    [completeQuest, user?.level],
  );

  const handlePressQuest = useCallback((questId: string) => {
    router.push(`/quest/${questId}`);
  }, []);

  const filteredQuests =
    activeFilter === 'all' ? quests : quests.filter((q) => q.branch === activeFilter);

  const showStaminaWarning = stamina < 30 && stamina > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Sticky header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <AppText variant="title" color={Colors.textPrimary}>
              Nhiệm vụ Hôm Nay
            </AppText>
            <AppText variant="caption" color={Colors.textMuted} style={styles.dateText}>
              {getTodayLabel()}
            </AppText>
          </View>
          <View style={styles.progressPill}>
            <AppText variant="caption" color={Colors.brandPrimary}>
              {completedCount}/{totalCount} hoàn thành
            </AppText>
          </View>
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          style={styles.filterScroll}
        >
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter.key;
            return (
              <TouchableOpacity
                key={filter.key}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveFilter(filter.key)}
                activeOpacity={0.8}
              >
                <AppText
                  variant="caption"
                  color={isActive ? '#FFFFFF' : Colors.textSecondary}
                  style={styles.filterLabel}
                >
                  {filter.label}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Scrollable content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stamina warning banner */}
        {showStaminaWarning && (
          <View style={styles.staminaWarning}>
            <Ionicons name="warning-outline" size={18} color={Colors.warning} />
            <AppText variant="caption" color={Colors.warning} style={styles.warningText}>
              Năng lượng thấp! Chỉ có thể làm nhiệm vụ Sức khoẻ để phục hồi.
            </AppText>
          </View>
        )}

        {/* Loading state */}
        {isLoading && (
          <View style={styles.centered}>
            <ActivityIndicator color={Colors.brandPrimary} size="large" />
          </View>
        )}

        {/* Empty state */}
        {!isLoading && filteredQuests.length === 0 && (
          <View style={styles.emptyState}>
            <AppText style={styles.emptyIcon}>🌱</AppText>
            <AppText variant="body" color={Colors.textSecondary} style={styles.emptyText}>
              {quests.length === 0
                ? 'Không có nhiệm vụ. Hoàn thành onboarding để nhận nhiệm vụ!'
                : 'Không có nhiệm vụ cho bộ lọc này.'}
            </AppText>
          </View>
        )}

        {/* Quest list */}
        {!isLoading &&
          filteredQuests.map((quest) => (
            <QuestCard
              key={quest.quest_id}
              quest={quest}
              onComplete={handleCompleteQuest}
              onPress={handlePressQuest}
            />
          ))}
      </ScrollView>

      {/* Level Up Modal */}
      <LevelUpModal
        visible={levelUpReward !== null}
        newLevel={levelUpReward?.level ?? 1}
        unlockReward={levelUpReward?.unlocks}
        onDismiss={() => setLevelUpReward(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },
  header: {
    backgroundColor: Colors.bgBase,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  dateText: {
    marginTop: Spacing.xs,
  },
  progressPill: {
    backgroundColor: `${Colors.brandPrimary}1A`,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: `${Colors.brandPrimary}33`,
    marginTop: 4,
  },
  filterScroll: {
    marginHorizontal: -Spacing.screenPadding,
  },
  filterRow: {
    paddingHorizontal: Spacing.screenPadding,
    gap: Spacing.sm,
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  filterChipActive: {
    backgroundColor: Colors.brandPrimary,
    borderColor: Colors.brandPrimary,
  },
  filterLabel: {
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.screenPadding,
    paddingBottom: Spacing['2xl'],
  },
  staminaWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: `${Colors.warning}1A`,
    borderWidth: 1,
    borderColor: `${Colors.warning}33`,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  warningText: {
    flex: 1,
  },
  centered: {
    paddingVertical: Spacing['2xl'],
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
    gap: Spacing.sm,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
});
