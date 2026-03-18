import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useCustomSkillTreeStore } from '@/src/business-logic/stores/customSkillTreeStore';
import type { CustomSkillItem } from '@/src/business-logic/types';
import { useTheme } from '@/src/ui/tokens';
import { SkillBuilderQuestRow } from './SkillBuilderQuestRow';

interface SkillBuilderSkillRowProps {
  skill: CustomSkillItem;
  clusterId: string;
  idx: number;
  total: number;
  branchColor: string;
}

export function SkillBuilderSkillRow({
  skill,
  clusterId,
  idx,
  total,
  branchColor,
}: SkillBuilderSkillRowProps) {
  const { colors } = useTheme();
  const { removeSkill, updateSkill, moveSkillUp, moveSkillDown, addQuest } = useCustomSkillTreeStore();
  const [expanded, setExpanded] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(skill.title);

  const commitTitle = () => {
    if (titleDraft.trim()) updateSkill(clusterId, skill.id, { title: titleDraft.trim() });
    else setTitleDraft(skill.title);
    setEditingTitle(false);
  };

  return (
    <View style={[styles.skillBlock, { borderColor: `${branchColor}20` }]}>
      <View style={styles.skillHeaderRow}>
        <View style={styles.sortCol}>
          <TouchableOpacity onPress={() => moveSkillUp(clusterId, skill.id)} disabled={idx === 0} style={{ opacity: idx === 0 ? 0.2 : 0.7 }} hitSlop={6}>
            <Ionicons name="chevron-up" size={13} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => moveSkillDown(clusterId, skill.id)} disabled={idx === total - 1} style={{ opacity: idx === total - 1 ? 0.2 : 0.7 }} hitSlop={6}>
            <Ionicons name="chevron-down" size={13} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.bullet, { backgroundColor: `${branchColor}60` }]} />

        <View style={{ flex: 1 }}>
          {editingTitle ? (
            <TextInput
              autoFocus value={titleDraft}
              onChangeText={setTitleDraft}
              onBlur={commitTitle}
              onSubmitEditing={commitTitle}
              style={[styles.skillTitleInput, { color: colors.textPrimary, borderColor: branchColor }]}
              returnKeyType="done"
            />
          ) : (
            <TouchableOpacity onPress={() => setEditingTitle(true)}>
              <Text style={[styles.skillTitle, { color: colors.textPrimary }]} numberOfLines={2}>{skill.title}</Text>
              <Text style={[styles.skillMeta, { color: colors.textMuted }]}>
                {skill.duration_weeks === 1 ? '1 tuần' : '2 tuần'} · {skill.quests.length} nhiệm vụ
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={() => setExpanded((v) => !v)}
          style={[styles.expandBtn, { borderColor: `${branchColor}40` }]}
          hitSlop={6}
        >
          <Ionicons name={expanded ? 'chevron-up' : 'list-outline'} size={13} color={branchColor} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => removeSkill(clusterId, skill.id)} hitSlop={8}>
          <Ionicons name="close" size={15} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {expanded && (
        <View style={[styles.questSubList, { borderColor: `${branchColor}15` }]}>
          <Text style={[styles.questSubHeader, { color: colors.textMuted }]}>NHIỆM VỤ</Text>
          {skill.quests.map((q) => (
            <SkillBuilderQuestRow
              key={q.id}
              quest={q}
              clusterId={clusterId}
              skillId={skill.id}
              canDelete={skill.quests.length > 1}
            />
          ))}
          {skill.quests.length < 5 && (
            <TouchableOpacity
              onPress={() => addQuest(clusterId, skill.id)}
              style={[styles.addQuestBtn, { borderColor: `${branchColor}35` }]}
            >
              <Ionicons name="add" size={13} color={branchColor} />
              <Text style={[styles.addQuestText, { color: branchColor }]}>Thêm nhiệm vụ</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  skillBlock: { borderBottomWidth: 1, paddingBottom: 6 },
  skillHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  sortCol: { alignItems: 'center', gap: 0 },
  bullet: { width: 7, height: 7, borderRadius: 3.5, flexShrink: 0 },
  skillTitle: { fontSize: 13, fontFamily: 'SpaceGrotesk-Medium', fontWeight: '500', lineHeight: 18 },
  skillMeta: { fontSize: 10, marginTop: 1 },
  skillTitleInput: { fontSize: 13, fontFamily: 'SpaceGrotesk-Medium', fontWeight: '500', borderBottomWidth: 1.5, paddingVertical: 2 },
  expandBtn: { padding: 5, borderRadius: 8, borderWidth: 1 },
  questSubList: { marginLeft: 30, marginBottom: 6, borderLeftWidth: 1, paddingLeft: 10, paddingTop: 4, gap: 4 },
  questSubHeader: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5, marginBottom: 4 },
  addQuestBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, borderWidth: 1, borderStyle: 'dashed', borderRadius: 6, justifyContent: 'center', marginTop: 4 },
  addQuestText: { fontSize: 11, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700' },
});
