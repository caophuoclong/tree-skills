import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { NeoBrutalAccent, NeoBrutalBox } from "@/src/ui/atoms";
import type { CustomSkillTree } from "@/src/business-logic/stores/customSkillTreeStore";

interface GoalFilterSectionProps {
  customTrees: CustomSkillTree[];
  selectedGoalId: string | null;
  onSelectGoal: (goalId: string | null) => void;
  colors: any;
}

/**
 * Renders goal filter pills at the top of the tree screen.
 * Shows "All" pill plus one pill per custom skill tree.
 * Includes a "Tạo mới" (Create new) button.
 */
export function GoalFilterSection({
  customTrees,
  selectedGoalId,
  onSelectGoal,
  colors,
}: GoalFilterSectionProps) {
  if (customTrees.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}
    >
      {/* "All" pill */}
      {!selectedGoalId ? (
        <NeoBrutalAccent
          accentColor={colors.brandPrimary}
          strokeColor="#000"
          shadowOffsetX={2}
          shadowOffsetY={2}
          borderRadius={9999}
          onPress={() => onSelectGoal(null)}
          contentStyle={styles.activePillContent}
        >
          <Text style={styles.activePillText}>✦ Tất cả</Text>
        </NeoBrutalAccent>
      ) : (
        <NeoBrutalBox
          borderColor={colors.glassBorder}
          backgroundColor={colors.bgElevated}
          shadowColor="#000"
          shadowOffsetX={2}
          shadowOffsetY={2}
          borderRadius={9999}
          onPress={() => onSelectGoal(null)}
          contentStyle={styles.inactivePillContent}
        >
          <Text style={[styles.inactivePillText, { color: colors.textSecondary }]}>
            ✦ Tất cả
          </Text>
        </NeoBrutalBox>
      )}

      {/* One pill per saved goal tree */}
      {customTrees.map((tree) => {
        const active = selectedGoalId === tree.id;
        return active ? (
          <NeoBrutalAccent
            key={tree.id}
            accentColor={colors.brandPrimary}
            strokeColor="#000"
            shadowOffsetX={2}
            shadowOffsetY={2}
            borderRadius={9999}
            onPress={() => onSelectGoal(tree.id)}
            contentStyle={styles.activePillContent}
          >
            <Text style={styles.activePillText} numberOfLines={1}>
              🎯{tree.goal}
            </Text>
          </NeoBrutalAccent>
        ) : (
          <NeoBrutalBox
            key={tree.id}
            borderColor={colors.glassBorder}
            backgroundColor={colors.bgElevated}
            shadowColor="#000"
            shadowOffsetX={2}
            shadowOffsetY={2}
            borderRadius={9999}
            onPress={() => onSelectGoal(tree.id)}
            contentStyle={styles.inactivePillContent}
          >
            <Text
              style={[styles.inactivePillText, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              🎯{tree.goal}
            </Text>
          </NeoBrutalBox>
        );
      })}

      {/* Tạo mới button */}
      <NeoBrutalAccent
        accentColor={colors.brandPrimary}
        shadowOffsetX={2}
        shadowOffsetY={2}
        borderWidth={1.5}
        borderRadius={9999}
        onPress={() => router.push("/skill-builder")}
        contentStyle={styles.createButtonContent}
      >
        <Ionicons name="sparkles" size={12} color={colors.textPrimary} />
        <Text style={[styles.createButtonText, { color: colors.textPrimary }]}>
          Tạo mới
        </Text>
      </NeoBrutalAccent>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { marginTop: 12, flexGrow: 0, flexShrink: 0, maxHeight: 32 },
  row: {
    paddingHorizontal: 20,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  activePillContent: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  activePillText: {
    fontSize: 12,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "700",
    color: "#fff",
  },
  inactivePillContent: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  inactivePillText: {
    fontSize: 12,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "700",
  },
  createButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 5,
  },
  createButtonText: {
    fontSize: 13,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "700",
  },
});
