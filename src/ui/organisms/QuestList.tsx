import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { QuestCard } from '@/src/ui/molecules/QuestCard';
import { StaminaBar } from '@/src/ui/molecules/StaminaBar';
import { AppText } from '@/src/ui/atoms/Text';
import { Emoji } from '@/src/ui/atoms/Emoji';
import { GlassView } from '@/src/ui/atoms/GlassView';
import { WarningIcon } from '@/src/ui/atoms';
import { useTheme } from '@/src/ui/tokens';

import { Spacing, Radius } from '@/src/ui/tokens/spacing';
import type { Quest } from '@/src/business-logic/types';

interface QuestListProps {
  quests: Quest[];
  stamina: number;
  resetTime?: string;
  onCompleteQuest: (questId: string) => void;
  onPressQuest: (questId: string) => void;
}

export function QuestList({ quests, stamina, resetTime, onCompleteQuest, onPressQuest }: QuestListProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const completedCount = quests.filter((q) => q.completed_at !== null).length;
  const isStaminaGate = stamina === 0;

  // Hard gate: only wellbeing quests when stamina = 0
  const visibleQuests = isStaminaGate
    ? quests.filter((q) => q.branch === 'wellbeing')
    : quests;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <AppText variant="title" color={colors.textPrimary}>
          Daily Quests
        </AppText>
        <View style={styles.progressPill}>
          <AppText variant="caption" color={colors.brandPrimary}>
            {completedCount}/{quests.length} hoàn thành
          </AppText>
        </View>
      </View>

      {resetTime && (
        <AppText variant="micro" color={colors.textMuted} style={styles.resetTime}>
          Reset lúc {resetTime}
        </AppText>
      )}

      {/* Stamina mini bar */}
      <View style={styles.staminaSection}>
        <StaminaBar value={stamina} />
      </View>

      {/* Stamina gate warning */}
      {isStaminaGate && (
        <GlassView style={styles.gateWarning}>
          <WarningIcon size={16} color={colors.danger} />
          <AppText variant="caption" color={colors.danger} style={styles.gateText}>
            Stamina = 0%. Hoàn thành Wellbeing quest trước để tiếp tục.
          </AppText>
        </GlassView>
      )}

      {/* Quest cards */}
      {visibleQuests.length > 0 ? (
        visibleQuests.map((quest) => (
          <QuestCard
            key={quest.quest_id}
            quest={quest}
            onComplete={onCompleteQuest}
            onPress={onPressQuest}
          />
        ))
      ) : (
        <View style={styles.emptyState}>
          <Emoji size={40}>🌱</Emoji>
          <AppText variant="body" color={colors.textSecondary} style={styles.emptyText}>
            Không có quest hôm nay — quay lại ngày mai!
          </AppText>
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: { gap: Spacing.sm },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  progressPill: {
    backgroundColor: `${colors.brandPrimary}1A`,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  resetTime: {
    marginTop: -Spacing.xs,
    marginBottom: Spacing.xs,
  },
  staminaSection: {
    marginBottom: Spacing.sm,
  },
  gateWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderColor: `${colors.danger}33`,
    marginBottom: Spacing.sm,
  },
  gateText: { flex: 1 },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
    gap: Spacing.sm,
  },
  emptyIcon: { fontSize: 40 },
  emptyText: { textAlign: 'center' },
});
