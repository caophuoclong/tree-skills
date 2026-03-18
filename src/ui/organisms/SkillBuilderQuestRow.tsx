import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useCustomSkillTreeStore } from '@/src/business-logic/stores/customSkillTreeStore';
import type { CustomQuest, Difficulty, QuestDuration } from '@/src/business-logic/types';
import { useTheme } from '@/src/ui/tokens';

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; color: string }> = {
  easy: { label: 'Dễ', color: '#22C55E' },
  medium: { label: 'TB', color: '#F59E0B' },
  hard: { label: 'Khó', color: '#EF4444' },
};
const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];
const DURATIONS: QuestDuration[] = [5, 15, 30];

interface SkillBuilderQuestRowProps {
  quest: CustomQuest;
  clusterId: string;
  skillId: string;
  canDelete: boolean;
}

export function SkillBuilderQuestRow({
  quest,
  clusterId,
  skillId,
  canDelete,
}: SkillBuilderQuestRowProps) {
  const { colors } = useTheme();
  const { updateQuest, removeQuest } = useCustomSkillTreeStore();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(quest.title);
  const diffCfg = DIFFICULTY_CONFIG[quest.difficulty];

  const commitTitle = () => {
    if (draft.trim()) updateQuest(clusterId, skillId, quest.id, { title: draft.trim() });
    else setDraft(quest.title);
    setEditing(false);
  };

  const cycleDifficulty = () => {
    const idx = DIFFICULTIES.indexOf(quest.difficulty);
    updateQuest(clusterId, skillId, quest.id, { difficulty: DIFFICULTIES[(idx + 1) % 3] });
  };

  const cycleDuration = () => {
    const idx = DURATIONS.indexOf(quest.duration_min);
    updateQuest(clusterId, skillId, quest.id, { duration_min: DURATIONS[(idx + 1) % 3] });
  };

  return (
    <View style={[styles.questRow, { borderColor: colors.glassBorder }]}>
      <TouchableOpacity
        onPress={cycleDifficulty}
        style={[styles.questDiffBadge, { backgroundColor: `${diffCfg.color}22`, borderColor: `${diffCfg.color}60` }]}
      >
        <Text style={[styles.questDiffText, { color: diffCfg.color }]}>{diffCfg.label}</Text>
      </TouchableOpacity>

      <View style={{ flex: 1 }}>
        {editing ? (
          <TextInput
            autoFocus
            value={draft}
            onChangeText={setDraft}
            onBlur={commitTitle}
            onSubmitEditing={commitTitle}
            style={[styles.questTitleInput, { color: colors.textPrimary, borderColor: colors.brandPrimary }]}
            returnKeyType="done"
          />
        ) : (
          <Text
            onPress={() => setEditing(true)}
            style={[styles.questTitle, { color: colors.textPrimary }]}
            numberOfLines={2}
          >
            {quest.title}
          </Text>
        )}
      </View>

      <TouchableOpacity
        onPress={cycleDuration}
        style={[styles.questDurBadge, { backgroundColor: colors.bgElevated }]}
      >
        <Ionicons name="time-outline" size={10} color={colors.textMuted} />
        <Text style={[styles.questDurText, { color: colors.textMuted }]}>{quest.duration_min}p</Text>
      </TouchableOpacity>

      {canDelete && (
        <TouchableOpacity onPress={() => removeQuest(clusterId, skillId, quest.id)} hitSlop={8}>
          <Ionicons name="close" size={13} color={colors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  questRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 5, borderBottomWidth: StyleSheet.hairlineWidth },
  questDiffBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
  questDiffText: { fontSize: 9, fontWeight: '800' },
  questTitle: { fontSize: 12, lineHeight: 17 },
  questTitleInput: { fontSize: 12, borderBottomWidth: 1.5, paddingVertical: 1 },
  questDurBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8 },
  questDurText: { fontSize: 10, fontFamily: 'SpaceGrotesk-SemiBold', fontWeight: '600' },
});
