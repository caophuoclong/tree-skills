import React, { useState, useEffect, useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { GlassView } from '@/src/ui/atoms/GlassView';
import { AppText } from '@/src/ui/atoms/Text';
import { useTheme } from '@/src/ui/tokens';
import { Spacing, Radius } from '@/src/ui/tokens/spacing';
import type { MoodScore } from '@/src/business-logic/types';

const MOODS: { score: MoodScore; emoji: string; label: string }[] = [
  { score: 1, emoji: '😔', label: 'Rất tệ' },
  { score: 2, emoji: '😕', label: 'Tệ' },
  { score: 3, emoji: '😐', label: 'Bình thường' },
  { score: 4, emoji: '🙂', label: 'Tốt' },
  { score: 5, emoji: '😊', label: 'Rất tốt' },
];

interface MoodWidgetProps {
  onSelect?: (score: MoodScore) => void;
  selectedScore?: MoodScore | null;
}

function MoodEmoji({
  mood,
  selected,
  onPress,
}: {
  mood: (typeof MOODS)[0];
  selected: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const scale = useSharedValue(selected ? 1.3 : 1);

  useEffect(() => {
    scale.value = withSpring(selected ? 1.3 : 1, { stiffness: 300, damping: 20 });
  }, [selected]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.emojiButton}>
      <Animated.View
        style={[styles.emojiWrap, selected && styles.emojiSelected, animStyle]}
      >
        <AppText style={styles.emojiText}>{mood.emoji}</AppText>
      </Animated.View>
    </TouchableOpacity>
  );
}

export function MoodWidget({ onSelect, selectedScore }: MoodWidgetProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [selected, setSelected] = useState<MoodScore | null>(selectedScore ?? null);

  const handleSelect = (score: MoodScore) => {
    setSelected(score);
    Haptics.selectionAsync();
    onSelect?.(score);
  };

  return (
    <GlassView style={styles.container}>
      <AppText variant="caption" color={colors.textSecondary} style={styles.label}>
        {'Hôm nay bạn cảm thấy thế nào?'}
      </AppText>
      <View style={styles.emojis}>
        {MOODS.map((mood) => (
          <MoodEmoji
            key={mood.score}
            mood={mood}
            selected={selected === mood.score}
            onPress={() => handleSelect(mood.score)}
          />
        ))}
      </View>
    </GlassView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderColor: `${colors.wellbeing}33`,
  },
  label: {
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emojis: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  emojiButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  emojiWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiSelected: {
    backgroundColor: `${colors.wellbeing}33`,
  },
  emojiText: {
    fontSize: 24,
  },
});
