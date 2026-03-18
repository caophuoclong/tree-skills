import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import type { SkillNode } from "@/src/business-logic/types";

const { width: SW } = Dimensions.get("window");
const NODE_SIZE = 68;

interface Placed {
  node: SkillNode;
  x: number;
  y: number;
  cx: number;
  cy: number;
}

interface SvgPathsProps {
  placed: Placed[];
  branchColor: string;
  totalHeight: number;
}

/**
 * Cubic-bezier S-curve between two node centres.
 * Control points sit at the same horizontal as each node but at the
 * vertical midpoint → produces a smooth horizontal "swing".
 */
export function makeCubicPath(from: Placed, to: Placed): string {
  const midY = (from.cy + to.cy) / 2;
  return `M ${from.cx} ${from.cy} C ${from.cx} ${midY} ${to.cx} ${midY} ${to.cx} ${to.cy}`;
}

/**
 * Renders SVG curved connector paths between nodes.
 * Draws multiple path layers (shadow, glow, main line, highlight) for visual depth.
 */
export function SvgPaths({ placed, branchColor, totalHeight }: SvgPathsProps) {
  return (
    <Svg
      width={SW}
      height={totalHeight}
      style={StyleSheet.absoluteFillObject}
      pointerEvents="none"
    >
      {placed.map((p, i) => {
        if (i === 0) return null;
        const prev = placed[i - 1];
        const d = makeCubicPath(prev, p);
        const isCompleted =
          prev.node.status === "completed" && p.node.status === "completed";
        const isActive =
          !isCompleted &&
          (prev.node.status !== "locked" || p.node.status !== "locked");

        return (
          <React.Fragment key={`seg_${i}`}>
            {/* ① depth shadow underneath */}
            <Path
              d={d}
              stroke="rgba(0,0,0,0.35)"
              strokeWidth={isCompleted ? 14 : 11}
              fill="none"
              strokeLinecap="round"
            />

            {/* ② glow halo on completed segments */}
            {isCompleted && (
              <Path
                d={d}
                stroke={branchColor}
                strokeWidth={18}
                fill="none"
                strokeLinecap="round"
                opacity={0.12}
              />
            )}

            {/* ③ main path line */}
            <Path
              d={d}
              stroke={
                isCompleted
                  ? branchColor
                  : isActive
                    ? "rgba(255,255,255,0.22)"
                    : "rgba(255,255,255,0.09)"
              }
              strokeWidth={isCompleted ? 9 : 7}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={isCompleted ? undefined : "10 9"}
              opacity={isCompleted ? 0.75 : 1}
            />

            {/* ④ bright centre line on completed (gives "raised road" feel) */}
            {isCompleted && (
              <Path
                d={d}
                stroke="rgba(255,255,255,0.22)"
                strokeWidth={2.5}
                fill="none"
                strokeLinecap="round"
              />
            )}
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

export type { Placed };
