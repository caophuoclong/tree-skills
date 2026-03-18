import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { NeoBrutalBox } from "@/src/ui/atoms";

interface ProgressBarProps {
  branchName: string;
  done: number;
  total: number;
  progress: number;
  barColor: string;
  colors: any;
  showCustomFilter: boolean;
  customFilterActive: boolean;
  onCustomFilterToggle: () => void;
  goalFilterActive: boolean;
}

/**
 * Progress bar component showing completion percentage and custom filter toggle.
 */
export function ProgressBar({
  branchName,
  done,
  total,
  progress,
  barColor,
  colors,
  showCustomFilter,
  customFilterActive,
  onCustomFilterToggle,
  goalFilterActive,
}: ProgressBarProps) {
  return (
    <NeoBrutalBox
      borderColor={goalFilterActive ? colors.brandPrimary : barColor}
      backgroundColor={colors.bgSurface}
      shadowColor={goalFilterActive ? colors.brandPrimary : barColor}
      shadowOffsetX={3}
      shadowOffsetY={3}
      borderWidth={1.5}
      borderRadius={12}
      style={{ marginHorizontal: 20, marginTop: 10 }}
      contentStyle={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 10,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={[styles.stripName, { color: colors.textPrimary }]}
          numberOfLines={1}
        >
          {branchName}
        </Text>
        <Text style={[styles.stripCount, { color: colors.textMuted }]}>
          {done}/{total} hoàn tất
          {goalFilterActive && (
            <Text style={{ color: colors.brandPrimary }}>
              {" "}
              · Lọc theo lộ trình
            </Text>
          )}
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.bgElevated }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${progress}%` as any,
              backgroundColor: goalFilterActive ? colors.brandPrimary : barColor,
            },
          ]}
        />
      </View>
      <Text
        style={[
          styles.pct,
          { color: goalFilterActive ? colors.brandPrimary : barColor },
        ]}
      >
        {progress}%
      </Text>

      {/* Custom filter chip */}
      {showCustomFilter && !goalFilterActive && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onCustomFilterToggle}
          style={[
            styles.filterChip,
            customFilterActive
              ? {
                  backgroundColor: `${barColor}28`,
                  borderColor: `${barColor}70`,
                }
              : {
                  backgroundColor: colors.bgElevated,
                  borderColor: colors.glassBorder,
                },
          ]}
        >
          <Ionicons
            name="sparkles"
            size={10}
            color={customFilterActive ? barColor : colors.textMuted}
          />
          <Text
            style={[
              styles.filterChipText,
              { color: customFilterActive ? barColor : colors.textMuted },
            ]}
          >
            Tự thêm
          </Text>
          {customFilterActive && (
            <View
              style={[styles.filterDot, { backgroundColor: barColor }]}
            />
          )}
        </TouchableOpacity>
      )}
    </NeoBrutalBox>
  );
}

const styles = StyleSheet.create({
  stripName: {
    fontSize: 13,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "700",
  },
  stripCount: { fontSize: 11, marginTop: 1 },
  track: { width: 80, height: 5, borderRadius: 3, overflow: "hidden" },
  fill: { height: 5, borderRadius: 3 },
  pct: {
    fontSize: 13,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "700",
    minWidth: 34,
    textAlign: "right",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    marginLeft: 4,
  },
  filterChipText: {
    fontSize: 10,
    fontFamily: "SpaceGrotesk-Bold",
    fontWeight: "700",
  },
  filterDot: { width: 5, height: 5, borderRadius: 2.5 },
});
