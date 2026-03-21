import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
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
import { NeoBrutalBox } from '@/src/ui/atoms';
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
  const { colors, isDark } = useTheme();
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
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasNavigated = useRef(false);

  const treeScale = useSharedValue(0.3);
  const treeOpacity = useSharedValue(0);

  // Fetch data from DB after completion
  const fetchGeneratedData = useCallback(async () => {
    console.log('[generating] Fetching generated data from DB...');
    setIsFetchingData(true);

    try {
      const { supabase } = await import('@/src/business-logic/api/supabase');
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;

      // Fetch user's skill nodes
      const { data: skillNodes } = await supabase
        .from('user_skill_nodes')
        .select(`
          node_id,
          status,
          quests_completed,
          skill_nodes (
            node_id, branch, tier, title, description, xp_required, quests_total
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'in_progress');

      console.log('[generating] Fetched skill nodes:', skillNodes?.length);

      // Fetch today's quests
      const today = new Date().toISOString().split('T')[0];
      const { data: quests } = await supabase
        .from('user_quests')
        .select(`
          quest_id,
          completed_at,
          quests (
            quest_id, title, description, branch, difficulty, duration_min, xp_reward, node_id
          )
        `)
        .eq('user_id', userId)
        .eq('date', today);

      console.log('[generating] Fetched quests:', quests?.length);

    } catch (err) {
      console.error('[generating] Error fetching data:', err);
    } finally {
      setIsFetchingData(false);
    }
  }, []);

  const navigateToReveal = useCallback(async () => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    console.log('[generating] Navigating to reveal');
    if (pollInterval.current) clearInterval(pollInterval.current);

    // Fetch data before navigating
    await fetchGeneratedData();

    router.replace('/(auth)/reveal');
  }, [fetchGeneratedData]);

  useEffect(() => {
    // Tree entry animation
    treeOpacity.value = withTiming(1, { duration: 400 });
    treeScale.value = withSpring(1, { stiffness: 80, damping: 14 });

    // Start polling generation status
    const startPolling = async () => {
      const { supabase } = await import('@/src/business-logic/api/supabase');
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) {
        console.log('[generating] No userId, navigating to reveal');
        navigateToReveal();
        return;
      }

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
            console.log('[generating] Status:', data.status, 'Progress:', data.progress);
            setGenerationStatus(data);
            setProgressValue(data.progress || 0);

            // Only navigate when truly completed
            if (data.status === 'completed') {
              console.log('[generating] Generation completed!');
              navigateToReveal();
            } else if (data.status === 'failed') {
              console.error('[generating] Generation failed:', data.error_message);
              // Navigate anyway after showing error briefly
              setTimeout(() => navigateToReveal(), 2000);
            }
          } else {
            console.log('[generating] No tracking data found');
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

    // Show timeout indicator after 30 seconds
    const timeoutWarning = setTimeout(() => {
      if (!hasNavigated.current) {
        console.log('[generating] Showing timeout indicator');
        setIsTimedOut(true);
      }
    }, 30000);

    // Fallback timeout - only navigate if still not complete after 120 seconds
    const timeout = setTimeout(() => {
      console.log('[generating] Fallback timeout - status:', generationStatus.status);
      if (generationStatus.status !== 'completed' && !hasNavigated.current) {
        console.warn('[generating] Timeout reached, navigating anyway');
        navigateToReveal();
      }
    }, 120000);

    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
      clearTimeout(timeoutWarning);
      clearTimeout(timeout);
    };
  }, [navigateToReveal]);

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
          {isFetchingData ? 'Loading your data...' : 'This may take a moment...'}
        </AppText>

        {/* Timeout floating indicator at bottom */}
        {isTimedOut && !hasNavigated.current && (
          <View style={styles.timeoutContainer}>
            <NeoBrutalBox
              shadowOffsetX={4}
              shadowOffsetY={4}
              shadowColor="#000"
              borderColor={colors.warning}
              backgroundColor={isDark ? '#1E1E22' : '#FFF'}
              borderWidth={2}
              borderRadius={12}
              contentStyle={styles.timeoutContent}
            >
              <ActivityIndicator size="small" color={colors.warning} />
              <View style={styles.timeoutTextCol}>
                <AppText variant="body" color={colors.textPrimary}>
                  Still generating...
                </AppText>
                <AppText variant="caption" color={colors.textMuted}>
                  {generationStatus.current_step}
                </AppText>
              </View>
            </NeoBrutalBox>
          </View>
        )}
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
  timeoutContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  timeoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  timeoutTextCol: {
    flex: 1,
    gap: 2,
  },
});
