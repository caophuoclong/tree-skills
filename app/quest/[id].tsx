import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useQuestManager } from "@/src/business-logic/hooks/useQuestManager";
import type { Quest } from "@/src/business-logic/types";
import { NeoBrutalAccent, NeoBrutalBox } from "@/src/ui/atoms";
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
  const xpAnim = React.useRef(new Animated.Value(0)).current;
  const [showXP, setShowXP] = React.useState(false);
  const [xpResult, setXpResult] = React.useState<{
    bonusXP: number;
    multiplier: number;
  } | null>(null);

  const quest: Quest | undefined = quests.find((q) => q.quest_id === id);

  const isCompleted = quest ? quest.completed_at !== null : false;
  const branchColor = quest
    ? (BRANCH_COLORS[quest.branch] ?? colors.brandPrimary)
    : colors.brandPrimary;

  const handleComplete = useCallback(() => {
    if (!quest || isCompleted) return;
    const result = completeQuest(quest.quest_id);

    if (result) {
      setXpResult({ bonusXP: result.bonusXP, multiplier: result.multiplier });
    }

    // XP Animation
    setShowXP(true);
    Animated.sequence([
      Animated.timing(xpAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(xpAnim, {
        toValue: 0,
        duration: 200,
        delay: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowXP(false);
      router.back();
    });
  }, [quest, isCompleted, completeQuest, xpAnim]);

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
          <View style={styles.tagsRow}>
            <NeoBrutalAccent
              accentColor={`${colors.bgBase}`}
              strokeColor={branchColor}
              borderWidth={1}
              shadowOffsetX={2}
              shadowOffsetY={2}
              borderRadius={9999}
              contentStyle={styles.tagChip}
            >
              <Text style={[styles.tagText, { color: branchColor }]}>
                {BRANCH_LABELS[quest.branch] ?? quest.branch}
              </Text>
            </NeoBrutalAccent>
            <NeoBrutalBox
              borderColor={colors.glassBorder}
              backgroundColor={colors.bgElevated}
              shadowColor="#000"
              shadowOffsetX={2}
              shadowOffsetY={2}
              borderWidth={1}
              borderRadius={9999}
              contentStyle={styles.tagChipNeutral}
            >
              <Text style={styles.tagTextNeutral}>
                {quest.duration_min} MIN
              </Text>
            </NeoBrutalBox>
            <NeoBrutalAccent
              accentColor="rgba(251,191,36,0.15)"
              strokeColor="#FBBF24"
              borderWidth={1}
              shadowOffsetX={2}
              shadowOffsetY={2}
              borderRadius={9999}
              contentStyle={styles.tagChipXP}
            >
              <Ionicons name="flash" size={10} color={colors.softskills} />
              <Text style={styles.tagTextXP}>+{quest.xp_reward} XP</Text>
            </NeoBrutalAccent>
          </View>
        </NeoBrutalBox>

        {/* ── Tại sao điều này quan trọng ──────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TẠI SAO ĐIỀU NÀY QUAN TRỌNG</Text>
          <Text style={styles.sectionBody}>{whyText}</Text>
        </View>

        {/* ── Cách hoàn thành ───────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CÁCH HOÀN THÀNH</Text>
          <View style={styles.stepsContainer}>
            {steps.map((step, index) => (
              <View key={index} style={styles.stepRow}>
                <NeoBrutalBox
                  borderColor={colors.brandPrimary}
                  backgroundColor={colors.bgBase}
                  shadowColor={colors.brandPrimary}
                  shadowOffsetX={2}
                  shadowOffsetY={2}
                  borderWidth={1.5}
                  borderRadius={12}
                  contentStyle={styles.stepNumber}
                >
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </NeoBrutalBox>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
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
        <Text style={styles.footerNote}>
          ⚡ Không tốn Thể lực · Nhận XP thuần
        </Text>
        {isCompleted ? (
          <NeoBrutalBox
            borderColor={`${colors.finance}33`}
            backgroundColor={`${colors.finance}1A`}
            shadowColor={colors.finance}
            shadowOffsetX={3}
            shadowOffsetY={3}
            borderWidth={1}
            borderRadius={26}
            contentStyle={styles.completedBtn}
          >
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={colors.finance}
            />
            <Text style={styles.completedBtnText}>Đã hoàn thành</Text>
          </NeoBrutalBox>
        ) : (
          <NeoBrutalAccent
            accentColor={branchColor}
            strokeColor="rgba(0,0,0,0.5)"
            shadowOffsetX={4}
            shadowOffsetY={4}
            borderWidth={2}
            borderRadius={26}
            contentStyle={styles.completeBtn}
            onPress={handleComplete}
          >
            <Text style={styles.completeBtnText}>Đánh dấu hoàn thành</Text>
          </NeoBrutalAccent>
        )}
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.skipText}>Bỏ qua hôm nay</Text>
        </TouchableOpacity>
      </View>

      {/* XP Floating Animation */}
      {showXP && (
        <Animated.View
          style={[
            styles.xpFloatContainer,
            {
              opacity: xpAnim,
              transform: [
                {
                  translateY: xpAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -120],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Hard offset shadow background */}
          <View style={[styles.xpFloatShadow, { top: 3, left: 3 }]} />
          <View style={styles.xpFloat}>
            <Text style={styles.xpFloatText}>
              +{quest?.xp_reward} XP
              {xpResult && xpResult.bonusXP > 0 && (
                <Text style={styles.xpBonusText}>
                  {" "}
                  +{xpResult.bonusXP} COMBO
                </Text>
              )}
            </Text>
            {xpResult && xpResult.multiplier > 1 && (
              <View style={styles.comboBadge}>
                <Text style={styles.comboText}>
                  X{xpResult.multiplier} MULTIPLIER
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      )}
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

    // XP Float Container
    xpFloatContainer: {
      position: "absolute",
      bottom: 120,
      alignSelf: "center",
    },
    // XP Float hard offset shadow
    xpFloatShadow: {
      position: "absolute",
      backgroundColor: `${colors.softskills}33`,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.softskills,
      paddingHorizontal: 20,
      paddingVertical: 10,
      width: "auto",
      minWidth: 160,
    },
    // XP Float main content
    xpFloat: {
      backgroundColor: colors.bgSurface,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.softskills,
    },
    xpFloatText: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.softskills,
      textAlign: "center",
    },
    xpBonusText: {
      fontSize: 14,
      color: colors.career, // Use a bright color for bonus
    },
    comboBadge: {
      backgroundColor: colors.career,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
      marginTop: 4,
    },
    comboText: {
      fontSize: 10,
      fontWeight: "900",
      color: "#000000",
      letterSpacing: 1,
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
    tagsRow: {
      flexDirection: "row",
      gap: 8,
      marginTop: 12,
      flexWrap: "wrap",
    },
    tagChip: {
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    tagText: {
      fontSize: 10,
      fontFamily: "SpaceGrotesk-Bold",
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    tagChipNeutral: {
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    tagTextNeutral: {
      fontSize: 10,
      color: colors.textSecondary,
      fontFamily: "SpaceGrotesk-SemiBold",
      fontWeight: "600",
    },
    tagChipXP: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    tagTextXP: {
      fontSize: 10,
      fontFamily: "SpaceGrotesk-Bold",
      fontWeight: "700",
      color: colors.softskills,
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

    // Steps
    stepsContainer: {
      gap: 12,
    },
    stepRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
    },
    stepNumber: {
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    stepNumberText: {
      fontSize: 12,
      fontFamily: "SpaceGrotesk-Bold",
      fontWeight: "700",
      color: colors.brandPrimary,
    },
    stepText: {
      fontSize: 13,
      color: colors.textSecondary,
      flex: 1,
      lineHeight: 20,
      paddingTop: 2,
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
    footerNote: {
      fontSize: 11,
      color: colors.textMuted,
      textAlign: "center",
      marginBottom: 16,
    },
    completeBtn: {
      height: 52,
      alignItems: "center",
      justifyContent: "center",
    },
    completeBtnText: {
      fontSize: 16,
      fontFamily: "SpaceGrotesk-Bold",
      fontWeight: "700",
      color: "#FFFFFF",
    },
    completedBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      height: 52,
      gap: 8,
    },
    completedBtnText: {
      fontSize: 16,
      fontFamily: "SpaceGrotesk-SemiBold",
      fontWeight: "600",
      color: colors.finance,
    },
    skipText: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: "center",
      marginTop: 12,
    },
  });
