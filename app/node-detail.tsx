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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSkillTreeStore } from "@/src/business-logic/stores/skillTreeStore";
import { useTheme } from "@/src/ui/tokens";

const BRANCH_COLORS: Record<string, string> = {
  career: "#4DA8FF",
  finance: "#34D399",
  softskills: "#FBBF24",
  wellbeing: "#F472B6",
};

const STATUS_LABELS: Record<string, string> = {
  locked: "🔒 Locked",
  in_progress: "⚡ In Progress",
  completed: "✅ Completed",
};

const TIER_LABELS = ["", "Beginner", "Intermediate", "Advanced"];

const { height: SCREEN_H } = Dimensions.get("window");
const SHEET_HEIGHT = (SCREEN_H * 2) / 3;

export default function NodeDetailScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { node_id } = useLocalSearchParams<{ node_id: string }>();
  const nodes = useSkillTreeStore((s) => s.nodes);

  const node = nodes.find((n) => n.node_id === node_id) ?? null;

  if (!node) {
    return (
      <Pressable style={styles.overlay} onPress={() => router.back()}>
        <View
          style={[
            styles.sheet,
            {
              height: SHEET_HEIGHT,
              backgroundColor: colors.bgElevated,
              paddingBottom: insets.bottom,
            },
          ]}
        >
          <View
            style={[styles.handle, { backgroundColor: colors.textMuted }]}
          />
          <View style={styles.notFound}>
            <Text style={[styles.notFoundText, { color: colors.textMuted }]}>
              Node not found
            </Text>
          </View>
        </View>
      </Pressable>
    );
  }

  const branchColor = BRANCH_COLORS[node.branch] ?? colors.brandPrimary;
  const tierLabel = TIER_LABELS[node.tier] ?? `Tier ${node.tier}`;
  const progressPct = Math.min(
    (node.quests_completed / Math.max(node.quests_total, 1)) * 100,
    100,
  );

  return (
    <Pressable style={styles.overlay} onPress={() => router.back()}>
      <Pressable
        style={[
          styles.sheet,
          {
            height: SHEET_HEIGHT,
            backgroundColor: colors.bgElevated,
            paddingBottom: insets.bottom,
          },
        ]}
        onPress={(e) => e.stopPropagation()}
      >
        {/* Accent bar */}
        <View style={[styles.accentBar, { backgroundColor: branchColor }]} />

        {/* Handle */}
        <View style={[styles.handle, { backgroundColor: colors.textMuted }]} />

        {/* Close button */}
        <TouchableOpacity
          style={styles.closeRow}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={22} color={colors.textSecondary} />
        </TouchableOpacity>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Tier + status badges */}
          <View style={styles.badgeRow}>
            <View style={[styles.tierBadge, { backgroundColor: branchColor }]}>
              <Text style={styles.tierText}>{tierLabel}</Text>
            </View>
            <View style={[styles.statusBadge, { borderColor: branchColor }]}>
              <Text style={[styles.statusText, { color: branchColor }]}>
                {STATUS_LABELS[node.status]}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text style={[styles.nodeTitle, { color: colors.textPrimary }]}>
            {node.title}
          </Text>

          {/* Description */}
          <Text style={[styles.nodeDesc, { color: colors.textSecondary }]}>
            {node.description}
          </Text>

          {/* Locked banner */}
          {node.status === "locked" && (
            <View
              style={[
                styles.lockedBanner,
                {
                  backgroundColor: `${colors.warning}22`,
                  borderColor: colors.warning,
                },
              ]}
            >
              <Text style={[styles.lockedText, { color: colors.warning }]}>
                🔒 Complete previous tier to unlock
              </Text>
              <Text style={[styles.lockedSub, { color: colors.textSecondary }]}>
                Requires {node.xp_required} XP
              </Text>
            </View>
          )}

          {/* Progress */}
          {node.status !== "locked" && (
            <View style={styles.progressSection}>
              <Text
                style={[styles.sectionLabel, { color: colors.textPrimary }]}
              >
                Progress
              </Text>
              <View style={styles.progressRow}>
                <View
                  style={[
                    styles.progressBarBg,
                    {
                      backgroundColor: colors.bgSurface,
                      borderColor: colors.textPrimary,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${progressPct}%` as any,
                        backgroundColor: branchColor,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[styles.progressLabel, { color: colors.textMuted }]}
                >
                  {node.quests_completed}/{node.quests_total}
                </Text>
              </View>

              {node.status === "completed" && (
                <View
                  style={[
                    styles.completedStamp,
                    { borderColor: colors.success },
                  ]}
                >
                  <Text
                    style={[styles.completedText, { color: colors.success }]}
                  >
                    ✅ Node Complete! +{node.xp_required} XP earned
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* XP info */}
          <View style={[styles.statRow, { borderColor: colors.glassBorder }]}>
            <View style={styles.stat}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                XP REQUIRED
              </Text>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                {node.xp_required}
              </Text>
            </View>
            <View
              style={[
                styles.statDivider,
                { backgroundColor: colors.glassBorder },
              ]}
            />
            <View style={styles.stat}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                BRANCH
              </Text>
              <Text style={[styles.statValue, { color: branchColor }]}>
                {node.branch.charAt(0).toUpperCase() + node.branch.slice(1)}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom close button */}
        <View style={[styles.footer, { borderTopColor: colors.glassBorder }]}>
          <TouchableOpacity
            style={[
              styles.closeBtn,
              {
                borderColor: colors.textPrimary,
                backgroundColor: colors.bgSurface,
              },
            ]}
            onPress={() => router.back()}
          >
            <Text style={[styles.closeBtnText, { color: colors.textPrimary }]}>
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  accentBar: { height: 4, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  closeRow: {
    alignSelf: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 16 },
  badgeRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  tierBadge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  tierText: {
    fontSize: 11,
    color: "#fff",
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "700",
  },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1.5,
  },
  statusText: { fontSize: 11, fontFamily: "SpaceGrotesk-Regular" },
  nodeTitle: {
    fontSize: 22,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "700",
    marginBottom: 10,
  },
  nodeDesc: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
    fontFamily: "SpaceGrotesk-Regular",
  },
  lockedBanner: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    gap: 6,
    marginBottom: 20,
  },
  lockedText: { fontSize: 15, fontFamily: "SpaceGrotesk-SemiBold" },
  lockedSub: { fontSize: 13, fontFamily: "SpaceGrotesk-Regular" },
  progressSection: { gap: 10, marginBottom: 20 },
  sectionLabel: { fontSize: 15, fontFamily: "SpaceGrotesk-SemiBold" },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  progressBarBg: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  progressBarFill: { height: "100%" },
  progressLabel: { fontSize: 12, fontFamily: "SpaceMono-Regular" },
  completedStamp: {
    borderWidth: 2,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  completedText: { fontSize: 14, fontFamily: "SpaceGrotesk-Bold" },
  statRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
  },
  stat: { flex: 1, padding: 14 },
  statDivider: { width: 1 },
  statLabel: {
    fontSize: 9,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: 16,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "700",
    marginTop: 4,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  closeBtn: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  closeBtnText: {
    fontSize: 15,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "700",
  },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFoundText: { fontSize: 14 },
});
