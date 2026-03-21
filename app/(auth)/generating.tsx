import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AppText } from '@/src/ui/atoms/Text';
import { ProgressBar } from '@/src/ui/atoms/ProgressBar';
import { useTheme } from '@/src/ui/tokens';
import { Spacing } from '@/src/ui/tokens/spacing';

interface GenerationStatus {
  status: string;
  progress: number;
  current_step: string;
  skills_done: boolean;
  quests_done: boolean;
  skills_count: number;
  quests_count: number;
  error_message: string | null;
}

export default function GeneratingScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>({
    status: 'pending',
    progress: 0,
    current_step: 'Starting...',
    skills_done: false,
    quests_done: false,
    skills_count: 0,
    quests_count: 0,
    error_message: null,
  });
  const [progressValue, setProgressValue] = useState(0);
  const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const treeScale = useSharedValue(0.3);
  const treeOpacity = useSharedValue(0);

  useEffect(() => {
    // Tree entry animation
    treeOpacity.value = withTiming(1, { duration: 400 });
    treeScale.value = withSpring(1, { stiffness: 80, damping: 14 });

    // Start polling generation status
    const startPolling = async () => {
      const { supabase } = await import('@/src/business-logic/api/supabase');
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;

      // Cast for new table
      const db = supabase as any;

      const pollStatus = async () => {
        try {
          const { data, error } = await db
            .from('generation_tracking')
            .select('*')
            .eq('user_id', userId)
            .single();

          if (error) {
            console.log('[generating] Poll error:', error);
            return;
          }

          if (data) {
            setGenerationStatus(data);
            setProgressValue(data.progress || 0);

            // If completed or failed, navigate
            if (data.status === 'completed') {
              if (pollInterval.current) clearInterval(pollInterval.current);
              setTimeout(() => router.replace('/(auth)/reveal'), 500);
            } else if (data.status === 'failed') {
              console.error('[generating] Generation failed:', data.error_message);
              // Still navigate but user will see empty state
              if (pollInterval.current) clearInterval(pollInterval.current);
              setTimeout(() => router.replace('/(auth)/reveal'), 1000);
            }
          }
        } catch (err) {
          console.error('[generating] Poll exception:', err);
        }
      };

      // Poll immediately then every 1.5 seconds
      await pollStatus();
      pollInterval.current = setInterval(pollStatus, 1500);
    };

    startPolling();

    // Fallback timeout - navigate after 30 seconds max
    const timeout = setTimeout(() => {
      if (pollInterval.current) clearInterval(pollInterval.current);
      router.replace('/(auth)/reveal');
    }, 30000);

    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
      clearTimeout(timeout);
    };
  }, []);

  const treeStyle = useAnimatedStyle(() => ({
    opacity: treeOpacity.value,
    transform: [{ scale: treeScale.value }],
  }));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Tree */}
        <Animated.View style={[styles.treeContainer, treeStyle]}>
          <AppText style={styles.treeEmoji}>🌳</AppText>
        </Animated.View>

        <AppText variant="displayLG" style={styles.headline}>
          Creating your skill tree...
        </AppText>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <ProgressBar
            value={progressValue}
            color={colors.brandPrimary}
            variant="thick"
            animated={false}
          />
          <View style={styles.progressRow}>
            <AppText variant="body" color={colors.textSecondary}>
              {generationStatus.current_step}
            </AppText>
            <AppText variant="caption" color={colors.textMuted}>
              {Math.round(progressValue)}%
            </AppText>
          </View>
        </View>

        {/* Stats */}
        {(generationStatus.skills_done || generationStatus.quests_done) && (
          <View style={styles.statsRow}>
            {generationStatus.skills_done && (
              <AppText variant="caption" color={colors.textMuted}>
                ✅ {generationStatus.skills_count} skills generated
              </AppText>
            )}
            {generationStatus.quests_done && (
              <AppText variant="caption" color={colors.textMuted}>
                ✅ {generationStatus.quests_count} quests generated
              </AppText>
            )}
          </View>
        )}

        <AppText variant="body" color={colors.textMuted} style={styles.hint}>
          This may take a moment...
        </AppText>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.screenPadding,
    gap: Spacing.xl,
  },
  treeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  treeEmoji: {
    fontSize: 96,
  },
  headline: {
    color: colors.textPrimary,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    gap: Spacing.sm,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsRow: {
    gap: 4,
    alignItems: 'center',
  },
  hint: {
    textAlign: 'center',
    opacity: 0.6,
  },
});
