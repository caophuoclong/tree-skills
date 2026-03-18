import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Emoji } from "@/src/ui/atoms";
import type { Branch, SkillNode } from "@/src/business-logic/types";
import type { Placed } from "./SvgPaths";

const { width: SW } = Dimensions.get("window");
const NODE_SIZE = 68;

const BRANCH_ICON: Record<Branch, string> = {
  career: "💼",
  finance: "💰",
  softskills: "💬",
  wellbeing: "🧘",
};

interface NodeCircleProps {
  placed: Placed;
  branchColor: string;
  colors: any;
  onPress: (n: SkillNode) => void;
  goalTitle?: string;
  onGoalBadgePress?: () => void;
}

export function NodeCircle({
  placed,
  branchColor,
  colors,
  onPress,
  goalTitle,
  onGoalBadgePress,
}: NodeCircleProps) {
  const { node, x, y } = placed;
  const isCompleted = node.status === "completed";
  const isInProgress = node.status === "in_progress";
  const isLocked = node.status === "locked";

  /* pulse ring animation */
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!isInProgress) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1100,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isInProgress, pulse]);

  const pScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.55],
  });
  const pOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0],
  });

  // Determine label side based on horizontal position
  const isAtLeft = x < SW * 0.3;
  const isAtRight = x > SW * 0.6;
  const labelStyle = isAtLeft
    ? { left: NODE_SIZE + 10, right: undefined, textAlign: "left" as const }
    : isAtRight
      ? { right: SW - x, left: undefined, textAlign: "right" as const }
      : {
          left: -10,
          right: -10,
          textAlign: "center" as const,
          top: NODE_SIZE + 4,
        };

  return (
    <TouchableOpacity
      activeOpacity={isLocked ? 1 : 0.75}
      onPress={() => !isLocked && onPress(node)}
      style={[styles.nodeWrap, { left: x, top: y }]}
    >
      {/* Hard shadow view — sits behind the main circle */}
      {!isLocked && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: NODE_SIZE,
            height: NODE_SIZE,
            borderRadius: NODE_SIZE / 2,
            backgroundColor: isCompleted ? branchColor : "rgba(0,0,0,0.5)",
            top: 3,
            left: 3,
          }}
        />
      )}

      {/* Pulse ring */}
      {isInProgress && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: NODE_SIZE + 20,
            height: NODE_SIZE + 20,
            borderRadius: (NODE_SIZE + 20) / 2,
            borderWidth: 2.5,
            borderColor: branchColor,
            top: -10,
            left: -10,
            transform: [{ scale: pScale }],
            opacity: pOpacity,
          }}
        />
      )}

      {/* Main circle */}
      <View
        style={[
          styles.nodeCircle,
          isCompleted && {
            backgroundColor: branchColor,
            borderWidth: 2.5,
            borderColor: "rgba(0,0,0,0.5)",
          },
          isInProgress && {
            backgroundColor: `${branchColor}25`,
            borderColor: branchColor,
            borderWidth: 2.5,
          },
          isLocked && {
            backgroundColor: colors.bgElevated,
            borderColor: "rgba(255,255,255,0.07)",
            borderWidth: 1.5,
            opacity: 0.38,
          },
        ]}
      >
        {isCompleted && <Ionicons name="checkmark" size={26} color="#fff" />}
        {isInProgress && <Emoji size={24}>{BRANCH_ICON[node.branch]}</Emoji>}
        {isLocked && (
          <Ionicons
            name="lock-closed"
            size={20}
            color="rgba(255,255,255,0.25)"
          />
        )}
      </View>

      {/* XP badge on completed */}
      {isCompleted && (
        <View
          style={[
            styles.xpBadge,
            { backgroundColor: branchColor, borderColor: colors.bgBase },
          ]}
        >
          <Text style={styles.xpBadgeText}>✓</Text>
        </View>
      )}

      {/* Goal origin badge — shows for custom AI-built nodes */}
      {!!goalTitle && (
        <TouchableOpacity
          onPress={onGoalBadgePress}
          activeOpacity={0.8}
          style={[
            styles.goalBadge,
            { backgroundColor: `${branchColor}CC`, borderColor: colors.bgBase },
          ]}
        >
          <Text style={styles.goalBadgeText}>✦</Text>
        </TouchableOpacity>
      )}

      {/* Label — side for left/right nodes, below for center */}
      {!isLocked && (
        <Text
          numberOfLines={2}
          style={[
            styles.nodeLabel,
            {
              color: isInProgress ? colors.textPrimary : colors.textSecondary,
              fontFamily: isInProgress
                ? "SpaceGrotesk-Bold"
                : "SpaceGrotesk-Medium",
              fontWeight: isInProgress ? "700" : "500",
            },
            isAtLeft || isAtRight
              ? {
                  position: "absolute",
                  top: (NODE_SIZE - 28) / 2,
                  width: 90,
                  ...labelStyle,
                }
              : {
                  marginTop: 6,
                  textAlign: "center",
                  width: NODE_SIZE + 16,
                  marginLeft: -8,
                },
          ]}
        >
          {node.title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  nodeWrap: { position: "absolute", width: NODE_SIZE, alignItems: "center" },
  nodeCircle: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  nodeLabel: { fontSize: 10, lineHeight: 13 },
  xpBadge: {
    position: "absolute",
    top: -2,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  xpBadgeText: { fontSize: 8, color: "#fff", fontWeight: "800" },
  goalBadge: {
    position: "absolute",
    bottom: -2,
    left: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  goalBadgeText: { fontSize: 7, color: "#fff", fontWeight: "900" },
});
