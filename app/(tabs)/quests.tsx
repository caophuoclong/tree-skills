import { router } from "expo-router";
import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useChallengeStore } from "@/src/business-logic/stores/challengeStore";
import { useQuestsScreen } from "@/src/hooks/useQuestsScreen";
import { Emoji, NeoBrutalAccent } from "@/src/ui/atoms";
import { ChallengeCard, ComboBar } from "@/src/ui/molecules";
import { QuestItem } from "@/src/ui/molecules/QuestItemComponent";
import { WellbeingWarningBanner } from "@/src/ui/organisms/WellbeingWarningBanner";
import { IColors, useTheme } from "@/src/ui/tokens";

export default function QuestsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const {
    quests,
    completedCount,
    totalCount,
    stamina,
    combo,
    progressPercent,
    showWellbeingBanner,
    wellbeingQuest,
    today,
    handleComplete,
    setWellbeingDismissedDate,
  } = useQuestsScreen();
  // Challenges are fetched by useAppData at root — just read from store
  const challenges = useChallengeStore((s) => s.challenges);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Nhiệm vụ hôm nay</Text>
          <View style={styles.headerRight}>
            <ComboBar combo={combo} />
            <View style={styles.staminaRow}>
              <Emoji size={13}>⚡</Emoji>
              <View style={styles.staminaBarTrack}>
                <View
                  style={[
                    styles.staminaBarFill,
                    { width: `${stamina}%` as any },
                  ]}
                />
              </View>
              <Text style={styles.staminaText}>{stamina}%</Text>
            </View>
          </View>
        </View>

        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Tiến độ hoàn thành</Text>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressPercent}%` as any },
              ]}
            />
          </View>
          <NeoBrutalAccent
            accentColor={`${colors.bgBase}`}
            strokeColor={colors.brandPrimary}
            borderWidth={1}
            shadowOffsetX={2}
            shadowOffsetY={2}
            borderRadius={9999}
            contentStyle={styles.completePill}
          >
            <Text style={styles.completePillText}>
              XONG {completedCount}/{totalCount}
            </Text>
          </NeoBrutalAccent>
        </View>

        {showWellbeingBanner && (
          <WellbeingWarningBanner
            onDismiss={() => setWellbeingDismissedDate(today)}
            onCTA={() =>
              wellbeingQuest &&
              router.push(`/quest/${wellbeingQuest.quest_id}` as any)
            }
          />
        )}

        <View style={styles.questList}>
          {quests.length === 0 ? (
            <View style={styles.emptyState}>
              <Emoji size={48}>🌱</Emoji>
              <Text style={styles.emptyText}>
                Chưa có nhiệm vụ nào. Hãy hoàn thành onboarding để bắt đầu!
              </Text>
            </View>
          ) : (
            quests.map((quest) => (
              <QuestItem
                key={quest.quest_id}
                quest={quest}
                onComplete={handleComplete}
              />
            ))
          )}
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text style={styles.challengesTitle}>🏆 Weekly Challenges</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {challenges.map((ch) => (
              <ChallengeCard key={ch.id} challenge={ch} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: IColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bgBase,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 16,
    },

    header: {
      flexDirection: "column",
      gap: 8,
      marginBottom: 12,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.textPrimary,
    },
    headerRight: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    staminaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    staminaBarTrack: {
      width: 52,
      height: 4,
      backgroundColor: colors.bgElevated,
      borderRadius: 2,
      overflow: "hidden",
    },
    staminaBarFill: {
      height: 4,
      backgroundColor: colors.finance,
      borderRadius: 2,
    },
    staminaText: {
      fontSize: 11,
      color: colors.finance,
      fontFamily: "SpaceGrotesk-SemiBold",
      fontWeight: "600",
      minWidth: 30,
    },

    progressRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 20,
    },
    progressLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      flexShrink: 0,
    },
    progressBarTrack: {
      flex: 1,
      height: 4,
      backgroundColor: colors.bgElevated,
      borderRadius: 2,
      overflow: "hidden",
    },
    progressBarFill: {
      height: 4,
      backgroundColor: colors.brandPrimary,
      borderRadius: 2,
    },
    completePill: {
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    completePillText: {
      fontSize: 10,
      fontFamily: "SpaceGrotesk-Bold",
      fontWeight: "700",
      color: colors.brandPrimary,
    },

    questList: {
      gap: 12,
    },

    emptyState: {
      alignItems: "center",
      paddingVertical: 40,
      gap: 8,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      paddingHorizontal: 20,
    },

    challengesTitle: {
      fontSize: 16,
      marginBottom: 10,
      marginHorizontal: 20,
      fontFamily: "SpaceGrotesk-Bold",
      color: colors.textPrimary,
    },

    bottomSpacer: {
      height: 100,
    },
  });
