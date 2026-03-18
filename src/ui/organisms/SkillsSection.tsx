/**
 * SkillsSection — KỸ NĂNG SỐNG grid (bento layout with rings, streak, energy, quests, xp)
 * Extracted from index.tsx for maintainability
 */

import {
  Emoji,
  NeoBrutalAccent,
  NeoBrutalCard,
} from "@/src/ui/atoms";
import { ProgressRing } from "@/src/ui/molecules/ProgressRing";
import { XPShimmerBar } from "@/src/ui/molecules/XPShimmerBar";
import { StreakShieldBadge } from "@/src/ui/molecules/StreakShieldBadge";
import { useTheme } from "@/src/ui/tokens";
import { router } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { StreakShield } from "@/src/business-logic/types";

interface SkillsSectionProps {
  careerPct: number;
  financePct: number;
  softskillsPct: number;
  wellbeingPct: number;
  streak: number;
  stamina: number;
  pendingCount: number;
  level: number;
  currentXP: number;
  targetXP: number;
  xpPercent: number;
  streakShield: StreakShield;
  isStreakProtectedToday: boolean;
  onShieldModal: () => void;
  styles: any;
}

export function SkillsSection({
  careerPct,
  financePct,
  softskillsPct,
  wellbeingPct,
  streak,
  stamina,
  pendingCount,
  level,
  currentXP,
  targetXP,
  xpPercent,
  streakShield,
  isStreakProtectedToday,
  onShieldModal,
  styles,
}: SkillsSectionProps) {
  const { colors } = useTheme();
  const localStyles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>KỸ NĂNG SỐNG</Text>

      {/* Bento row 1: rings + streak/energy */}
      <View style={styles.bentoRow}>
        {/* Left: Progress rings */}
        <View style={styles.bentoCardLeft}>
          <NeoBrutalCard shadowOffsetX={4} shadowOffsetY={4}>
            <View
              style={[styles.ringsGrid, { backgroundColor: colors.bgBase }]}
            >
              <ProgressRing
                percent={careerPct}
                color={colors.career}
                label="Sự nghiệp"
              />
              <ProgressRing
                percent={financePct}
                color={colors.finance}
                label="Tài chính"
              />
              <ProgressRing
                percent={softskillsPct}
                color={colors.softskills}
                label="Kỹ năng"
              />
              <ProgressRing
                percent={wellbeingPct}
                color={colors.wellbeing}
                label="Sức khỏe"
              />
            </View>
          </NeoBrutalCard>
        </View>

        {/* Right: Streak + Energy */}
        <View style={styles.bentoRight}>
          {/* Streak card */}
          <NeoBrutalCard shadowOffsetX={4} shadowOffsetY={4}>
            <View
              style={[
                styles.bentoCardSmall,
                { backgroundColor: colors.bgBase },
              ]}
            >
              <View
                style={[
                  styles.accentBar,
                  { backgroundColor: colors.warning, width: 6 },
                ]}
              />
              <View style={styles.streakHeader}>
                <Emoji size={16}>🔥</Emoji>
                <StreakShieldBadge
                  shieldsRemaining={streakShield.shieldsRemaining}
                  isProtectedToday={isStreakProtectedToday}
                  onActivate={onShieldModal}
                />
              </View>
              <Text style={styles.streakNumber}>{streak || 12}</Text>
              <Text style={styles.streakLabel}>DAYS STREAK</Text>
            </View>
          </NeoBrutalCard>

          {/* Energy card */}
          <NeoBrutalCard shadowOffsetX={4} shadowOffsetY={4}>
            <View
              style={[
                styles.bentoCardSmall,
                { backgroundColor: colors.bgBase },
              ]}
            >
              <View
                style={[
                  styles.accentBar,
                  { backgroundColor: colors.finance, width: 6 },
                ]}
              />
              <Text style={styles.energyLabel}>ENERGY</Text>
              <View style={styles.energyBarTrack}>
                <View
                  style={[
                    styles.energyBarFill,
                    {
                      width: `${stamina}%` as any,
                      backgroundColor:
                        stamina < 30
                          ? colors.danger
                          : stamina < 70
                            ? colors.warning
                            : colors.finance,
                    },
                  ]}
                />
              </View>
              <View style={styles.energyInfoRow}>
                <Text style={styles.energyLabelSmall}>STAMINA</Text>
                <Text
                  style={[
                    styles.energyPercent,
                    {
                      color:
                        stamina < 30
                          ? colors.danger
                          : stamina < 70
                            ? colors.warning
                            : colors.finance,
                    },
                  ]}
                >
                  {stamina}%
                </Text>
              </View>
            </View>
          </NeoBrutalCard>
        </View>
      </View>

      {/* Bento row 2: Quests + XP */}
      <View style={styles.bentoRow2}>
        {/* Quests card */}
        <NeoBrutalCard
          shadowOffsetX={4}
          shadowOffsetY={4}
          style={styles.bentoCard2Left}
        >
          <View style={[styles.bentoCard, { height: 140 }]}>
            <Text style={styles.card2Label}>NHIỆM VỤ</Text>
            <Text style={styles.card2Number}>{pendingCount || 3}</Text>
            <Text style={styles.card2Sub}>Đang chờ</Text>
            <View style={styles.dotRow}>
              <View
                style={[styles.dot, { backgroundColor: colors.career }]}
              />
              <View
                style={[styles.dot, { backgroundColor: colors.finance }]}
              />
              <View
                style={[styles.dot, { backgroundColor: colors.wellbeing }]}
              />
            </View>
          </View>
        </NeoBrutalCard>

        {/* XP card */}
        <NeoBrutalCard
          shadowOffsetX={4}
          shadowOffsetY={4}
          style={styles.bentoCard2Right}
        >
          <View
            style={[
              styles.bentoCard,
              styles.bentoCard2Right,
              { height: 140 },
            ]}
          >
            <View
              style={[
                styles.accentBar,
                { backgroundColor: colors.brandPrimary, width: 6 },
              ]}
            />
            <View style={styles.xpHeaderRow}>
              <Text style={styles.card2Label}>EXPERIENCE</Text>
              <NeoBrutalAccent
                accentColor={colors.brandPrimary}
                strokeColor="rgba(0,0,0,0.7)"
                shadowOffsetX={2}
                shadowOffsetY={2}
                borderWidth={1.5}
                borderRadius={4}
                contentStyle={{ paddingHorizontal: 8, paddingVertical: 4 }}
              >
                <Text style={styles.levelPillText}>LVL {level}</Text>
              </NeoBrutalAccent>
            </View>
            <Text style={styles.xpValue}>
              {currentXP.toLocaleString()} / {targetXP.toLocaleString()} XP
            </Text>
            <Text style={styles.xpNextLabel}>
              TIẾP THEO: CẤP {level + 1}
            </Text>
            <XPShimmerBar percent={xpPercent} color={colors.brandPrimary} />
            <Text style={styles.xpUntilLabel}>
              Còn {targetXP - currentXP} XP nữa để lên cấp
            </Text>
          </View>
        </NeoBrutalCard>
      </View>

      {/* Suggested banner */}
      <NeoBrutalAccent
        accentColor={colors.brandGlow}
        style={{
          padding: 4,
          marginVertical: 4,
        }}
        onPress={() => router.push("/(tabs)/quests")}
      >
        <View
          style={{
            ...styles.suggestedLeft,
            padding: 12,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text style={styles.suggestedStar}>✦</Text>
          <View style={styles.suggestedText}>
            <Text style={styles.suggestedTitle}>Gợi ý: Networking</Text>
            <Text style={styles.suggestedSub}>
              Kết nối với 2 người hướng dẫn để nhận +50 XP
            </Text>
          </View>
        </View>
      </NeoBrutalAccent>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    // Minimal local styles if needed; most come from parent
  });
