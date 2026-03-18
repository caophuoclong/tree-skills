import React, { useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useTheme } from '@/src/ui/tokens';
import type { SkillNode } from '@/src/business-logic/types';

const BRANCH_COLORS: Record<string, string> = {
  career: '#4DA8FF', finance: '#34D399', softskills: '#FBBF24', wellbeing: '#F472B6',
};

const STATUS_LABELS: Record<string, string> = {
  locked: '🔒 Locked',
  in_progress: '⚡ In Progress',
  completed: '✅ Completed',
};

interface SkillNodeSheetProps {
  node: SkillNode | null;
  onClose: () => void;
}

export function SkillNodeSheet({ node, onClose }: SkillNodeSheetProps) {
  const { colors } = useTheme();
  const translateY = useRef(new Animated.Value(500)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (node) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, stiffness: 300, damping: 28 }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 500, duration: 250, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [node]);

  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, gs) => gs.dy > 10,
    onPanResponderMove: (_, gs) => {
      if (gs.dy > 0) translateY.setValue(gs.dy);
    },
    onPanResponderRelease: (_, gs) => {
      if (gs.dy > 80 || gs.vy > 0.5) {
        onClose();
      } else {
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
      }
    },
  })).current;

  if (!node) return null;

  const branchColor = BRANCH_COLORS[node.branch] ?? colors.brandPrimary;
  const tierLabel = ['', 'Beginner', 'Intermediate', 'Advanced'][node.tier] ?? `Tier ${node.tier}`;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[styles.sheet, { backgroundColor: colors.bgElevated, borderColor: colors.textPrimary, transform: [{ translateY }] }]}
        {...panResponder.panHandlers}
      >
        {/* Branch accent bar */}
        <View style={[styles.accentBar, { backgroundColor: branchColor }]} />

        {/* Handle */}
        <View style={[styles.handle, { backgroundColor: colors.textMuted }]} />

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
          {/* Header */}
          <View style={styles.nodeHeader}>
            <View style={[styles.tierBadge, { backgroundColor: branchColor }]}>
              <Text style={[styles.tierText, { fontFamily: 'SpaceGrotesk-Bold' }]}>{tierLabel}</Text>
            </View>
            <View style={[styles.statusBadge, { borderColor: branchColor }]}>
              <Text style={[styles.statusText, { color: branchColor, fontFamily: 'SpaceGrotesk-Regular' }]}>
                {STATUS_LABELS[node.status]}
              </Text>
            </View>
          </View>

          <Text style={[styles.nodeTitle, { color: colors.textPrimary, fontFamily: 'SpaceGrotesk-Bold' }]}>
            {node.title}
          </Text>
          <Text style={[styles.nodeDesc, { color: colors.textSecondary, fontFamily: 'SpaceGrotesk-Regular' }]}>
            {node.description}
          </Text>

          {/* Locked state */}
          {node.status === 'locked' && (
            <View style={[styles.lockedBanner, { backgroundColor: `${colors.warning}22`, borderColor: colors.warning }]}>
              <Text style={[styles.lockedText, { color: colors.warning, fontFamily: 'SpaceGrotesk-SemiBold' }]}>
                🔒 Complete previous tier to unlock
              </Text>
              <Text style={[styles.lockedSub, { color: colors.textSecondary, fontFamily: 'SpaceGrotesk-Regular' }]}>
                Requires {node.xp_required} XP
              </Text>
            </View>
          )}

          {/* Progress for in-progress/completed */}
          {node.status !== 'locked' && (
            <View style={styles.progressSection}>
              <Text style={[styles.sectionLabel, { color: colors.textPrimary, fontFamily: 'SpaceGrotesk-SemiBold' }]}>
                Progress
              </Text>
              <View style={styles.progressRow}>
                <View style={[styles.progressBarBg, { backgroundColor: colors.bgSurface, borderColor: colors.textPrimary }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.min((node.quests_completed / Math.max(node.quests_total, 1)) * 100, 100)}%` as any,
                        backgroundColor: branchColor,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.progressLabel, { color: colors.textMuted, fontFamily: 'SpaceMono-Regular' }]}>
                  {node.quests_completed}/{node.quests_total}
                </Text>
              </View>

              {node.status === 'completed' && (
                <View style={[styles.completedStamp, { borderColor: colors.success }]}>
                  <Text style={[styles.completedText, { color: colors.success, fontFamily: 'SpaceGrotesk-Bold' }]}>
                    ✅ Node Complete! +{node.xp_required} XP earned
                  </Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Close button */}
        <TouchableOpacity style={[styles.closeBtn, { borderColor: colors.textPrimary, backgroundColor: colors.bgSurface }]} onPress={onClose}>
          <Text style={[styles.closeBtnText, { color: colors.textPrimary, fontFamily: 'SpaceGrotesk-Bold' }]}>Close</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const { height: SCREEN_H } = Dimensions.get('window');
const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    maxHeight: SCREEN_H * 0.75,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    borderWidth: 2, borderBottomWidth: 0,
  },
  accentBar: { height: 4, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginVertical: 12 },
  scroll: { paddingHorizontal: 20 },
  nodeHeader: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tierBadge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  tierText: { fontSize: 11, color: '#fff' },
  statusBadge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1.5 },
  statusText: { fontSize: 11 },
  nodeTitle: { fontSize: 22, marginBottom: 8 },
  nodeDesc: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  lockedBanner: { borderWidth: 2, borderRadius: 12, padding: 16, gap: 6, marginBottom: 16 },
  lockedText: { fontSize: 15 },
  lockedSub: { fontSize: 13 },
  progressSection: { gap: 10, marginBottom: 16 },
  sectionLabel: { fontSize: 15 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressBarBg: { flex: 1, height: 12, borderRadius: 6, borderWidth: 1.5, overflow: 'hidden' },
  progressBarFill: { height: '100%' },
  progressLabel: { fontSize: 12 },
  completedStamp: { borderWidth: 2, borderRadius: 10, padding: 12, alignItems: 'center' },
  completedText: { fontSize: 14 },
  closeBtn: { margin: 16, marginTop: 8, borderWidth: 2, borderRadius: 12, padding: 14, alignItems: 'center' },
  closeBtnText: { fontSize: 15 },
});
