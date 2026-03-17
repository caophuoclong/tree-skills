/**
 * NeoBrutalBox Demo Screen
 * Navigate here at /neo-brutal-demo to verify all variants visually
 */
import {
  AppText,
  NeoBrutalAccent,
  NeoBrutalBox,
  NeoBrutalCard,
} from "@/src/ui/atoms";
import { useTheme } from "@/src/ui/tokens";
import { Radius, Spacing } from "@/src/ui/tokens/spacing";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NeoBrutalDemoScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgBase }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <AppText style={[styles.heading, { color: colors.textPrimary }]}>
          NeoBrutalBox Demo
        </AppText>

        {/* ── Section: Basic non-pressable ── */}
        <AppText style={[styles.label, { color: colors.textSecondary }]}>
          Default (theme-aware, static)
        </AppText>
        <NeoBrutalBox
          shadowOffsetX={4}
          shadowOffsetY={4}
          style={styles.card}
          contentStyle={styles.content}
        >
          <AppText style={{ color: colors.textPrimary, fontWeight: "700" }}>
            Static Card
          </AppText>
          <AppText style={{ color: colors.textSecondary, marginTop: 4 }}>
            Shadow is a sibling View — children have clean bg, no bleed.
          </AppText>
        </NeoBrutalBox>

        {/* ── Section: Pressable push-down ── */}
        <AppText style={[styles.label, { color: colors.textSecondary }]}>
          Pressable — push-down animation
        </AppText>
        <NeoBrutalBox
          onPress={() => console.log("pressed!")}
          shadowOffsetX={5}
          shadowOffsetY={5}
          style={styles.card}
          contentStyle={styles.content}
        >
          <AppText style={{ color: colors.textPrimary, fontWeight: "700" }}>
            Tap Me
          </AppText>
          <AppText style={{ color: colors.textSecondary, marginTop: 4 }}>
            Card translates → shadow position on press, shadow fades.
          </AppText>
        </NeoBrutalBox>

        {/* ── Section: Accent variants ── */}
        <AppText style={[styles.label, { color: colors.textSecondary }]}>
          Accent variants (branch colors)
        </AppText>

        <View style={styles.row}>
          <NeoBrutalAccent
            accentColor={colors.career}
            strokeColor="#000"
            onPress={() => {}}
            style={styles.pill}
            contentStyle={styles.pillContent}
          >
            <AppText style={styles.pillText}>Career</AppText>
          </NeoBrutalAccent>

          <NeoBrutalAccent
            accentColor={colors.finance}
            strokeColor="#000"
            onPress={() => {}}
            style={styles.pill}
            contentStyle={styles.pillContent}
          >
            <AppText style={styles.pillText}>Finance</AppText>
          </NeoBrutalAccent>

          <NeoBrutalAccent
            accentColor={colors.softskills}
            strokeColor="#000"
            onPress={() => {}}
            style={styles.pill}
            contentStyle={styles.pillContent}
          >
            <AppText style={styles.pillText}>Skills</AppText>
          </NeoBrutalAccent>

          <NeoBrutalAccent
            accentColor={colors.wellbeing}
            strokeColor="#000"
            onPress={() => {}}
            style={styles.pill}
            contentStyle={styles.pillContent}
          >
            <AppText style={styles.pillText}>Well</AppText>
          </NeoBrutalAccent>
        </View>

        {/* ── Section: White NeoBrutalCard ── */}
        <AppText style={[styles.label, { color: colors.textSecondary }]}>
          NeoBrutalCard (classic white/black)
        </AppText>
        <NeoBrutalCard
          onPress={() => {}}
          shadowOffsetX={6}
          shadowOffsetY={6}
          borderRadius={Radius.lg}
          style={styles.card}
          contentStyle={styles.content}
        >
          <AppText style={{ color: "#111", fontWeight: "800", fontSize: 18 }}>
            Classic Neobrutalism
          </AppText>
          <AppText style={{ color: "#444", marginTop: 6 }}>
            Hard black shadow, white bg, bold black border. Tap to feel the
            push.
          </AppText>
        </NeoBrutalCard>

        {/* ── Section: Brand primary CTA ── */}
        <AppText style={[styles.label, { color: colors.textSecondary }]}>
          CTA Button style
        </AppText>
        <NeoBrutalAccent
          accentColor={colors.brandPrimary}
          strokeColor="#000"
          onPress={() => {}}
          shadowOffsetX={4}
          shadowOffsetY={4}
          borderRadius={Radius.full}
          style={{ alignSelf: "stretch" }}
          contentStyle={styles.ctaContent}
        >
          <AppText style={styles.ctaText}>Get Started →</AppText>
        </NeoBrutalAccent>

        {/* ── Section: Nested content safety ── */}
        <AppText style={[styles.label, { color: colors.textSecondary }]}>
          Nested children — no shadow bleed
        </AppText>
        <NeoBrutalBox
          shadowOffsetX={5}
          shadowOffsetY={5}
          backgroundColor={colors.bgElevated}
          style={styles.card}
          contentStyle={{ padding: 16 }}
        >
          {/* Inner colored box should NOT have shadow from parent */}
          <View style={[styles.innerBox, { backgroundColor: colors.career }]}>
            <AppText style={{ color: "#fff", fontWeight: "700" }}>
              Inner child
            </AppText>
          </View>
          <View
            style={[
              styles.innerBox,
              { backgroundColor: colors.finance, marginTop: 8 },
            ]}
          >
            <AppText style={{ color: "#fff", fontWeight: "700" }}>
              No shadow bleed ✓
            </AppText>
          </View>
        </NeoBrutalBox>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    padding: Spacing.screenPadding,
    gap: 12,
  },
  heading: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 8,
    marginBottom: 4,
  },
  card: {
    alignSelf: "stretch",
  },
  content: {
    padding: 16,
  },
  row: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  pill: {
    borderRadius: 9999,
  },
  pillContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pillText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 13,
  },
  ctaContent: {
    paddingVertical: 16,
    alignItems: "center",
  },
  ctaText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
  innerBox: {
    borderRadius: 8,
    padding: 12,
  },
});
