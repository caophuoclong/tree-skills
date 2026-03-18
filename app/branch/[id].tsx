import { getInitialNodes } from "@/src/business-logic/data/skill-tree-nodes";
import { useSkillTreeStore } from "@/src/business-logic/stores/skillTreeStore";
import type { Branch, SkillNode } from "@/src/business-logic/types";
import { BranchHeroCard, NodeDetailModal } from "@/src/ui/molecules";
import { SkillTreeBranch } from "@/src/ui/organisms/SkillTreeBranch";
import { useTheme } from "@/src/ui/tokens";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const BRANCH_LABELS: Record<Branch, string> = {
  career: "Sự nghiệp",
  finance: "Tài chính",
  softskills: "Kỹ năng mềm",
  wellbeing: "Sức khoẻ",
};

const getBranchColors = (colors: any): Record<string, string> => ({
  career: colors.career,
  finance: colors.finance,
  softskills: colors.softskills,
  wellbeing: colors.wellbeing,
});

export default function BranchScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const BranchColors = useMemo(() => getBranchColors(colors), [colors]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { nodes, setNodes } = useSkillTreeStore();

  // Init nodes if needed
  useEffect(() => {
    if (nodes.length === 0) {
      setNodes(getInitialNodes());
    }
  }, []);

  const branch = (id as Branch) ?? "career";
  const branchColor = BranchColors[branch] ?? colors.brandPrimary;
  const branchLabel = BRANCH_LABELS[branch] ?? branch;
  const branchNodes = nodes.filter((n) => n.branch === branch);

  // Animated entry — slide in from right
  const translateX = useSharedValue(300);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateX.value = withSpring(0, { damping: 20, stiffness: 180 });
    opacity.value = withSpring(1, { damping: 20, stiffness: 180 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  // Node detail modal
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <BranchHeroCard
        branchColor={branchColor}
        title={branchLabel}
        icon={<Ionicons name="arrow-back" size={20} color={colors.textPrimary} />}
        onBackPress={() => router.back()}
      />

      <Animated.View style={[styles.treeWrapper, animatedStyle]}>
        <SkillTreeBranch branch={branch} nodes={branchNodes} />
      </Animated.View>

      <NodeDetailModal
        node={selectedNode}
        branchColor={branchColor}
        visible={!!selectedNode}
        onClose={() => setSelectedNode(null)}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bgBase,
    },
    treeWrapper: {
      flex: 1,
    },
  });
