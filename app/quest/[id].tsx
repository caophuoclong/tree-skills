import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { questService } from "@/src/business-logic/api/services/questService";
import { useQuestManager } from "@/src/business-logic/hooks/useQuestManager";
import { useStaminaSystem } from "@/src/business-logic/hooks/useStaminaSystem";
import { useSkillTreeStore } from "@/src/business-logic/stores/skillTreeStore";
import { useUserStore } from "@/src/business-logic/stores/userStore";
import type { Quest } from "@/src/business-logic/types";
import { NeoBrutalBox } from "@/src/ui/atoms";
import {
  QuestCompleteButton,
  QuestMetaRow,
  QuestStepList,
  StaminaBar,
} from "@/src/ui/molecules";
import { useTheme } from "@/src/ui/tokens";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getBranchColors = (colors: any): Record<string, string> => ({
  career: colors.career,
  finance: colors.finance,
  softskills: colors.softskills,
  wellbeing: colors.wellbeing,
});

const BRANCH_LABELS: Record<string, string> = {
  career: "SỰ NGHIỆP",
  finance: "TÀI CHÍNH",
  softskills: "KỸ NĂNG MỀM",
  wellbeing: "SỨC KHỎE",
};

const BRANCH_CATEGORY_LABELS: Record<string, string> = {
  career: "Nhiệm vụ Sự nghiệp",
  finance: "Nhiệm vụ Tài chính",
  softskills: "Nhiệm vụ Kỹ năng mềm",
  wellbeing: "Nhiệm vụ Sức khoẻ",
};

const WHY_TEXT: Record<string, string> = {
  career:
    "Xây dựng kết nối chuyên nghiệp là một trong những hoạt động mang lại giá trị cao nhất cho sự nghiệp. Hầu hết cơ hội đến từ những người bạn quen biết, không phải từ các trang tuyển dụng.",
  finance:
    "Thói quen tài chính tích lũy theo thời gian. Những hành động nhỏ nhất quán hôm nay tạo ra tự do để đưa ra những lựa chọn lớn hơn vào ngày mai.",
  softskills:
    "Kỹ năng giao tiếp là hệ số nhân cho tất cả các kỹ năng khác. Cải thiện cách bạn kết nối với mọi người sẽ mở ra tăng trưởng vượt bậc trong mọi lĩnh vực.",
  wellbeing:
    "Trạng thái tinh thần và thể chất ảnh hưởng trực tiếp đến mọi lĩnh vực khác trong cuộc sống. Đầu tư vào sức khỏe chính là đầu tư vào hiệu suất tổng thể của bạn.",
};

const RESOURCES: Record<string, { label: string; url: string }[]> = {
  career: [
    { label: "LinkedIn Networking Guide", url: "linkedin.com/learning" },
    { label: "Cold Email Templates", url: "resources.io/templates" },
  ],
  finance: [
    { label: "Budgeting 101", url: "investopedia.com/budgeting" },
    { label: "Emergency Fund Calculator", url: "nerdwallet.com/calculator" },
  ],
  softskills: [
    { label: "Active Listening Techniques", url: "mindtools.com/listening" },
    { label: "Public Speaking Guide", url: "toastmasters.org" },
  ],
  wellbeing: [
    { label: "Mindfulness Starter Guide", url: "headspace.com/mindfulness" },
    { label: "Stress Management Toolkit", url: "mentalhealth.org/tools" },
  ],
};

