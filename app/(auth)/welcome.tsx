import { router } from "expo-router";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { NeoBrutalAccent, NeoBrutalBox } from "@/src/ui/atoms";
import { useTheme } from "@/src/ui/tokens";

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function WelcomeScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* ── Center content ─────────────────────────────── */}
      <View style={styles.centerContent}>
        {/* Radial glow */}
        <View style={styles.glowOrb} />

        {/* App icon */}
        <NeoBrutalBox
          borderColor={colors.brandPrimary}
          backgroundColor={colors.bgElevated}
          shadowColor="#000"
          shadowOffsetX={3}
          shadowOffsetY={3}
          borderWidth={2}
          borderRadius={20}
          contentStyle={{
            width: 64,
            height: 64,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <Text style={styles.appIconEmoji}>🌿</Text>
        </NeoBrutalBox>

        {/* Title + subtitle */}
        <Text style={styles.title}>Life Skill Tree</Text>
        <Text style={styles.subtitle}>
          Grow your skills. Level up your life.
        </Text>
      </View>

      {/* ── Buttons ────────────────────────────────────── */}
      <View style={styles.buttonsSection}>
        <NeoBrutalAccent
          accentColor={colors.brandPrimary}
          strokeColor="rgba(0,0,0,0.5)"
          shadowOffsetX={4}
          shadowOffsetY={4}
          borderWidth={2}
          borderRadius={26}
          onPress={() => router.push("/(auth)/register")}
          style={{ marginBottom: 16 }}
          contentStyle={{
            height: 52,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={styles.primaryBtnText}>Get Started</Text>
        </NeoBrutalAccent>

        <Text
          onPress={() => router.push("/(auth)/login")}
          style={styles.secondaryBtnText}
        >
          I already have an account
        </Text>

        <Text style={styles.socialProof}>
          Join 10,000+ Gen Z building real skills
        </Text>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bgBase,
    },

    // Center content
    centerContent: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
    },
    glowOrb: {
      position: "absolute",
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: "rgba(124,106,247,0.12)",
    },
    appIconEmoji: {
      fontSize: 32,
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.textPrimary,
      textAlign: "center",
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 24,
    },

    // Buttons section
    buttonsSection: {
      paddingHorizontal: 24,
      paddingBottom: 8,
    },
    primaryBtnText: {
      fontSize: 16,
      fontFamily: 'SpaceGrotesk-Bold', fontWeight: "700",
      color: "#FFFFFF",
    },
    secondaryBtnText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
    },
    socialProof: {
      fontSize: 12,
      color: colors.textMuted,
      textAlign: "center",
      marginTop: 32,
      marginBottom: 24,
    },
  });
