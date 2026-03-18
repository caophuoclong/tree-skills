import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { NodeCircle } from "@/src/ui/atoms/NodeCircle";
import { SvgPaths } from "@/src/ui/atoms/SvgPaths";
import { TierBannerView } from "@/src/ui/atoms/TierBanner";
import { Dimensions } from "react-native";
import type { SkillNode } from "@/src/business-logic/types";
import type { Placed } from "@/src/ui/atoms/SvgPaths";
import type { Banner } from "@/src/ui/atoms/TierBanner";

const { width: SW } = Dimensions.get("window");

interface SkillTreeCanvasProps {
  placed: Placed[];
  banners: Banner[];
  totalHeight: number;
  branchColor: string;
  colors: any;
  onNodePress: (node: SkillNode) => void;
  nodeGoalMap: Record<string, { goalId: string; goalTitle: string }>;
  colorMap: Record<string, string>;
  goalFilterActive: boolean;
  onGoalBadgePress?: (goalId: string) => void;
  children?: React.ReactNode;
}

/**
 * Main SVG canvas that renders the skill tree.
 * Displays:
 * - SVG connector paths between nodes
 * - Tier banners (foundation, intermediate, advanced)
 * - Individual skill nodes
 * - Optional children (e.g., quest banner)
 */
export function SkillTreeCanvas({
  placed,
  banners,
  totalHeight,
  branchColor,
  colors,
  onNodePress,
  nodeGoalMap,
  colorMap,
  goalFilterActive,
  onGoalBadgePress,
  children,
}: SkillTreeCanvasProps) {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ width: SW, height: totalHeight }}>
        {/* SVG bezier paths — below nodes */}
        <SvgPaths
          placed={placed}
          branchColor={goalFilterActive ? colors.brandPrimary : branchColor}
          totalHeight={totalHeight}
        />

        {/* Tier banners */}
        {banners.map((b) => (
          <TierBannerView
            key={`b${b.tier}`}
            banner={b}
            branchColor={goalFilterActive ? colors.brandPrimary : branchColor}
            colors={colors}
          />
        ))}

        {/* Nodes on top */}
        {placed.map((p) => {
          const goalEntry = nodeGoalMap[p.node.node_id];
          const nodeColor = goalFilterActive
            ? colorMap[p.node.branch]
            : branchColor;
          return (
            <NodeCircle
              key={p.node.node_id}
              placed={p}
              branchColor={nodeColor}
              colors={colors}
              onPress={onNodePress}
              goalTitle={goalEntry?.goalTitle}
              onGoalBadgePress={
                goalEntry && onGoalBadgePress
                  ? () => onGoalBadgePress(goalEntry.goalId)
                  : undefined
              }
            />
          );
        })}
      </View>

      {/* Children container for additional elements (e.g., quest banner) */}
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({});
