import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  mockAIGenerate,
  useCustomSkillTreeStore,
} from "@/src/business-logic/stores/customSkillTreeStore";
import { NeoBrutalAccent } from "@/src/ui/atoms";
import { IColors, useTheme } from "@/src/ui/tokens";

// ─── Suggested goals ───────────────────────────────────────────────────────────
const SUGGESTIONS = [
  { label: "Trở thành Fullstack Developer", emoji: "💻" },
  { label: "Làm chủ tài chính cá nhân", emoji: "💰" },
  { label: "Nâng cao tiếng Anh lên B2", emoji: "🌍" },
  { label: "Sống lành mạnh & vóc dáng tốt", emoji: "💪" },
  { label: "Khởi nghiệp sản phẩm SaaS", emoji: "🚀" },
  { label: "Nâng cao kỹ năng giao tiếp", emoji: "🗣️" },
];

// ─── Branch color hints ────────────────────────────────────────────────────────
const BRANCH_HINT = [
  { label: "Sự nghiệp", color: "#7C6AF7", emoji: "💼" },
  { label: "Tài chính", color: "#22C55E", emoji: "💰" },
  { label: "Kỹ năng mềm", color: "#F59E0B", emoji: "💬" },
  { label: "Sức khỏe", color: "#EC4899", emoji: "🧘" },
];

