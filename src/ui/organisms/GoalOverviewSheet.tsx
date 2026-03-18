import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { Branch } from "@/src/business-logic/types";
import type { CustomSkillTree } from "@/src/business-logic/stores/customSkillTreeStore";

const BRANCH_COLOR: Record<Branch, string> = {
  career: "#7C6AF7",
  finance: "#22C55E",
  softskills: "#F59E0B",
  wellbeing: "#EC4899",
};

const BRANCH_LABEL: Record<Branch, string> = {
  career: "Sự nghiệp",
  finance: "Tài chính",
  softskills: "Kỹ năng mềm",
  wellbeing: "Sức khỏe",
};

const BRANCH_EMOJI_MAP: Record<Branch, string> = {
  career: "💼",
  finance: "💰",
  softskills: "💬",
  wellbeing: "🧘",
};

interface GoalOverviewSheetProps {
  visible: boolean;
  goalTree: CustomSkillTree | undefined;
  colors: any;
  onClose: () => void;
  onBranchSelect: (branch: Branch) => void;
}

export function GoalOverviewSheet({
  visible,
  goalTree,
  colors,
  onClose,
  onBranchSelect,
}: GoalOverviewSheetProps) {
  if (!goalTree) return null;

  // Group clusters by branch
  const branchGroups: Partial<Record<Branch, typeof goalTree.clusters>> = {};
  for (const c of goalTree.clusters) {
    if (!branchGroups[c.branch]) branchGroups[c.branch] = [];
    branchGroups[c.branch]!.push(c);
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
      navigationBarTranslucent={true}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.bgSurface,
              borderColor: colors.glassBorder,
            },
          ]}
        >
          <View style={styles.handle} />
          <Text
            style={[styles.goalSheetTitle, { color: colors.textPrimary }]}
            numberOfLines={2}
          >
            🎯 {goalTree.goal}
          </Text>
          <Text style={[styles.goalSheetSub, { color: colors.textMuted }]}>
            Lộ trình này trải đều trên {Object.keys(branchGroups).length} danh mục
          </Text>

          <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 16 }}>
            {(
              Object.entries(branchGroups) as [
                Branch,
                typeof goalTree.clusters,
              ][]
            ).map(([branch, clusters]) => {
              const col = BRANCH_COLOR[branch];
              const totalSkills = clusters.reduce(
                (s, c) => s + c.skills.length,
                0,
              );
              return (
                <View
                  key={branch}
                  style={[
                    styles.goalBranchSection,
                    { borderColor: `${col}30` },
                  ]}
                >
                  {/* Branch header */}
                  <View
                    style={[
                      styles.goalBranchHeader,
                      { backgroundColor: `${col}15` },
                    ]}
                  >
                    <Text style={{ fontSize: 16 }}>
                      {BRANCH_EMOJI_MAP[branch]}
                    </Text>
                    <Text style={[styles.goalBranchLabel, { color: col }]}>
                      {BRANCH_LABEL[branch]}
                    </Text>
                    <Text
                      style={[
                        styles.goalBranchCount,
                        { color: colors.textMuted },
                      ]}
                    >
                      {clusters.length} nhóm · {totalSkills} kỹ năng
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        onClose();
                        onBranchSelect(branch);
                      }}
                      style={[
                        styles.goalBranchBtn,
                        { borderColor: `${col}60` },
                      ]}
                    >
                      <Text
                        style={[styles.goalBranchBtnText, { color: col }]}
                      >
                        Xem →
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Clusters in this branch */}
                  {clusters.map((cluster) => (
                    <View key={cluster.id} style={styles.goalClusterRow}>
                      <Text style={styles.goalClusterEmoji}>
                        {cluster.emoji}
                      </Text>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.goalClusterTitle,
                            { color: colors.textPrimary },
                          ]}
                        >
                          {cluster.title}
                        </Text>
                        <Text
                          style={[
                            styles.goalClusterSub,
                            { color: colors.textMuted },
                          ]}
                        >
                          {cluster.skills.map((s) => s.title).join(" · ")}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              );
            })}
            <View style={{ height: 24 }} />
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.52)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingTop: 12,
    borderWidth: 1,
    minHeight: 350,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignSelf: "center",
    marginBottom: 20,
  },
  goalSheetTitle: { fontSize: 17, fontWeight: "800", lineHeight: 24 },
  goalSheetSub: { fontSize: 12, marginTop: 4 },
  goalBranchSection: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 10,
    overflow: "hidden",
  },
  goalBranchHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  goalBranchLabel: {
    fontSize: 13,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "700",
    flex: 1,
  },
  goalBranchCount: { fontSize: 11 },
  goalBranchBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  goalBranchBtnText: {
    fontSize: 11,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "700",
  },
  goalClusterRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  goalClusterEmoji: { fontSize: 16, marginTop: 1 },
  goalClusterTitle: {
    fontSize: 13,
    fontFamily: "SpaceGrotesk-SemiBold",
    fontWeight: "600",
  },
  goalClusterSub: { fontSize: 10, marginTop: 2, lineHeight: 14 },
});
