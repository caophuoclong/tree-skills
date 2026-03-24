/**
 * QuestPreviewSection — today's quests preview (bottom of home screen)
 * Extracted from index.tsx for modularity
 */

import { NeoBrutalBox } from "@/src/ui/atoms";
import { useQuestStore } from "@/src/business-logic/stores/questStore";
import { useTheme } from "@/src/ui/tokens";
import { router } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface QuestPreviewSectionProps {
  branchColors: Record<string, string>;
  styles: any;
}

export function QuestPreviewSection({
  branchColors,
  styles,
}: QuestPreviewSectionProps) {
  const { colors } = useTheme();
  const localStyles = useMemo(() => createStyles(colors), [colors]);

  // Subscribe directly to store so any completion immediately removes the quest
  const dailyQuests = useQuestStore((s) => s.dailyQuests);
  const pendingQuests = dailyQuests.filter((q) => q.completed_at === null);

  if (pendingQuests.length === 0) {
    return (
      <View style={styles.questPreviewSection}>
        <Text style={styles.sectionLabel}>NHIỆM VỤ HÔM NAY</Text>
        <View style={{ padding: 20, alignItems: "center" }}>
          <Text style={[localStyles.miniQuestTitle, { textAlign: "center" }]}>
            Bạn đã hoàn thành hết nhiệm vụ hôm nay!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.questPreviewSection}>
      <View style={styles.questPreviewHeader}>
        <Text style={styles.sectionLabel}>NHIỆM VỤ HÔM NAY</Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/quests")}>
          <Text style={styles.viewAllText}>Xem tất cả →</Text>
        </TouchableOpacity>
      </View>

      {pendingQuests.slice(0, 3).map((quest) => (
        <NeoBrutalBox
          key={quest.quest_id}
          borderColor={colors.glassBorder}
          backgroundColor={colors.bgSurface}
          shadowColor="#000"
          shadowOffsetX={2}
          shadowOffsetY={2}
          borderWidth={1}
          borderRadius={12}
          style={{ marginBottom: 8 }}
          onPress={() => router.push(`/quest/${quest.quest_id}`)}
          contentStyle={{
            padding: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={styles.miniQuestContent}>
            <View
              style={[
                styles.miniQuestDot,
                {
                  backgroundColor:
                    branchColors[quest.branch] ?? colors.brandPrimary,
                },
              ]}
            />
            <Text style={styles.miniQuestTitle} numberOfLines={1}>
              {quest.title}
            </Text>
          </View>
          <View style={styles.miniQuestXP}>
            <Text style={styles.miniQuestXPText}>
              +{quest.xp_reward} XP
            </Text>
          </View>
        </NeoBrutalBox>
      ))}
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    questPreviewSection: {
      marginTop: 24,
    },
    questPreviewHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    sectionLabel: {
      fontSize: 10,
      fontWeight: "800",
      color: colors.textMuted,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      marginBottom: 0,
    },
    viewAllText: {
      fontSize: 12,
      fontFamily: "SpaceGrotesk-SemiBold",
      fontWeight: "600",
      color: colors.brandPrimary,
      marginBottom: 8,
    },
    miniQuestContent: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      gap: 10,
    },
    miniQuestDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    miniQuestTitle: {
      fontSize: 14,
      fontFamily: "SpaceGrotesk-Medium",
      fontWeight: "500",
      color: colors.textPrimary,
      flex: 1,
    },
    miniQuestXP: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    miniQuestXPText: {
      fontSize: 10,
      fontFamily: "SpaceGrotesk-Bold",
      fontWeight: "700",
      color: colors.softskills,
    },
  });
