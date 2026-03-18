import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCustomSkillTreeStore } from "@/src/business-logic/stores/customSkillTreeStore";
import { useSkillTreeStore } from "@/src/business-logic/stores/skillTreeStore";
import type { Branch, CustomGoalTree } from "@/src/business-logic/types";
import { useTheme } from "@/src/ui/tokens";

const { height: SH } = Dimensions.get("window");

type Cluster = CustomGoalTree["clusters"][number];

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
const BRANCH_EMOJI: Record<Branch, string> = {
  career: "💼",
  finance: "💰",
  softskills: "💬",
  wellbeing: "🧘",
};

export default function NodeDetailScreen() {
  const { goalId } = useLocalSearchParams<{ goalId: string }>();
  const { colors } = useTheme();
  const { trees } = useCustomSkillTreeStore();
  const setActiveBranch = useSkillTreeStore((s) => s.setActiveBranch);

  const goalTree = trees.find((t) => t.id === goalId);

  // Group clusters by branch
  const branchGroups: Partial<Record<Branch, Cluster[]>> = {};
  if (goalTree) {
    for (const c of goalTree.clusters) {
      if (!branchGroups[c.branch]) branchGroups[c.branch] = [];
      branchGroups[c.branch]!.push(c);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "transparent" }}>
      <Pressable style={styles.overlay} onPress={() => router.back()}>
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: colors.bgSurface,
              borderColor: colors.glassBorder,
              maxHeight: SH * 0.33,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Drag handle */}
          <View style={styles.handle} />

          {!goalTree ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                Goal not found.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.sheetHeader}>
                <Text
                  style={[styles.goalTitle, { color: colors.textPrimary }]}
                  numberOfLines={1}
                >
                  🎯 {goalTree.goal}
                </Text>
                <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
                  <Ionicons
                    name="close-circle"
                    size={22}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
              <Text style={[styles.goalSub, { color: colors.textMuted }]}>
                Lộ trình trải đều trên {Object.keys(branchGroups).length} danh
                mục
              </Text>

              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.list}
                contentContainerStyle={styles.listContent}
              >
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
                        styles.branchSection,
                        { borderColor: `${col}30` },
                      ]}
                    >
                      {/* Branch header */}
                      <View
                        style={[
                          styles.branchHeader,
                          { backgroundColor: `${col}15` },
                        ]}
                      >
                        <Text style={styles.branchEmoji}>
                          {BRANCH_EMOJI[branch]}
                        </Text>
                        <Text style={[styles.branchLabel, { color: col }]}>
                          {BRANCH_LABEL[branch]}
                        </Text>
                        <Text
                          style={[
                            styles.branchCount,
                            { color: colors.textMuted },
                          ]}
                        >
                          {clusters.length} nhóm · {totalSkills} kỹ năng
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            setActiveBranch(branch);
                            router.back();
                          }}
                          style={[
                            styles.branchBtn,
                            { borderColor: `${col}60` },
                          ]}
                        >
                          <Text style={[styles.branchBtnText, { color: col }]}>
                            Xem →
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* Clusters */}
                      {clusters.map((cluster) => (
                        <View key={cluster.id} style={styles.clusterRow}>
                          <Text style={styles.clusterEmoji}>
                            {cluster.emoji}
                          </Text>
                          <View style={{ flex: 1 }}>
                            <Text
                              style={[
                                styles.clusterTitle,
                                { color: colors.textPrimary },
                              ]}
                            >
                              {cluster.title}
                            </Text>
                            <Text
                              style={[
                                styles.clusterSub,
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
                <View style={{ height: 8 }} />
              </ScrollView>
            </>
          )}
        </Pressable>
      </Pressable>
    </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  goalTitle: {
    fontSize: 16,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "800",
    flex: 1,
    marginRight: 8,
  },
  goalSub: {
    fontSize: 11,
    marginBottom: 12,
  },
  list: { flex: 1 },
  listContent: { gap: 8 },
  branchSection: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  branchHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  branchEmoji: { fontSize: 14 },
  branchLabel: {
    fontSize: 13,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "700",
    flex: 1,
  },
  branchCount: { fontSize: 11 },
  branchBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  branchBtnText: {
    fontSize: 11,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "700",
  },
  clusterRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  clusterEmoji: { fontSize: 14, marginTop: 1 },
  clusterTitle: {
    fontSize: 12,
    fontFamily: "SpaceGrotesk-SemiBold",
    fontWeight: "600",
  },
  clusterSub: { fontSize: 10, marginTop: 2, lineHeight: 13 },
  emptyState: {
    alignItems: "center",
    paddingVertical: 24,
  },
  emptyText: { fontSize: 14 },
});