const QUEST_STEPS: Record<string, string[]> = {
  // Career – easy
  career_easy: [
    "Tìm một không gian yên tĩnh và tắt thông báo điện thoại.",
    "Thực hiện nhiệm vụ theo mô tả, ghi chú những điều bạn học được.",
    "Lưu kết quả lại — ảnh chụp màn hình, ghi chú, hoặc file.",
  ],
  career_medium: [
    "Đọc kỹ yêu cầu và chuẩn bị môi trường làm việc phù hợp.",
    "Thực hiện từng bước theo mô tả nhiệm vụ một cách có chủ đích.",
    "Ghi lại ít nhất 1 điều bạn học được hoặc cải thiện được.",
    "Lưu kết quả và đánh dấu hoàn thành.",
  ],
  career_hard: [
    "Dành 5 phút đọc kỹ yêu cầu và lên kế hoạch thực hiện.",
    "Thực hiện phần chính của nhiệm vụ — tập trung 100%, không multitask.",
    "Rà soát lại kết quả và điều chỉnh nếu cần.",
    "Ghi chú 2-3 điều rút ra được và lưu sản phẩm cuối cùng.",
  ],
  finance_easy: [
    "Mở ứng dụng ghi chú hoặc sổ tay.",
    "Thực hiện nhiệm vụ theo mô tả — không cần hoàn hảo, bắt đầu là đủ.",
    "Lưu lại kết quả để theo dõi tiến độ sau này.",
  ],
  finance_medium: [
    "Tập hợp các thông tin cần thiết trước khi bắt đầu.",
    "Thực hiện từng bước theo mô tả một cách cẩn thận.",
    "Kiểm tra lại con số hoặc thông tin vừa nhập.",
    "Ghi lại nhận xét của bạn về kết quả.",
  ],
  finance_hard: [
    "Dành 5 phút lên kế hoạch và xác định nguồn thông tin cần dùng.",
    "Thực hiện phần phân tích hoặc hành động chính của nhiệm vụ.",
    "Đánh giá kết quả và so sánh với mục tiêu ban đầu.",
    "Viết tóm tắt ngắn gọn những gì bạn đã thực hiện và học được.",
  ],
  softskills_easy: [
    "Sẵn sàng tinh thần — thư giãn và tập trung vào hiện tại.",
    "Thực hiện nhiệm vụ theo mô tả — chú ý cảm xúc và phản ứng của bạn.",
    "Phản chiếu 1-2 phút sau khi hoàn thành.",
  ],
  softskills_medium: [
    "Đọc kỹ yêu cầu và hình dung tình huống thực tế.",
    "Thực hành kỹ năng theo từng bước được mô tả.",
    "Nhận xét bản thân: điều gì làm tốt, điều gì cần cải thiện?",
    "Ghi lại 1 hành động cụ thể để cải thiện lần sau.",
  ],
  softskills_hard: [
    "Chuẩn bị không gian và tâm trạng phù hợp để thực hành.",
    "Thực hiện bài tập kỹ năng một cách có ý thức và chú tâm.",
    "Thu thập phản hồi nếu có (từ người khác hoặc tự ghi âm/ghi hình).",
    "Phân tích điểm mạnh và điểm yếu dựa trên phản hồi.",
    "Lên kế hoạch luyện tập thêm 1 lần trong tuần này.",
  ],
  wellbeing_easy: [
    "Tìm không gian thoải mái, yên tĩnh.",
    "Thực hiện nhiệm vụ chậm rãi, không vội vàng.",
    "Chú ý cảm giác của cơ thể và tâm trí trong lúc thực hiện.",
  ],
  wellbeing_medium: [
    "Đặt điện thoại sang một bên và tạo không gian yên tĩnh.",
    "Thực hiện từng bước theo mô tả với sự chú tâm đầy đủ.",
    "Dành 2-3 phút cuối để ngồi yên và cảm nhận sự khác biệt.",
    "Ghi lại cảm nhận của bạn — điều này rất quan trọng cho việc theo dõi tiến trình.",
  ],
  wellbeing_hard: [
    "Chuẩn bị môi trường: tắt thông báo, chuẩn bị nước uống nếu cần.",
    "Thực hiện phần chính của nhiệm vụ một cách trọn vẹn.",
    "Nghỉ ngơi 2 phút giữa chừng nếu cảm thấy mệt.",
    "Hoàn thành phần còn lại và ghi lại cảm nhận sau khi xong.",
    "Đặt lịch nhắc để lặp lại hoạt động này ít nhất 2 lần/tuần.",
  ],
};