export default function SkillBuilderGoalScreen() {
  const { colors } = useTheme();
  const [goal, setGoal] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const { setGenerating, setDraft } = useCustomSkillTreeStore();
  const styles = useMemo(
    () => createStyles(colors, focused),
    [colors, focused],
  );

  const shimmer = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 2400,
        useNativeDriver: true,
      }),
    ).start();
  }, [shimmer]);

  const shimX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, 320],
  });

  const handleGenerate = async () => {
    if (!goal.trim()) return;
    setGenerating(true);
    router.push("/skill-builder/generating");
    // Simulate AI delay (replace with real API call later)
    await new Promise((r) => setTimeout(r, 2200));
    const tree = mockAIGenerate(goal.trim());
    setDraft(tree);
    router.replace("/skill-builder/editor");
  };

  const handleSuggestion = (text: string) => {
    setGoal(text);
    inputRef.current?.focus();
  };

  const canGenerate = goal.trim().length >= 5;

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.bgBase }]}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: colors.bgElevated }]}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          <View style={styles.headerLabel}>
            <Text style={[styles.headerTag, { color: colors.brandPrimary }]}>
              AI BUILDER
            </Text>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
              Cây kỹ năng riêng
            </Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero caption */}
          <Text style={[styles.caption, { color: colors.textSecondary }]}>
            Nhập mục tiêu của bạn — AI sẽ phân tích và tạo ra lộ trình{" "}
            <Text style={{ color: colors.brandPrimary, fontWeight: "700" }}>
              cá nhân hoá
            </Text>{" "}
            gồm các kỹ năng cụ thể.
          </Text>

          {/* Category chips — visual hint */}
          <View style={styles.chipRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {BRANCH_HINT.map((b) => (
                <NeoBrutalAccent
                  style={{
                    marginLeft: 4,
                  }}
                  key={b.label}
                  accentColor={`${b.color}90`}
                  strokeColor="#000"
                  // TODO: on press should select as the main category for the generated tree, and pass that info to the AI prompt for better results
                  // onPress={}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 2,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                    }}
                  >
                    <Text style={styles.chipEmoji}>{b.emoji}</Text>
                    <Text style={[{ color: colors.textPrimary }]}>
                      {b.label}
                    </Text>
                  </View>
                </NeoBrutalAccent>
              ))}
            </ScrollView>
          </View>

          {/* Goal input box */}
          <View
            style={{
              borderWidth: focused ? 1.5 : 0,
              borderColor: colors.textMuted,
              padding: 4,
              borderRadius: 16,
              marginBottom: 14,
              backgroundColor: colors.bgBase,
            }}
          >
            <View style={[styles.inputBox]}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>
                MỤC TIÊU CỦA TÔI
              </Text>
              <TextInput
                ref={inputRef}
                value={goal}
                onChangeText={setGoal}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="VD: Trở thành lập trình viên fullstack..."
                placeholderTextColor={colors.textMuted}
                style={[styles.input, { color: colors.textPrimary }]}
                multiline
                maxLength={120}
                returnKeyType="done"
                onSubmitEditing={handleGenerate}
              />
              <View style={styles.inputFooter}>
                {goal.length > 0 && (
                  <TouchableOpacity onPress={() => setGoal("")}>
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* AI Generate CTA */}
          <TouchableOpacity
            onPress={handleGenerate}
            disabled={!canGenerate}
            activeOpacity={0.85}
            style={[
              styles.generateBtn,
              {
                backgroundColor: canGenerate
                  ? colors.brandPrimary
                  : colors.bgElevated,
                shadowColor: canGenerate ? colors.brandPrimary : "transparent",
              },
            ]}
          >
            {canGenerate && (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.shimmerOverlay,
                  { transform: [{ translateX: shimX }] },
                ]}
              />
            )}
            <Ionicons
              name="sparkles"
              size={18}
              color={canGenerate ? "#fff" : colors.textMuted}
              style={{ marginRight: 8 }}
            />
            <Text
              style={[
                styles.generateText,
                { color: canGenerate ? "#fff" : colors.textMuted },
              ]}
            >
              Tạo cây kỹ năng với AI
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View
              style={[styles.divLine, { backgroundColor: colors.glassBorder }]}
            />
            <Text style={[styles.divText, { color: colors.textMuted }]}>
              gợi ý
            </Text>
            <View
              style={[styles.divLine, { backgroundColor: colors.glassBorder }]}
            />
          </View>

          {/* Suggestion chips */}
          <View style={styles.suggestGrid}>
            {SUGGESTIONS.map((s) => (
              <Pressable
                key={s.label}
                onPress={() => handleSuggestion(s.label)}
                style={({ pressed }) => [
                  styles.suggestChip,
                  {
                    backgroundColor: pressed
                      ? `${colors.brandPrimary}20`
                      : colors.bgSurface,
                    borderColor: colors.glassBorder,
                  },
                ]}
              >
                <Text style={styles.suggestEmoji}>{s.emoji}</Text>
                <Text
                  style={[styles.suggestLabel, { color: colors.textSecondary }]}
                >
                  {s.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Bottom info note */}
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: `${colors.brandPrimary}12`,
                borderColor: `${colors.brandPrimary}30`,
              },
            ]}
          >
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={colors.brandPrimary}
            />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Các kỹ năng được tạo ra sẽ nằm trong{" "}
              <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>
                đúng danh mục kỹ năng sống
              </Text>{" "}
              của bạn và phản ánh vào hồ sơ phát triển bản thân.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: IColors, focused: boolean) =>
  StyleSheet.create({
    safe: { flex: 1 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 4,
      gap: 12,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    headerLabel: { flex: 1, alignItems: "center" },
    headerTag: { fontSize: 10, fontWeight: "800", letterSpacing: 2 },
    headerTitle: { fontSize: 18, fontWeight: "800", marginTop: 1 },

    scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 60 },

    caption: { fontSize: 14, lineHeight: 22, marginBottom: 18 },

    chipRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 24,
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
      borderWidth: 1,
    },
    chipEmoji: { fontSize: 12 },
    chipLabel: { fontSize: 11, fontWeight: "700" },

    inputBox: {
      borderRadius: 12,
      borderWidth: 1.5,
      padding: 8,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 4,
      borderColor: colors.textMuted,
    },
    inputLabel: {
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 1.8,
      marginBottom: 8,
    },
    input: {
      fontSize: 12,
      lineHeight: 24,
      minHeight: 56,
      fontWeight: "500",
    },
    inputFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 8,
      marginTop: 8,
    },
    charCount: { fontSize: 11 },

    generateBtn: {
      height: 56,
      borderRadius: 28,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 8,
      marginBottom: 28,
    },
    shimmerOverlay: {
      position: "absolute",
      top: 0,
      bottom: 0,
      width: 120,
      backgroundColor: "rgba(255,255,255,0.15)",
      borderRadius: 40,
      transform: [{ skewX: "-20deg" }],
    },
    generateText: { fontSize: 16, fontWeight: "800" },

    dividerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 16,
    },
    divLine: { flex: 1, height: 1 },
    divText: { fontSize: 11, fontWeight: "600", letterSpacing: 0.5 },

    suggestGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginBottom: 28,
    },
    suggestChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      flexBasis: "47%",
      flex: 1,
      minWidth: "46%",
    },
    suggestEmoji: { fontSize: 16 },
    suggestLabel: {
      fontSize: 12,
      fontWeight: "500",
      flex: 1,
      flexWrap: "wrap",
    },

    infoCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
    },
    infoText: { fontSize: 12, lineHeight: 18, flex: 1 },
  });
