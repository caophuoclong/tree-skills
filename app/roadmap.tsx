import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRoadmapStore } from '@/src/business-logic/stores/roadmapStore';
import type { TimeHorizon } from '@/src/business-logic/types';
import { NeoBrutalBox, ProgressBar } from '@/src/ui/atoms';
import { RoadmapHorizonSection } from '@/src/ui/organisms';
import { Spacing, Radius } from '@/src/ui/tokens/spacing';
import { useTheme } from '@/src/ui/tokens';

export default function RoadmapScreen() {
  const { colors } = useTheme();
  const milestones = useRoadmapStore((s) => s.milestones);
  const addMilestone = useRoadmapStore((s) => s.addMilestone);
  const toggleMilestone = useRoadmapStore((s) => s.toggleMilestone);
  const deleteMilestone = useRoadmapStore((s) => s.deleteMilestone);

  const styles = createStyles(colors);

  // Separate milestones by horizon
  const shortMilestones = useMemo(
    () => milestones.filter((m) => m.horizon === 'short'),
    [milestones]
  );
  const midMilestones = useMemo(
    () => milestones.filter((m) => m.horizon === 'mid'),
    [milestones]
  );
  const longMilestones = useMemo(
    () => milestones.filter((m) => m.horizon === 'long'),
    [milestones]
  );

  // Calculate progress
  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter((m) => m.isCompleted).length;
  const progressPercent =
    totalMilestones === 0 ? 0 : Math.round((completedMilestones / totalMilestones) * 100);

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
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
              Lộ Trình Dài Hạn
            </Text>
            <View style={{ width: 24 }} />
          </View>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            Kế hoạch phát triển của bạn
          </Text>
        </View>

        {/* Progress summary */}
        <View style={[styles.progressSection, { marginHorizontal: Spacing.screenPadding }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressText, { color: colors.textPrimary }]}>
              {completedMilestones}/{totalMilestones} mục tiêu hoàn thành
            </Text>
          </View>
          <ProgressBar
            percent={progressPercent}
            accentColor={colors.brandPrimary}
            backgroundColor={colors.bgElevated}
            height={6}
            borderRadius={Radius.full}
          />
        </View>

        {/* Three horizon sections */}
        <RoadmapHorizonSection
          horizon="short"
          milestones={shortMilestones}
          onToggle={toggleMilestone}
          onDelete={deleteMilestone}
          onAddMilestone={(title, branch) =>
            addMilestone(title, branch, 'short')
          }
        />

        <RoadmapHorizonSection
          horizon="mid"
          milestones={midMilestones}
          onToggle={toggleMilestone}
          onDelete={deleteMilestone}
          onAddMilestone={(title, branch) =>
            addMilestone(title, branch, 'mid')
          }
        />

        <RoadmapHorizonSection
          horizon="long"
          milestones={longMilestones}
          onToggle={toggleMilestone}
          onDelete={deleteMilestone}
          onAddMilestone={(title, branch) =>
            addMilestone(title, branch, 'long')
          }
        />

        {/* Spacer */}
        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1 },
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 40 },

    // Header
    headerContainer: {
      marginHorizontal: Spacing.screenPadding,
      marginTop: Spacing.md,
      marginBottom: Spacing.lg,
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.sm,
    },
    backBtn: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: -Spacing.xs,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: '900',
      fontFamily: 'SpaceGrotesk-Bold',
      letterSpacing: 0.5,
      textAlign: 'center',
      flex: 1,
    },
    headerSubtitle: {
      fontSize: 13,
      fontFamily: 'SpaceGrotesk-Medium',
      fontWeight: '500',
      letterSpacing: 0.3,
    },

    // Progress summary
    progressSection: {
      marginBottom: Spacing.lg,
      gap: Spacing.sm,
    },
    progressHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    progressText: {
      fontSize: 12,
      fontWeight: '600',
      fontFamily: 'SpaceGrotesk-SemiBold',
      letterSpacing: 0.3,
    },
  });
