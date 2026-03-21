import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { OnboardingOption } from "@/src/business-logic/api/services/onboardingService";
import { useOnboardingFlow } from "@/src/business-logic/hooks/useOnboardingFlow";
import { NeoBrutalAccent, NeoBrutalBox } from "@/src/ui/atoms";
import { useTheme } from "@/src/ui/tokens";

// ─── Option Card (NeoBrutalism) ──────────────────────────────────────────────

interface OptionCardProps {
  option: OnboardingOption;
  selected: boolean;
  onPress: () => void;
  color: string;
}

function OptionCard({ option, selected, onPress, color }: OptionCardProps) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const borderColor = selected ? color : "#111111";
  const shadowColor = selected ? color : "#111111";
  const bgColor = isDark ? "#1E1E22" : "#FFFFFF";

  return (
    <NeoBrutalBox
      shadowOffsetX={selected ? 2 : 5}
      shadowOffsetY={selected ? 2 : 5}
      shadowColor={shadowColor}
      borderColor={borderColor}
      backgroundColor={bgColor}
      borderWidth={selected ? 2.5 : 2}
      borderRadius={12}
      onPress={onPress}
      style={{ alignSelf: "stretch" }}
      contentStyle={styles.optionContent}
    >
      <View
        style={[styles.optionIconCircle, { backgroundColor: `${color}26` }]}
      >
        <Text style={styles.optionIcon}>{option.icon}</Text>
      </View>
      <View style={styles.optionTextCol}>
        <Text style={styles.optionTitle}>{option.label}</Text>
        {option.label_en ? (
          <Text style={styles.optionSubtitle}>{option.label_en}</Text>
        ) : null}
        {option.desc ? (
          <Text style={styles.optionDesc}>{option.desc}</Text>
        ) : null}
      </View>
      {selected && (
        <View style={[styles.checkBadge, { backgroundColor: color }]}>
          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
        </View>
      )}
    </NeoBrutalBox>
  );
}

// ─── Stamina Selector (NeoBrutalism) ─────────────────────────────────────────

interface StaminaSelectorProps {
  value: number | null;
  onChange: (v: number) => void;
}

