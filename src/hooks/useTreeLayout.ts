import { useMemo } from "react";
import { Dimensions } from "react-native";
import type { SkillNode } from "@/src/business-logic/types";
import type { Placed } from "@/src/ui/atoms/SvgPaths";

const { width: SW } = Dimensions.get("window");
const NODE_SIZE = 68;
const ROW_HEIGHT = 96;
const HEADER_H = 64;

const X = {
  left: 36,
  center: (SW - NODE_SIZE) / 2,
  right: SW - 36 - NODE_SIZE,
} as const;
type XKey = keyof typeof X;

const ZIGZAG: XKey[] = ["center", "right", "center", "left"];

const TIER_LABEL: Record<number, string> = {
  1: "NỀN TẢNG",
  2: "TRUNG CẤP",
  3: "NÂNG CAO",
};

interface Banner {
  tier: number;
  label: string;
  y: number;
}

interface TreeLayout {
  placed: Placed[];
  banners: Banner[];
  totalHeight: number;
}

/**
 * Computes node positions and tier banners for a given array of nodes.
 * Arranges nodes in a zigzag pattern (center → right → center → left → repeat)
 * with tier-based vertical spacing.
 */
function buildTreeLayout(nodes: SkillNode[]): TreeLayout {
  const sorted = [...nodes].sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    return (a.tier_order ?? 0) - (b.tier_order ?? 0);
  });
  const placed: Placed[] = [];
  const banners: Banner[] = [];
  let y = 24,
    posIdx = 0,
    lastTier = -1;

  for (const node of sorted) {
    if (node.tier !== lastTier) {
      banners.push({ tier: node.tier, label: TIER_LABEL[node.tier] ?? "", y });
      y += HEADER_H;
      lastTier = node.tier;
      posIdx = 0; // Reset zigzag position for each tier
    }
    const key = ZIGZAG[posIdx % ZIGZAG.length];
    const xVal = X[key];
    placed.push({
      node,
      x: xVal,
      y,
      cx: xVal + NODE_SIZE / 2,
      cy: y + NODE_SIZE / 2,
    });
    y += ROW_HEIGHT;
    posIdx++;
  }

  return { placed, banners, totalHeight: y + 40 };
}

/**
 * Hook that computes tree layout (node positions and banners) from a nodes array.
 * Memoized to prevent unnecessary recalculations.
 */
export function useTreeLayout(nodes: SkillNode[]): TreeLayout {
  return useMemo(() => buildTreeLayout(nodes), [nodes]);
}
