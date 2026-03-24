import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useChallengeStore } from "@/src/business-logic/stores/challengeStore";
import { useQuestStore } from "@/src/business-logic/stores/questStore";
import type { Branch } from "@/src/business-logic/types";
import { useQuestsScreen } from "@/src/hooks/useQuestsScreen";
import { Emoji, NeoBrutalAccent } from "@/src/ui/atoms";
import { ChallengeCard, ComboBar } from "@/src/ui/molecules";
import { QuestItem } from "@/src/ui/molecules/QuestItemComponent";
import { WellbeingWarningBanner } from "@/src/ui/organisms/WellbeingWarningBanner";
import { IColors, useTheme } from "@/src/ui/tokens";

type FilterStatus = "all" | "pending" | "done";
type FilterDifficulty = "all" | "easy" | "medium" | "hard";
type FilterBranch = "all" | Branch;

export default function QuestsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const {
    quests,
    pendingQuests,
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

  const dailyQuests = useQuestStore((s) => s.dailyQuests);

  const [, setTick] = useState(0);
  useFocusEffect(useCallback(() => { setTick((t) => t + 1); }, []));

  const challenges = useChallengeStore((s) => s.challenges);

  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterDifficulty, setFilterDifficulty] = useState<FilterDifficulty>("all");
  const [filterBranch, setFilterBranch] = useState<FilterBranch>("all");

  const filteredQuests = useMemo(() => {
    return dailyQuests.filter((q) => {
      if (filterStatus === "pending" && q.completed_at !== null) return false;
      if (filterStatus === "done" && q.completed_at === null) return false;
      if (filterDifficulty !== "all" && q.difficulty !== filterDifficulty) return false;
      if (filterBranch !== "all" && q.branch !== filterBranch) return false;
      return true;
    });
  }, [dailyQuests, filterStatus, filterDifficulty, filterBranch]);

  const statusPills: { label: string; value: FilterStatus }[] = [
    { label: "Tất cả", value: "all" },
    { label: "Chưa xong", value: "pending" },
    { label: "Xong rồi", value: "done" },
  ];

  const difficultyPills: { label: string; value: FilterDifficulty }[] = [
    { label: "Tất cả mức", value: "all" },
    { label: "Dễ", value: "easy" },
    { label: "Trung bình", value: "medium" },
    { label: "Khó", value: "hard" },
  ];

  const branchPills: { label: string; value: FilterBranch }[] = [
    { label: "Tất cả ngành", value: "all" },
    { label: "Sự nghiệp", value: "career" },
    { label: "Tài chính", value: "finance" },
    { label: "Kỹ năng mềm", value: "softskills" },
    { label: "Sức khoẻ", value: "wellbeing" },
  ];

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

        {/* Filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          style={styles.filterScroll}
        >
          {statusPills.map((pill) => (
            <TouchableOpacity
              key={pill.value}
              style={[
                styles.filterPill,
                {
                  backgroundColor: filterStatus === pill.value ? colors.brandPrimary : colors.bgElevated,
                  borderColor: filterStatus === pill.value ? colors.brandPrimary : colors.glassBorder,
                },
              ]}
              onPress={() => setFilterStatus(pill.value)}
            >
              <Text style={[
                styles.filterPillText,
                { color: filterStatus === pill.value ? "#fff" : colors.textSecondary },
              ]}>
                {pill.label}
              </Text>
            </TouchableOpacity>
          ))}

          <View style={[styles.filterDivider, { backgroundColor: colors.glassBorder }]} />

          {difficultyPills.map((pill) => (
            <TouchableOpacity
              key={pill.value}
              style={[
                styles.filterPill,
                {
                  backgroundColor: filterDifficulty === pill.value ? colors.brandPrimary : colors.bgElevated,
                  borderColor: filterDifficulty === pill.value ? colors.brandPrimary : colors.glassBorder,
                },
              ]}
              onPress={() => setFilterDifficulty(pill.value)}
            >
              <Text style={[
                styles.filterPillText,
                { color: filterDifficulty === pill.value ? "#fff" : colors.textSecondary },
              ]}>
                {pill.label}
              </Text>
            </TouchableOpacity>
          ))}

          <View style={[styles.filterDivider, { backgroundColor: colors.glassBorder }]} />

          {branchPills.map((pill) => (
            <TouchableOpacity
              key={pill.value}
              style={[
                styles.filterPill,
                {
                  backgroundColor: filterBranch === pill.value ? colors.brandPrimary : colors.bgElevated,
                  borderColor: filterBranch === pill.value ? colors.brandPrimary : colors.glassBorder,
                },
              ]}
              onPress={() => setFilterBranch(pill.value)}
            >
              <Text style={[
                styles.filterPillText,
                { color: filterBranch === pill.value ? "#fff" : colors.textSecondary },
              ]}>
                {pill.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Browse nodes link */}
        <TouchableOpacity
          style={styles.browseLink}
          onPress={() => router.push("/(tabs)/tree")}
        >
          <Text style={[styles.browseLinkText, { color: colors.brandPrimary }]}>
            Duyệt Kỹ năng →
          </Text>
        </TouchableOpacity>

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
          {filteredQuests.length === 0 && dailyQuests.length === 0 ? (
            <View style={styles.emptyState}>
              <Emoji size={48}>🌱</Emoji>
              <Text style={styles.emptyText}>
                Chưa có nhiệm vụ nào. Hãy hoàn thành onboarding để bắt đầu!
              </Text>
            </View>
          ) : filteredQuests.length === 0 ? (
            <View style={styles.emptyState}>
              <Emoji size={32}>🔍</Emoji>
              <Text style={styles.emptyText}>
                Không có nhiệm vụ phù hợp với bộ lọc
              </Text>
            </View>
          ) : (
            filteredQuests.map((quest) => (
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
      marginBottom: 12,
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

    filterScroll: {
      marginBottom: 0,
    },
    filterRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 4,
    },
    filterPill: {
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderWidth: 1,
    },
    filterPillText: {
      fontSize: 10,
      fontFamily: "SpaceGrotesk-SemiBold",
      fontWeight: "600",
    },
    filterDivider: {
      width: 1,
      height: 16,
      marginHorizontal: 2,
    },

    browseLink: {
      alignSelf: "flex-start",
      paddingVertical: 8,
      marginBottom: 12,
    },
    browseLinkText: {
      fontSize: 13,
      fontFamily: "SpaceGrotesk-SemiBold",
      fontWeight: "600",
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
