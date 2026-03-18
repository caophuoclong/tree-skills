import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/src/ui/tokens";

const STEPS = [
  { label: "Phân tích mục tiêu của bạn...", emoji: "🔍" },
  { label: "Xác định các nhóm kỹ năng...", emoji: "🗂️" },
  { label: "Phân loại theo danh mục kỹ năng sống...", emoji: "🏷️" },
  { label: "Tạo lộ trình cá nhân hoá...", emoji: "🗺️" },
  { label: "Gần xong rồi...", emoji: "✨" },
];

export default function GeneratingScreen() {
  const { colors } = useTheme();
  const [stepIdx, setStepIdx] = React.useState(0);

  // Rotate indicator
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [spin]);

  // Step ticker
  useEffect(() => {
    const t = setInterval(() => {
      setStepIdx((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 420);
    return () => clearInterval(t);
  }, []);

  // Pulse for orb
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.18,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulse]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.bgBase }]}
      edges={["top", "bottom"]}
    >
      <View style={styles.center}>
        {/* Orb */}
        <Animated.View
          style={[
            styles.orb,
            {
              backgroundColor: `${colors.brandPrimary}18`,
              borderColor: `${colors.brandPrimary}35`,
              transform: [{ scale: pulse }],
            },
          ]}
        >
          {/* Spinner ring */}
          <Animated.View
            style={[
              styles.ring,
              {
                borderColor: `${colors.brandPrimary}60`,
                transform: [{ rotate }],
              },
            ]}
          />
          <Text style={styles.orbEmoji}>🤖</Text>
        </Animated.View>

        <Text style={[styles.title, { color: colors.textPrimary }]}>
          AI đang tạo lộ trình...
        </Text>
        <Text style={[styles.sub, { color: colors.textMuted }]}>
          Đang cá nhân hoá dựa trên mục tiêu của bạn
        </Text>

        {/* Step list */}
        <View style={styles.stepList}>
          {STEPS.map((s, i) => {
            const done = i < stepIdx;
            const active = i === stepIdx;
            return (
              <View key={i} style={styles.stepRow}>
                <View
                  style={[
                    styles.stepDot,
                    {
                      backgroundColor: done
                        ? colors.brandPrimary
                        : active
                          ? `${colors.brandPrimary}55`
                          : colors.bgElevated,
                      borderColor:
                        done || active
                          ? colors.brandPrimary
                          : colors.glassBorder,
                    },
                  ]}
                >
                  {done && <Text style={styles.dotCheck}>✓</Text>}
                  {active && (
                    <Animated.View
                      style={[
                        styles.dotPulse,
                        {
                          backgroundColor: colors.brandPrimary,
                          opacity: pulse,
                        },
                      ]}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    {
                      color: done
                        ? colors.textPrimary
                        : active
                          ? colors.brandPrimary
                          : colors.textMuted,
                      fontFamily: active ? 'SpaceGrotesk-Bold' : 'SpaceGrotesk-Regular',
                      fontWeight: active ? "700" : "400",
                    },
                  ]}
                >
                  {s.emoji}
                  {"  "}
                  {s.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  orb: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    marginBottom: 28,
  },
  ring: {
    position: "absolute",
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 2.5,
    borderTopColor: "transparent",
  },
  orbEmoji: { fontSize: 40 },

  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 6,
    textAlign: "center",
  },
  sub: { fontSize: 13, textAlign: "center", marginBottom: 36 },

  stepList: { width: "100%", gap: 14 },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  dotCheck: { fontSize: 11, color: "#fff", fontWeight: "800" },
  dotPulse: { width: 8, height: 8, borderRadius: 4 },
  stepLabel: { fontSize: 13, flex: 1 },
});