function parseSteps(
  description: string,
  branch?: string,
  difficulty?: string,
): string[] {
  const key = `${branch ?? "career"}_${difficulty ?? "easy"}`;
  const steps = QUEST_STEPS[key];
  if (steps) return steps;
  // fallback: split description into sentences
  const sentences = description
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return sentences.length > 0 ? sentences : [description];
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function QuestDetailScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const BRANCH_COLORS = useMemo(() => getBranchColors(colors), [colors]);

  const { id } = useLocalSearchParams<{ id: string }>();
  const { quests, completeQuest } = useQuestManager();
  const { stamina, status, isGated } = useStaminaSystem();
  const { dailyStats } = useUserStore();

  // Fetch quest from server
  const { data: serverQuest, isLoading } = useQuery({
    queryKey: ["quest", id],
    queryFn: () => questService.getById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  // Use server quest, fallback to local store
  const localQuest = quests.find((q) => q.quest_id === id);
  const quest = serverQuest ?? localQuest;

  const isCompleted = quest ? quest.completed_at !== null : false;
  const branchColor = quest
    ? (BRANCH_COLORS[quest.branch] ?? colors.brandPrimary)
    : colors.brandPrimary;

  const handleComplete = useCallback(() => {
    if (!quest || isCompleted) return;

    // Mark quest complete (internally handles XP with stamina multiplier)
    completeQuest(quest.quest_id);

    // Increment node progress in local store
    if (quest.node_id) {
      useSkillTreeStore.getState().incrementNodeQuests(quest.node_id);
    }

    // Auto-navigate back after animations finish
    setTimeout(() => router.back(), 1200);
  }, [quest, isCompleted, completeQuest]);

  if (isLoading && !quest) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.notFound}>
          <ActivityIndicator size="large" color={colors.brandPrimary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!quest) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Quest not found.</Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const steps = parseSteps(quest.description, quest.branch, quest.difficulty);
  const resources = RESOURCES[quest.branch] ?? [];
  const whyText = WHY_TEXT[quest.branch] ?? quest.description;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* ── Header ─────────────────────────────────────────── */}
      <View style={styles.header}>
        <NeoBrutalBox
          borderColor={colors.glassBorder}
          backgroundColor={colors.bgElevated}
          shadowColor="#000"
          shadowOffsetX={2}
          shadowOffsetY={2}
          borderWidth={1.5}
          borderRadius={12}
          contentStyle={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </NeoBrutalBox>
        <Text style={[styles.headerBranchLabel, { color: branchColor }]}>
          {BRANCH_CATEGORY_LABELS[quest.branch] ?? "Quest"}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Title card ─────────────────────────────────────── */}
        <NeoBrutalBox
          borderColor={branchColor}
          backgroundColor={colors.bgSurface}
          shadowColor={branchColor}
          shadowOffsetX={4}
          shadowOffsetY={4}
          borderWidth={2}
          borderRadius={16}
          contentStyle={styles.titleCard}
        >
          <Text style={styles.questTitle}>{quest.title}</Text>
          <QuestMetaRow
            duration={quest.duration_min}
            xpReward={quest.xp_reward}
            difficulty={quest.difficulty}
            branch={quest.branch}
          />
        </NeoBrutalBox>

        {/* ── Tại sao điều này quan trọng ──────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TẠI SAO ĐIỀU NÀY QUAN TRỌNG</Text>
          <Text style={styles.sectionBody}>{whyText}</Text>
        </View>

        {/* ── Cách hoàn thành ───────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CÁCH HOÀN THÀNH</Text>
          <QuestStepList steps={steps} />
        </View>

        {/* ── Tài nguyên tham khảo ────────────────────────── */}
        {resources.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>TÀI NGUYÊN THAM KHẢO</Text>
            {resources.map((resource, index) => (
              <View
                key={index}
                style={[
                  styles.resourceRow,
                  index < resources.length - 1 && styles.resourceRowBorder,
                ]}
              >
                <Ionicons
                  name="link-outline"
                  size={16}
                  color={colors.brandPrimary}
                />
                <Text style={styles.resourceText}>{resource.label}</Text>
                <Ionicons
                  name="open-outline"
                  size={14}
                  color={colors.textMuted}
                />
              </View>
            ))}
          </View>
        )}

        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* ── Footer ───────────────────────────────────────── */}
      <View style={styles.footer}>
        {/* Show stamina bar only if stamina < 70 and quest is career/finance */}
        {stamina < 70 && (quest.branch === 'career' || quest.branch === 'finance') && (
          <View style={styles.staminaBarContainer}>
            <StaminaBar value={stamina} />
          </View>
        )}

        {/* Show gated state if stamina is 0 and career/finance quest */}
        {isGated(quest.branch) ? (
          <QuestCompleteButton
            questId={quest.quest_id}
            xpReward={quest.xp_reward}
            isCompleted={isCompleted}
            sessionCombo={dailyStats.session_combo}
            onComplete={handleComplete}
            isGated={true}
            staminaStatus={status}
          />
        ) : (
          <>
            <Text style={styles.footerNote}>
              {status === 'warning' ? '⚡ XP -25%' : status === 'debuff' ? '⚡ XP -50%' : '⚡ Không tốn Thể lực · Nhận XP thuần'}
            </Text>
            <QuestCompleteButton
              questId={quest.quest_id}
              xpReward={quest.xp_reward}
              isCompleted={isCompleted}
              sessionCombo={dailyStats.session_combo}
              onComplete={handleComplete}
              staminaStatus={status}
            />
          </>
        )}

        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.skipText}>Bỏ qua hôm nay</Text>
        </TouchableOpacity>
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

    // Not found
    notFound: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
    },
    notFoundText: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    backBtn: {
      padding: 8,
    },

    // Header
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
      gap: 8,
    },
    backButton: {
      marginRight: 4,
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
    },
    headerBranchLabel: {
      fontSize: 16,
      fontFamily: "SpaceGrotesk-SemiBold",
      fontWeight: "600",
    },


    // Scroll
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },

    // Title card
    titleCard: {
      padding: 20,
      marginBottom: 0,
    },
    questTitle: {
      fontSize: 22,
      fontFamily: "SpaceGrotesk-Bold",
      fontWeight: "700",
      color: colors.textPrimary,
    },

    // Sections
    section: {
      marginTop: 20,
    },
    sectionLabel: {
      fontSize: 11,
      fontFamily: "SpaceGrotesk-SemiBold",
      fontWeight: "600",
      color: colors.textMuted,
      letterSpacing: 2,
      textTransform: "uppercase",
      marginBottom: 8,
    },
    sectionBody: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 22,
    },


    // Resources
    resourceRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 12,
    },
    resourceRowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.glassBorder,
    },
    resourceText: {
      fontSize: 14,
      color: colors.textPrimary,
      flex: 1,
    },

    // Footer spacer
    footerSpacer: {
      height: 20,
    },

    // Footer
    footer: {
      paddingHorizontal: 20,
      paddingBottom: 20,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.glassBorder,
      backgroundColor: colors.bgBase,
    },
    staminaBarContainer: {
      marginBottom: 16,
    },
    footerNote: {
      fontSize: 11,
      color: colors.textMuted,
      textAlign: "center",
      marginBottom: 16,
    },
    skipText: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: "center",
      marginTop: 12,
    },
  });
