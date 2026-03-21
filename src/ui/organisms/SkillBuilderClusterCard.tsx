import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useCustomSkillTreeStore } from "@/src/business-logic/stores/customSkillTreeStore";
import type {
  Branch,
  CustomCluster,
  CustomSkillItem,
} from "@/src/business-logic/types";
import { useTheme } from "@/src/ui/tokens";
import { SkillBuilderSkillRow } from "./SkillBuilderSkillRow";

import { useBranches } from "@/src/business-logic/hooks/useBranches";

interface SkillBuilderClusterCardProps {
  cluster: CustomCluster;
  onRemove: () => void;
}

export function SkillBuilderClusterCard({
  cluster,
  onRemove,
}: SkillBuilderClusterCardProps) {
  const { colors } = useTheme();
  const { addSkillToCluster, updateCluster } = useCustomSkillTreeStore();
  const [collapsed, setCollapsed] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(cluster.title);
  const { branchMeta } = useBranches();
  const cfg = branchMeta[cluster.branch];
  const branchColor = cfg.color;

  const commitTitle = () => {
    if (titleDraft.trim())
      updateCluster(cluster.id, { title: titleDraft.trim() });
    else setTitleDraft(cluster.title);
    setEditingTitle(false);
  };

  const handleAddSkill = () => {
    const newSkill: CustomSkillItem = {
      id: Math.random().toString(36).slice(2, 10),
      title: "Kỹ năng mới",
      description: "",
      branch: cluster.branch,
      duration_weeks: 1,
      quests: [
        {
          id: Math.random().toString(36).slice(2, 10),
          title: "Nhiệm vụ 1",
          difficulty: "easy",
          duration_min: 15,
        },
        {
          id: Math.random().toString(36).slice(2, 10),
          title: "Nhiệm vụ 2",
          difficulty: "medium",
          duration_min: 30,
        },
        {
          id: Math.random().toString(36).slice(2, 10),
          title: "Nhiệm vụ 3",
          difficulty: "hard",
          duration_min: 30,
        },
      ],
      status: "locked",
    };
    addSkillToCluster(cluster.id, newSkill);
  };

  return (
    <View
      style={[
        styles.clusterCard,
        {
          backgroundColor: colors.bgSurface,
          borderColor: `${branchColor}30`,
          shadowColor: branchColor,
        },
      ]}
    >
      <View style={[styles.clusterAccent, { backgroundColor: branchColor }]} />

      <View style={styles.clusterHeader}>
        <TouchableOpacity
          onPress={() => setCollapsed((c) => !c)}
          style={styles.clusterHeaderInner}
        >
          <Text style={styles.clusterEmoji}>{cluster.emoji}</Text>
          <View style={{ flex: 1 }}>
            {editingTitle ? (
              <TextInput
                autoFocus
                value={titleDraft}
                onChangeText={setTitleDraft}
                onBlur={commitTitle}
                onSubmitEditing={commitTitle}
                style={[
                  styles.clusterTitleInput,
                  { color: colors.textPrimary },
                ]}
                returnKeyType="done"
              />
            ) : (
              <Pressable onPress={() => setEditingTitle(true)}>
                <Text
                  style={[styles.clusterTitle, { color: colors.textPrimary }]}
                >
                  {cluster.title}
                </Text>
              </Pressable>
            )}
            <View
              style={[
                styles.branchBadge,
                {
                  backgroundColor: `${branchColor}22`,
                  borderColor: `${branchColor}50`,
                },
              ]}
            >
              <Text style={styles.branchBadgeEmoji}>{cfg.emoji}</Text>
              <Text style={[styles.branchBadgeLabel, { color: branchColor }]}>
                {cfg.label}
              </Text>
            </View>
          </View>
          <View style={styles.clusterHeaderRight}>
            <Text style={[styles.clusterCount, { color: colors.textMuted }]}>
              {cluster.skills.length} KN
            </Text>
            <Ionicons
              name={collapsed ? "chevron-down" : "chevron-up"}
              size={16}
              color={colors.textMuted}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onRemove}
          style={styles.removeClusterBtn}
          hitSlop={8}
        >
          <Ionicons name="trash-outline" size={15} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {!collapsed && (
        <>
          <View style={{ paddingHorizontal: 14, paddingBottom: 6 }}>
            <Text style={[styles.sectionMicro, { color: colors.textMuted }]}>
              DANH MỤC
            </Text>
            <BranchPicker
              value={cluster.branch}
              onChange={(b) => updateCluster(cluster.id, { branch: b })}
            />
          </View>

          <View style={styles.skillsList}>
            {cluster.skills.length === 0 ? (
              <Text style={[styles.emptyHint, { color: colors.textMuted }]}>
                Chưa có kỹ năng nào
              </Text>
            ) : (
              cluster.skills.map((skill, idx) => (
                <SkillBuilderSkillRow
                  key={skill.id}
                  skill={skill}
                  clusterId={cluster.id}
                  idx={idx}
                  total={cluster.skills.length}
                  branchColor={branchColor}
                />
              ))
            )}
            <TouchableOpacity
              onPress={handleAddSkill}
              style={[styles.addSkillBtn, { borderColor: `${branchColor}40` }]}
            >
              <Ionicons name="add" size={15} color={branchColor} />
              <Text style={[styles.addSkillText, { color: branchColor }]}>
                Thêm kỹ năng
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

function BranchPicker({
  value,
  onChange,
}: {
  value: Branch;
  onChange: (b: Branch) => void;
}) {
  const { colors } = useTheme();
  const { branches, branchMeta } = useBranches();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View
        style={{
          flexDirection: "row",
          gap: 6,
          paddingBottom: 2,
          paddingHorizontal: 1,
        }}
      >
        {branches.map(({ id: b }) => {
          const cfg = branchMeta[b];
          const active = value === b;
          return (
            <TouchableOpacity
              key={b}
              onPress={() => onChange(b)}
              style={[
                styles.branchPill,
                {
                  backgroundColor: active
                    ? `${cfg.color}22`
                    : colors.bgElevated,
                  borderColor: active ? `${cfg.color}70` : "transparent",
                },
              ]}
            >
              <Text>{cfg.emoji}</Text>
              <Text
                style={[
                  styles.branchPillLabel,
                  { color: active ? cfg.color : colors.textMuted },
                ]}
              >
                {cfg.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  clusterCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  clusterAccent: { position: "absolute", left: 0, top: 0, bottom: 0, width: 3 },
  clusterHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 14,
    paddingRight: 10,
    paddingVertical: 12,
    gap: 6,
  },
  clusterHeaderInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  clusterEmoji: { fontSize: 22, width: 32, textAlign: "center" },
  clusterTitle: {
    fontSize: 15,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "700",
    marginBottom: 4,
  },
  clusterTitleInput: {
    fontSize: 15,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "700",
    borderBottomWidth: 1.5,
    paddingVertical: 2,
    marginBottom: 4,
  },
  clusterHeaderRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  clusterCount: {
    fontSize: 11,
    fontFamily: "SpaceGrotesk-SemiBold",
    fontWeight: "600",
  },
  removeClusterBtn: { padding: 4 },
  branchBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  branchBadgeEmoji: { fontSize: 10 },
  branchBadgeLabel: {
    fontSize: 10,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "700",
  },
  branchPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  branchPillLabel: {
    fontSize: 12,
    fontFamily: "SpaceGrotesk-SemiBold",
    fontWeight: "600",
  },
  skillsList: { paddingHorizontal: 14, paddingBottom: 12, gap: 2 },
  emptyHint: {
    fontSize: 12,
    textAlign: "center",
    paddingVertical: 14,
    fontStyle: "italic",
  },
  addSkillBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginTop: 4,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 8,
    justifyContent: "center",
  },
  addSkillText: {
    fontSize: 12,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "700",
  },
  sectionMicro: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 4,
    marginTop: 10,
  },
});
