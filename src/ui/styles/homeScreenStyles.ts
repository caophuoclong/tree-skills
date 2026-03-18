/**
 * homeScreenStyles — all StyleSheet definitions for home screen
 * Separated from index.tsx for maintainability
 */

import { StyleSheet } from "react-native";
import type { IColors } from "@/src/ui/tokens";

export const createHomeScreenStyles = (colors: IColors) =>
  StyleSheet.create({
    // Container
    safeArea: {
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

    // Section layout
    section: {
      marginTop: 0,
    },
    sectionLabel: {
      fontSize: 10,
      fontWeight: "800",
      color: colors.textMuted,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      marginBottom: 12,
    },

    // Bento row 1 (rings + streak/energy)
    bentoRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 12,
    },
    bentoCard: {
      backgroundColor: colors.bgBase,
      padding: 16,
    },
    accentBar: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
      borderTopLeftRadius: 16,
      borderBottomLeftRadius: 16,
    },
    bentoCardLeft: {
      flex: 1.4,
    },
    bentoRight: {
      flex: 1,
      gap: 12,
    },
    bentoCardSmall: {
      padding: 16,
      justifyContent: "center",
      minHeight: 110,
    },

    // Progress rings
    ringsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
      justifyContent: "center",
      paddingVertical: 8,
    },
    ringWrapper: {
      alignItems: "center",
      width: "42%",
      marginBottom: 8,
    },
    ringPercent: {
      fontSize: 12,
      fontWeight: "900",
      letterSpacing: -0.3,
    },
    ringLabel: {
      fontSize: 9,
      fontWeight: "800",
      color: colors.textSecondary,
      marginTop: 8,
      textAlign: "center",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },

    // Streak card
    streakHeader: {
      marginBottom: 4,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    streakFire: {
      fontSize: 16,
    },
    streakNumber: {
      fontSize: 28,
      fontWeight: "900",
      color: colors.warning,
      lineHeight: 32,
      letterSpacing: -0.5,
    },
    streakLabel: {
      fontSize: 8,
      fontWeight: "800",
      color: colors.textSecondary,
      letterSpacing: 0,
      textTransform: "uppercase",
      marginTop: 6,
    },

    // Energy card
    energyLabel: {
      fontSize: 8,
      fontWeight: "800",
      color: colors.textSecondary,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      marginBottom: 12,
    },
    energyBarTrack: {
      height: 4,
      backgroundColor: colors.bgElevated,
      borderRadius: 2,
      overflow: "hidden",
      marginBottom: 4,
    },
    energyBarFill: {
      height: 4,
      backgroundColor: colors.finance,
      borderRadius: 2,
    },
    energyPercent: {
      fontSize: 10,
      fontFamily: "SpaceGrotesk-Bold",
      fontWeight: "700",
      color: colors.finance,
    },
    energyInfoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 2,
    },
    energyLabelSmall: {
      fontSize: 8,
      fontFamily: "SpaceGrotesk-SemiBold",
      fontWeight: "600",
      color: colors.textSecondary,
    },

    // Bento row 2 (quests + xp)
    bentoRow2: {
      flexDirection: "row",
      gap: 12,
    },
    bentoCard2Left: {
      flex: 1.6,
    },
    bentoCard2Right: {
      flex: 1.6,
    },

    // Quests card
    card2Label: {
      fontSize: 10,
      fontFamily: "SpaceGrotesk-SemiBold",
      fontWeight: "600",
      color: colors.textMuted,
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 5,
    },
    card2Number: {
      fontSize: 32,
      fontWeight: "900",
      color: colors.textPrimary,
      lineHeight: 36,
      letterSpacing: -0.5,
    },
    card2Sub: {
      fontSize: 9,
      fontWeight: "800",
      color: colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginTop: 6,
    },
    dotRow: {
      flexDirection: "row",
      gap: 4,
      marginTop: 8,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },

    // XP card
    xpHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 2,
    },
    levelPillText: {
      fontSize: 10,
      fontWeight: "900",
      color: "#FFFFFF",
      letterSpacing: 0.5,
    },
    xpValue: {
      fontSize: 14,
      fontWeight: "900",
      color: colors.textPrimary,
      marginTop: 12,
      letterSpacing: -0.2,
      lineHeight: 20,
    },
    xpNextLabel: {
      fontSize: 9,
      fontFamily: "SpaceGrotesk-Bold",
      fontWeight: "700",
      color: colors.textMuted,
      marginTop: 8,
      letterSpacing: 0.5,
    },
    xpBarTrack: {
      height: 4,
      backgroundColor: colors.bgElevated,
      borderRadius: 2,
      overflow: "hidden",
      marginTop: 8,
    },
    xpBarFill: {
      height: 4,
      backgroundColor: colors.brandPrimary,
      borderRadius: 2,
    },
    xpUntilLabel: {
      fontSize: 9,
      color: colors.textMuted,
      marginTop: 6,
    },

    // Suggested banner
    suggestedBanner: {
      marginTop: 12,
      borderRadius: 16,
      padding: 16,
      backgroundColor: colors.brandPrimary,
      flexDirection: "row",
    },
    suggestedLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      gap: 10,
    },
    suggestedStar: {
      fontSize: 18,
      color: "#FFFFFF",
    },
    suggestedText: {
      flex: 1,
    },
    suggestedTitle: {
      fontSize: 14,
      fontFamily: "SpaceGrotesk-SemiBold",
      fontWeight: "600",
      color: "#FFFFFF",
    },
    suggestedSub: {
      fontSize: 12,
      color: "rgba(255,255,255,0.75)",
      marginTop: 2,
    },

    // Quests preview section
    questPreviewSection: {
      marginTop: 24,
    },
    questPreviewHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
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

    // Bottom spacing
    bottomSpacer: {
      height: 100,
    },
  });

export const getBranchColors = (colors: IColors): Record<string, string> => ({
  career: colors.career,
  finance: colors.finance,
  softskills: colors.softskills,
  wellbeing: colors.wellbeing,
});
