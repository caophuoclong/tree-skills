import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/ui/tokens';
import { useQuestStore } from '@/src/business-logic/stores/questStore';
import { useUserStore } from '@/src/business-logic/stores/userStore';
import type { Branch, MoodScore } from '@/src/business-logic/types';

const BRANCH_OPTIONS: { branch: Branch; label: string; emoji: string; color: string }[] = [
  { branch: 'career', label: 'Career', emoji: '💼', color: '#4DA8FF' },
  { branch: 'finance', label: 'Finance', emoji: '💰', color: '#34D399' },
  { branch: 'softskills', label: 'Soft Skills', emoji: '🤝', color: '#FBBF24' },
  { branch: 'wellbeing', label: 'Wellbeing', emoji: '🧘', color: '#F472B6' },
];

const MOOD_OPTIONS: { score: MoodScore; emoji: string; label: string }[] = [
  { score: 1, emoji: '😞', label: 'Rough' },
  { score: 2, emoji: '😕', label: 'Meh' },
  { score: 3, emoji: '😐', label: 'OK' },
  { score: 4, emoji: '🙂', label: 'Good' },
  { score: 5, emoji: '😄', label: 'Great' },
];

type SheetType = 'log' | 'mood' | null;

export default function FABMenu() {
  const { colors } = useTheme();
  const router = useRouter();
  const { dailyQuests } = useQuestStore();
  const { incrementDailyQuestCount } = useUserStore();

  const [isOpen, setIsOpen] = useState(false);
  const [activeSheet, setActiveSheet] = useState<SheetType>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch>('career');
  const [activityNote, setActivityNote] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodScore | null>(null);

  const menuScale = useRef(new Animated.Value(0)).current;
  const menuOpacity = useRef(new Animated.Value(0)).current;
  const fabRotation = useRef(new Animated.Value(0)).current;
  const sheetY = useRef(new Animated.Value(400)).current;

  const openMenu = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsOpen(true);
    Animated.parallel([
      Animated.spring(menuScale, { toValue: 1, useNativeDriver: true, stiffness: 300, damping: 25 }),
      Animated.timing(menuOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(fabRotation, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    Animated.parallel([
      Animated.spring(menuScale, { toValue: 0, useNativeDriver: true, stiffness: 400, damping: 30 }),
      Animated.timing(menuOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fabRotation, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start();
  }, []);

  const openSheet = useCallback(
    (type: SheetType) => {
      closeMenu();
      setActiveSheet(type);
      sheetY.setValue(400);
      Animated.spring(sheetY, { toValue: 0, useNativeDriver: true, stiffness: 300, damping: 28 }).start();
    },
    [closeMenu],
  );

  const closeSheet = useCallback(() => {
    Animated.timing(sheetY, { toValue: 400, duration: 250, useNativeDriver: true }).start(() => {
      setActiveSheet(null);
      setActivityNote('');
      setSelectedMood(null);
    });
  }, []);

  const handleSuggestedQuest = useCallback(() => {
    closeMenu();
    const easyIncomplete = dailyQuests.filter(q => q.difficulty === 'easy' && !q.completed_at);
    const allIncomplete = dailyQuests.filter(q => !q.completed_at);
    const pick = easyIncomplete[0] ?? allIncomplete[0] ?? dailyQuests[0];
    if (pick) router.push(`/quest/${pick.quest_id}` as any);
  }, [dailyQuests, closeMenu, router]);

  const handleLogActivity = useCallback(() => {
    if (!activityNote.trim()) return;
    incrementDailyQuestCount(selectedBranch);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    closeSheet();
  }, [activityNote, selectedBranch, incrementDailyQuestCount, closeSheet]);

  const handleMoodSubmit = useCallback(() => {
    if (!selectedMood) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    closeSheet();
  }, [selectedMood, closeSheet]);

  const fabRotationDeg = fabRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const menuActions = [
    { icon: '📝', label: 'Log Activity', onPress: () => openSheet('log') },
    { icon: '⚡', label: 'Suggested Quest', onPress: handleSuggestedQuest },
    { icon: '🌿', label: 'Mood Check-in', onPress: () => openSheet('mood') },
  ];

  return (
    <View style={styles.container} pointerEvents="box-none">
      {isOpen && <Pressable style={styles.backdrop} onPress={closeMenu} />}

      {/* Stacked action menu */}
      <Animated.View
        style={[styles.menuContainer, { opacity: menuOpacity, transform: [{ scale: menuScale }] }]}
        pointerEvents={isOpen ? 'auto' : 'none'}
      >
        {menuActions.map((action, i) => (
          <TouchableOpacity key={i} style={styles.menuItem} onPress={action.onPress} activeOpacity={0.85}>
            <View style={[styles.menuShadow, { backgroundColor: colors.textPrimary }]} />
            <View style={[styles.menuItemInner, { backgroundColor: colors.bgSurface, borderColor: colors.textPrimary }]}>
              <Text style={styles.menuItemIcon}>{action.icon}</Text>
              <Text style={[styles.menuItemLabel, { color: colors.textPrimary, fontFamily: 'SpaceGrotesk-SemiBold' }]}>
                {action.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {/* FAB button */}
      <View style={styles.fabWrapper}>
        <View style={[styles.fabShadow, { backgroundColor: colors.textPrimary }]} />
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.brandPrimary, borderColor: colors.textPrimary }]}
          onPress={isOpen ? closeMenu : openMenu}
          activeOpacity={0.9}
        >
          <Animated.Text style={[styles.fabIcon, { transform: [{ rotate: fabRotationDeg }] }]}>+</Animated.Text>
        </TouchableOpacity>
      </View>

      {/* Sheet backdrop */}
      {activeSheet && <Pressable style={styles.sheetBackdrop} onPress={closeSheet} />}

      {/* Bottom sheet */}
      {activeSheet && (
        <Animated.View
          style={[
            styles.sheet,
            { backgroundColor: colors.bgElevated, borderColor: colors.textPrimary, transform: [{ translateY: sheetY }] },
          ]}
        >
          <View style={[styles.sheetHandle, { backgroundColor: colors.textMuted }]} />

          {activeSheet === 'log' && (
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <Text style={[styles.sheetTitle, { color: colors.textPrimary, fontFamily: 'SpaceGrotesk-Bold' }]}>
                📝 Log Activity
              </Text>
              <Text style={[styles.sheetSub, { color: colors.textSecondary, fontFamily: 'SpaceGrotesk-Regular' }]}>
                Which skill branch?
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.branchRow}>
                {BRANCH_OPTIONS.map(b => (
                  <TouchableOpacity
                    key={b.branch}
                    style={[
                      styles.branchPill,
                      { borderColor: b.color, backgroundColor: selectedBranch === b.branch ? b.color : 'transparent' },
                    ]}
                    onPress={() => setSelectedBranch(b.branch)}
                  >
                    <Text
                      style={[
                        styles.branchPillText,
                        { color: selectedBranch === b.branch ? '#fff' : b.color, fontFamily: 'SpaceGrotesk-SemiBold' },
                      ]}
                    >
                      {b.emoji} {b.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TextInput
                style={[
                  styles.noteInput,
                  {
                    color: colors.textPrimary,
                    borderColor: colors.textPrimary,
                    backgroundColor: colors.bgSurface,
                    fontFamily: 'SpaceGrotesk-Regular',
                  },
                ]}
                placeholder="What did you do? e.g. read 20 pages, ran 5km…"
                placeholderTextColor={colors.textMuted}
                value={activityNote}
                onChangeText={setActivityNote}
                multiline
                numberOfLines={3}
              />
              <View style={styles.submitWrapper}>
                <View style={[styles.submitShadow, { backgroundColor: colors.textPrimary }]} />
                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    { backgroundColor: colors.brandPrimary, borderColor: colors.textPrimary, opacity: activityNote.trim() ? 1 : 0.4 },
                  ]}
                  onPress={handleLogActivity}
                  disabled={!activityNote.trim()}
                >
                  <Text style={[styles.submitBtnText, { fontFamily: 'SpaceGrotesk-Bold' }]}>Log It ✓</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          )}

          {activeSheet === 'mood' && (
            <View>
              <Text style={[styles.sheetTitle, { color: colors.textPrimary, fontFamily: 'SpaceGrotesk-Bold' }]}>
                🌿 How are you feeling?
              </Text>
              <View style={styles.moodRow}>
                {MOOD_OPTIONS.map(m => (
                  <TouchableOpacity
                    key={m.score}
                    style={[
                      styles.moodOption,
                      {
                        borderColor: selectedMood === m.score ? colors.brandPrimary : colors.textMuted,
                        backgroundColor: selectedMood === m.score ? `${colors.brandPrimary}22` : 'transparent',
                      },
                    ]}
                    onPress={() => setSelectedMood(m.score)}
                  >
                    <Text style={styles.moodEmoji}>{m.emoji}</Text>
                    <Text style={[styles.moodLabel, { color: colors.textSecondary, fontFamily: 'SpaceGrotesk-Regular' }]}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.submitWrapper}>
                <View style={[styles.submitShadow, { backgroundColor: colors.textPrimary }]} />
                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    { backgroundColor: colors.wellbeing, borderColor: colors.textPrimary, opacity: selectedMood ? 1 : 0.4 },
                  ]}
                  onPress={handleMoodSubmit}
                  disabled={!selectedMood}
                >
                  <Text style={[styles.submitBtnText, { fontFamily: 'SpaceGrotesk-Bold' }]}>Save Mood ✓</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'flex-end' } as any,
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  menuContainer: { position: 'absolute', bottom: 110, right: 24, gap: 10, alignItems: 'flex-end' },
  menuItem: { position: 'relative', marginBottom: 2 },
  menuShadow: { position: 'absolute', top: 3, left: 3, right: -3, bottom: -3, borderRadius: 12 },
  menuItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  menuItemIcon: { fontSize: 18 },
  menuItemLabel: { fontSize: 14 },
  fabWrapper: { position: 'absolute', bottom: 28, alignSelf: 'center' },
  fabShadow: { position: 'absolute', top: 4, left: 4, width: 56, height: 56, borderRadius: 28 },
  fab: { width: 56, height: 56, borderRadius: 28, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  fabIcon: { fontSize: 28, color: '#fff', lineHeight: 32 },
  sheetBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 2,
    borderBottomWidth: 0,
    padding: 24,
    paddingBottom: 48,
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  sheetTitle: { fontSize: 20, marginBottom: 6 },
  sheetSub: { fontSize: 14, marginBottom: 10 },
  branchRow: { marginBottom: 14 },
  branchPill: { borderWidth: 2, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8 },
  branchPillText: { fontSize: 13 },
  noteInput: {
    borderWidth: 2,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitWrapper: { position: 'relative' },
  submitShadow: { position: 'absolute', top: 4, left: 4, right: -4, bottom: -4, borderRadius: 12, zIndex: 0 },
  submitBtn: { borderWidth: 2.5, borderRadius: 12, padding: 14, alignItems: 'center', position: 'relative', zIndex: 1 },
  submitBtnText: { fontSize: 16, color: '#fff' },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, marginTop: 8 },
  moodOption: { alignItems: 'center', gap: 4, padding: 10, borderWidth: 2, borderRadius: 12, flex: 1, marginHorizontal: 3 },
  moodEmoji: { fontSize: 26 },
  moodLabel: { fontSize: 11 },
});
