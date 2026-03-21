import { useBranches } from "@/src/business-logic/hooks/useBranches";
import type {
  Branch,
  RoadmapMilestone,
  TimeHorizon,
} from "@/src/business-logic/types";
import { NeoBrutalBox } from "@/src/ui/atoms";
import { useTheme } from "@/src/ui/tokens";
import { Radius, Spacing } from "@/src/ui/tokens/spacing";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface RoadmapHorizonSectionProps {
  horizon: TimeHorizon;
  milestones: RoadmapMilestone[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAddMilestone: (title: string, branch: Branch) => void;
}

// Horizon labels
const HORIZON_LABELS: Record<TimeHorizon, string> = {
  short: "🎯 3 Tháng Tới",
  mid: "📈 1 Năm Tới",
  long: "🚀 3–5 Năm Tới",
};

export function RoadmapHorizonSection({
  horizon,
  milestones,
  onToggle,
  onDelete,
  onAddMilestone,
}: RoadmapHorizonSectionProps) {
  const { colors } = useTheme();
  const { branchMeta, branches: branchList } = useBranches();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<Branch>("career");

  const handleAddMilestone = () => {
    if (formTitle.trim()) {
      onAddMilestone(formTitle, selectedBranch);
      setFormTitle("");
      setSelectedBranch("career");
      setShowAddForm(false);
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `Tháng ${month}/${year}`;
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.section}>
      {/* Header: Horizon label + count badge */}
      <View style={styles.header}>
        <Text style={[styles.horizonLabel, { color: colors.textPrimary }]}>
          {HORIZON_LABELS[horizon]}
        </Text>
        <View
          style={[styles.countBadge, { backgroundColor: colors.brandPrimary }]}
        >
          <Text style={[styles.countBadgeText, { color: colors.bgBase }]}>
            {milestones.length}
          </Text>
        </View>
      </View>

      {/* Milestone list */}
      <View style={styles.milestoneList}>
        {milestones.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            Chưa có mục tiêu nào
          </Text>
        ) : (
          milestones.map((milestone) => {
            const branchColor =
              colors[milestone.branch as keyof typeof colors] ||
              colors.brandPrimary;
            const branchEmoji =
              branchMeta[milestone.branch as keyof typeof branchMeta]?.emoji ??
              "📌";

            return (
              <NeoBrutalBox
                key={milestone.id}
                borderColor={branchColor}
                backgroundColor={colors.bgSurface}
                shadowColor={branchColor}
                shadowOffsetX={milestone.isCompleted ? 2 : 4}
                shadowOffsetY={milestone.isCompleted ? 2 : 4}
                borderWidth={2}
                borderRadius={Radius.md}
                style={
                  [
                    styles.milestoneCard,
                    { opacity: milestone.isCompleted ? 0.7 : 1 },
                  ] as any
                }
                contentStyle={styles.milestoneContent}
              >
                {/* Left accent bar (branch color) */}
                <View
                  style={[
                    styles.accentBar,
                    { backgroundColor: branchColor, width: 4 },
                  ]}
                />

                {/* Card body */}
                <View style={styles.cardBody}>
                  {/* Title and branch emoji */}
                  <View style={styles.titleRow}>
                    <Text style={styles.branchEmoji}>{branchEmoji}</Text>
                    <Text
                      style={[
                        styles.milestoneTitle,
                        { color: colors.textPrimary },
                        milestone.isCompleted && styles.completedTitle,
                      ]}
                    >
                      {milestone.title}
                    </Text>
                  </View>

                  {/* Target date label */}
                  <Text style={[styles.dateLabel, { color: colors.textMuted }]}>
                    {formatDate(milestone.targetDate)}
                  </Text>
                </View>

                {/* Right side: checkbox + delete button */}
                <View style={styles.rightActions}>
                  {/* Checkbox */}
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      {
                        borderColor: branchColor,
                        backgroundColor: milestone.isCompleted
                          ? branchColor
                          : "transparent",
                      },
                    ]}
                    onPress={() => onToggle(milestone.id)}
                  >
                    {milestone.isCompleted && (
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color={colors.bgBase}
                        style={{ marginTop: -1 }}
                      />
                    )}
                  </TouchableOpacity>

                  {/* Delete button */}
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => onDelete(milestone.id)}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={16}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              </NeoBrutalBox>
            );
          })
        )}
      </View>

      {/* Add milestone form (inline, expandable) */}
      {showAddForm ? (
        <NeoBrutalBox
          borderColor={colors.brandPrimary}
          backgroundColor={colors.bgSurface}
          shadowColor={colors.brandPrimary}
          shadowOffsetX={3}
          shadowOffsetY={3}
          borderWidth={2}
          borderRadius={Radius.md}
          style={styles.formCard}
          contentStyle={styles.formContent}
        >
          {/* Title input */}
          <TextInput
            placeholder="Mô tả mục tiêu..."
            placeholderTextColor={colors.textMuted}
            value={formTitle}
            onChangeText={setFormTitle}
            style={[styles.titleInput, { color: colors.textPrimary }]}
            multiline
          />

          {/* Branch selector (4 pills) */}
          <View style={styles.branchSelector}>
            {branchList.map(({ id: branch }) => {
              const isSelected = selectedBranch === branch;
              const branchEmoji = branchMeta[branch].emoji;
              const branchColor = colors[branch as keyof typeof colors];

              return (
                <TouchableOpacity
                  key={branch}
                  style={[
                    styles.branchPill,
                    {
                      backgroundColor: isSelected
                        ? branchColor
                        : colors.bgElevated,
                      borderColor: branchColor,
                      borderWidth: isSelected ? 0 : 1.5,
                    },
                  ]}
                  onPress={() => setSelectedBranch(branch)}
                >
                  <Text style={styles.branchPillEmoji}>{branchEmoji}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Action buttons */}
          <View style={styles.formActions}>
            <TouchableOpacity
              style={[styles.formBtn, styles.cancelBtn]}
              onPress={() => {
                setShowAddForm(false);
                setFormTitle("");
                setSelectedBranch("career");
              }}
            >
              <Text
                style={[styles.formBtnText, { color: colors.textSecondary }]}
              >
                Hủy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.formBtn,
                styles.submitBtn,
                {
                  backgroundColor: colors.brandPrimary,
                  opacity: formTitle.trim() ? 1 : 0.5,
                },
              ]}
              onPress={handleAddMilestone}
              disabled={!formTitle.trim()}
            >
              <Text style={[styles.formBtnText, { color: colors.bgBase }]}>
                Thêm
              </Text>
            </TouchableOpacity>
          </View>
        </NeoBrutalBox>
      ) : null}

      {/* "Add milestone" button */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => setShowAddForm(true)}
      >
        <Text style={[styles.addBtnText, { color: colors.brandPrimary }]}>
          + Thêm mục tiêu
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (colors: any) =>
  StyleSheet.create({
    section: {
      marginHorizontal: Spacing.screenPadding,
      marginBottom: Spacing.sectionGap,
    },

    // Header
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: Spacing.md,
      gap: Spacing.sm,
    },
    horizonLabel: {
      fontSize: 15,
      fontWeight: "900",
      letterSpacing: 0.5,
    },
    countBadge: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: 3,
      borderRadius: Radius.full,
      minWidth: 28,
      alignItems: "center",
      justifyContent: "center",
    },
    countBadgeText: {
      fontSize: 11,
      fontWeight: "700",
      fontFamily: "SpaceGrotesk-Bold",
    },

    // Milestone list
    milestoneList: {
      gap: Spacing.cardGap,
      marginBottom: Spacing.md,
    },
    emptyText: {
      fontSize: 13,
      fontFamily: "SpaceGrotesk-Medium",
      fontWeight: "500",
      textAlign: "center",
      paddingVertical: Spacing.md,
    },

    // Milestone card
    milestoneCard: {
      marginBottom: 0,
    },
    milestoneContent: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.md,
      gap: Spacing.sm,
    },
    accentBar: {
      marginLeft: -Spacing.md,
      marginTop: -Spacing.md,
      marginBottom: -Spacing.md,
      borderTopLeftRadius: Radius.md - 2,
      borderBottomLeftRadius: Radius.md - 2,
      height: "100%",
    },
    cardBody: {
      flex: 1,
      justifyContent: "center",
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: Spacing.xs,
      marginBottom: Spacing.xs,
    },
    branchEmoji: {
      fontSize: 16,
      marginTop: 2,
    },
    milestoneTitle: {
      fontSize: 13,
      fontWeight: "600",
      fontFamily: "SpaceGrotesk-SemiBold",
      flex: 1,
      lineHeight: 18,
    },
    completedTitle: {
      textDecorationLine: "line-through",
      opacity: 0.7,
    },
    dateLabel: {
      fontSize: 11,
      fontFamily: "SpaceGrotesk-Medium",
      fontWeight: "500",
      marginTop: Spacing.xs,
    },

    // Right actions (checkbox + delete)
    rightActions: {
      flexDirection: "column",
      alignItems: "center",
      gap: Spacing.xs,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: Radius.sm,
      borderWidth: 1.5,
      alignItems: "center",
      justifyContent: "center",
    },
    deleteBtn: {
      padding: Spacing.xs,
    },

    // Add milestone form
    formCard: {
      marginBottom: Spacing.md,
    },
    formContent: {
      padding: Spacing.md,
      gap: Spacing.md,
    },
    titleInput: {
      fontSize: 13,
      fontFamily: "SpaceGrotesk-Medium",
      fontWeight: "500",
      minHeight: 60,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.xs,
      borderRadius: Radius.sm,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      textAlignVertical: "top",
    },
    branchSelector: {
      flexDirection: "row",
      justifyContent: "center",
      gap: Spacing.sm,
    },
    branchPill: {
      width: 44,
      height: 44,
      borderRadius: Radius.md,
      alignItems: "center",
      justifyContent: "center",
    },
    branchPillEmoji: {
      fontSize: 20,
    },
    formActions: {
      flexDirection: "row",
      gap: Spacing.sm,
      justifyContent: "flex-end",
    },
    formBtn: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.sm,
      alignItems: "center",
      justifyContent: "center",
      minWidth: 70,
    },
    cancelBtn: {
      backgroundColor: colors.bgElevated,
      borderWidth: 1,
      borderColor: colors.glassBorder,
    },
    submitBtn: {
      borderWidth: 0,
    },
    formBtnText: {
      fontSize: 12,
      fontWeight: "600",
      fontFamily: "SpaceGrotesk-SemiBold",
      letterSpacing: 0.3,
    },

    // Add button
    addBtn: {
      paddingVertical: Spacing.md,
      alignItems: "center",
    },
    addBtnText: {
      fontSize: 13,
      fontWeight: "600",
      fontFamily: "SpaceGrotesk-SemiBold",
      letterSpacing: 0.3,
    },
  });
