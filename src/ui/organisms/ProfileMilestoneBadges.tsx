import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { NeoBrutalBox } from "@/src/ui/atoms";
import { useTheme } from "@/src/ui/tokens";

export interface MilestoneItem {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
}

interface Props {
  milestones: MilestoneItem[];
}

export function ProfileMilestoneBadges({ milestones }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
        MILESTONE BADGES
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {milestones.map((m) => (
          <NeoBrutalBox
            key={m.id}
            borderColor={m.unlocked ? m.color : colors.glassBorder}
            backgroundColor={colors.bgSurface}
            shadowColor={m.unlocked ? m.color : "#000"}
            shadowOffsetX={m.unlocked ? 5 : 3}
            shadowOffsetY={m.unlocked ? 5 : 3}
            borderWidth={2}
            borderRadius={20}
            style={{ width: 160, opacity: m.unlocked ? 1 : 0.55, height: 130 }}
            contentStyle={styles.badgeContent}
          >
            {m.unlocked && (
              <View style={[styles.accentBar, { backgroundColor: m.color }]} />
            )}
            <View style={styles.badgeInner}>
              <View
                style={[
                  styles.badgeIcon,
                  {
                    backgroundColor: m.unlocked
                      ? `${m.color}20`
                      : colors.bgElevated,
                  },
                ]}
              >
                <Ionicons
                  name={m.icon as any}
                  size={24}
                  color={m.unlocked ? m.color : colors.textMuted}
                />
              </View>
              <Text
                style={[
                  styles.badgeTitle,
                  { color: m.unlocked ? colors.textPrimary : colors.textMuted },
                ]}
              >
                {m.title}
              </Text>
              <Text
                style={[styles.badgeDesc, { color: colors.textMuted }]}
                numberOfLines={1}
              >
                {m.description}
              </Text>
            </View>
          </NeoBrutalBox>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 32 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 14,
    letterSpacing: 1.2,
    paddingHorizontal: 20,
  },
  list: {
    paddingLeft: 20,
    paddingRight: 10,
    gap: 14,
    flexDirection: "row",
    paddingBottom: 8,
  },
  badgeContent: { alignItems: "center", padding: 16 },
  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
  },
  badgeInner: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  badgeTitle: {
    fontSize: 11,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 5,
    letterSpacing: 0.2,
  },
  badgeDesc: {
    fontSize: 9,
    fontFamily: "SpaceGrotesk-Medium",
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 12,
  },
});