function StaminaSelector({ value, onChange }: StaminaSelectorProps) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const levels = [
    { val: 1, label: "Rất thấp", emoji: "😫", color: colors.danger },
    { val: 3, label: "Thấp", emoji: "😕", color: colors.staminaLow },
    { val: 5, label: "Bình thường", emoji: "😐", color: colors.staminaMid },
    { val: 7, label: "Tốt", emoji: "🙂", color: colors.staminaOk },
    { val: 10, label: "Rất tốt", emoji: "🔥", color: colors.success },
  ];

  return (
    <View style={styles.staminaContainer}>
      {levels.map((level) => {
        const selected = value === level.val;
        return (
          <NeoBrutalBox
            key={level.val}
            shadowOffsetX={selected ? 2 : 4}
            shadowOffsetY={selected ? 2 : 4}
            shadowColor={selected ? level.color : "#111111"}
            borderColor={selected ? level.color : "#111111"}
            backgroundColor={isDark ? "#1E1E22" : "#FFFFFF"}
            borderWidth={selected ? 2.5 : 2}
            borderRadius={12}
            onPress={() => {
              Haptics.selectionAsync();
              onChange(level.val);
            }}
            style={{ width: "100%", flex: 1 }}
            contentStyle={styles.staminaContent}
          >
            <Text style={styles.staminaEmoji}>{level.emoji}</Text>
            <View style={styles.staminaTextCol}>
              <Text style={styles.staminaLabel}>{level.label}</Text>
              <Text style={styles.staminaValue}>{level.val}/10</Text>
            </View>
            {selected && (
              <View
                style={[styles.checkBadge, { backgroundColor: level.color }]}
              >
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              </View>
            )}
          </NeoBrutalBox>
        );
      })}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const {
    currentStep,
    currentStepIndex,
    totalSteps,
    answers,
    isLoading,
    isSaving,
    selectOption,
    setStamina,
    canProceed,
    goNext,
    goBack,
    finishOnboarding,
    skipStep,
    isLastStep,
    isFirstStep,
  } = useOnboardingFlow();

  if (isLoading || !currentStep) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingState}>
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const progressPercent = ((currentStepIndex + 1) / totalSteps) * 100;
  const currentAnswer = answers[currentStep.step_key];

  const getSelectedIds = (): string[] => {
    if (currentStep.step_key === "stamina") return [];
    if (currentStep.multiple) {
      return Array.isArray(currentAnswer) ? currentAnswer : [];
    }
    return currentAnswer ? [currentAnswer as string] : [];
  };

  const isSelected = (optionId: string): boolean => {
    return getSelectedIds().includes(optionId);
  };

  const getStepColor = (): string => {
    switch (currentStep.step_key) {
      case "career_stage":
        return colors.career;
      case "priority_goal":
        return colors.brandPrimary;
      case "pain_point":
        return colors.danger;
      case "stamina":
        return colors.warning;
      case "content_format":
        return colors.finance;
      case "mbti":
        return colors.softskills;
      default:
        return colors.brandPrimary;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.backBtn}>
          {!isFirstStep && (
            <Ionicons
              name="chevron-back"
              size={20}
              color={colors.textSecondary}
              onPress={goBack}
            />
          )}
        </View>
        <Text style={styles.stepLabel}>
          STEP {currentStepIndex + 1} OF {totalSteps}
        </Text>
      </View>

      {/* Progress */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.titleText}>{currentStep.title}</Text>
        <Text style={styles.titleSub}>{currentStep.subtitle}</Text>

        {/* Multiple hint */}
        {currentStep.multiple && (
          <Text style={styles.multipleHint}>Có thể chọn nhiều</Text>
        )}

        {/* Content */}
        {currentStep.step_key === "stamina" ? (
          <StaminaSelector
            value={typeof currentAnswer === "number" ? currentAnswer : null}
            onChange={setStamina}
          />
        ) : (
          <View style={styles.optionsContainer}>
            {currentStep.options.map((option) => (
              <OptionCard
                key={option.id}
                option={option}
                selected={isSelected(option.id)}
                onPress={() => {
                  Haptics.selectionAsync();
                  selectOption(
                    currentStep.step_key,
                    option.id,
                    currentStep.multiple,
                  );
                }}
                color={getStepColor()}
              />
            ))}
          </View>
        )}

        {/* Skip option */}
        {currentStep.step_key === "mbti" && (
          <NeoBrutalBox
            shadowOffsetX={3}
            shadowOffsetY={3}
            shadowColor="#111111"
            borderColor="#111111"
            backgroundColor={isDark ? "#1E1E22" : "#F8F9FA"}
            borderWidth={2}
            borderRadius={12}
            onPress={skipStep}
            style={{ alignSelf: "stretch", marginTop: 12 }}
            contentStyle={styles.skipContent}
          >
            <Text style={styles.skipText}>Bỏ qua bước này</Text>
          </NeoBrutalBox>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom button */}
      <View style={styles.bottomSection}>
        <NeoBrutalAccent
          accentColor={canProceed ? getStepColor() : "#9CA3AF"}
          strokeColor="#111111"
          shadowOffsetX={4}
          shadowOffsetY={4}
          borderWidth={2}
          borderRadius={26}
          onPress={
            canProceed ? (isLastStep ? finishOnboarding : goNext) : undefined
          }
          style={{ opacity: canProceed && !isSaving ? 1 : 0.6 }}
          contentStyle={styles.primaryBtn}
        >
          <Text style={styles.primaryBtnText}>
            {isLastStep ? (isSaving ? "Đang lưu..." : "Hoàn tất") : "Tiếp tục"}
          </Text>
        </NeoBrutalAccent>
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
    loadingState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    loadingText: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    backBtn: {
      width: 60,
    },
    stepLabel: {
      fontSize: 12,
      color: colors.textMuted,
      fontFamily: "SpaceGrotesk-Medium",
      fontWeight: "500",
    },
    progressTrack: {
      height: 3,
      backgroundColor: colors.bgElevated,
      marginHorizontal: 20,
      borderRadius: 2,
      overflow: "hidden",
    },
    progressFill: {
      height: 3,
      backgroundColor: colors.brandPrimary,
      borderRadius: 2,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 28,
    },
    titleText: {
      fontSize: 26,
      fontWeight: "800",
      color: colors.textPrimary,
      lineHeight: 34,
      marginBottom: 8,
    },
    titleSub: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    multipleHint: {
      fontSize: 12,
      color: colors.textMuted,
      fontStyle: "italic",
      marginBottom: 16,
    },
    optionsContainer: {
      gap: 12,
    },
    optionContent: {
      flexDirection: "row",
      alignItems: "center",
      padding: 14,
    },
    optionIconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    optionIcon: {
      fontSize: 22,
    },
    optionTextCol: {
      flex: 1,
      marginLeft: 14,
      gap: 2,
    },
    optionTitle: {
      fontSize: 15,
      fontFamily: "SpaceGrotesk-Bold",
      fontWeight: "700",
      color: colors.textPrimary,
    },
    optionSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    optionDesc: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 2,
    },
    checkBadge: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      position: "absolute",
      top: 10,
      right: 10,
    },
    staminaContainer: {
      flexDirection: "column",
      gap: 12,
    },
    staminaContent: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      gap: 16,
    },
    staminaEmoji: {
      fontSize: 32,
    },
    staminaTextCol: {
      flex: 1,
    },
    staminaLabel: {
      fontSize: 14,
      fontFamily: "SpaceGrotesk-Bold",
      fontWeight: "700",
      color: colors.textPrimary,
    },
    staminaValue: {
      fontSize: 12,
      color: colors.textMuted,
    },
    skipContent: {
      padding: 14,
      alignItems: "center",
    },
    skipText: {
      fontSize: 14,
      color: colors.textMuted,
      fontFamily: "SpaceGrotesk-Medium",
    },
    bottomSection: {
      paddingHorizontal: 20,
      paddingBottom: 24,
      paddingTop: 8,
    },
    primaryBtn: {
      height: 52,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryBtnText: {
      fontSize: 16,
      fontFamily: "SpaceGrotesk-Bold",
      fontWeight: "700",
      color: "#FFFFFF",
    },
  });
