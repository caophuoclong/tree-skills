import { NeoBrutalBox } from "@/src/ui/atoms";
import { IColors, useTheme } from "@/src/ui/tokens";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type NotificationItem = {
  id: number;
  title: string;
  body: string;
  time: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const notifications: NotificationItem[] = [
    {
      id: 1,
      title: "Chuỗi mới!",
      body: "Bạn đã đạt chuỗi 3 ngày liên tiếp. Tiếp tục phát huy nhé!",
      time: "2h trước",
      icon: "flame",
      color: colors.warning,
    },
    {
      id: 2,
      title: "Nhiệm vụ mới",
      body: "3 nhiệm vụ Sự nghiệp đã được làm mới.",
      time: "5h trước",
      icon: "flash",
      color: colors.career,
    },
    {
      id: 3,
      title: "Nhắc nhở",
      body: "Đừng quên check-in tâm trạng hôm nay.",
      time: "1 ngày trước",
      icon: "happy",
      color: colors.wellbeing,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={[styles.header, { borderBottomColor: colors.glassBorder }]}>
        <NeoBrutalBox
          borderColor={colors.glassBorder}
          backgroundColor={colors.bgElevated}
          shadowColor="#000"
          shadowOffsetX={2}
          shadowOffsetY={2}
          borderWidth={1.5}
          borderRadius={18}
          onPress={() => router.back()}
          contentStyle={styles.backBtnContent}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={colors.textSecondary}
          />
        </NeoBrutalBox>

        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Cài đặt
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {notifications.map((notif) => (
          <View
            key={notif.id}
            style={[
              styles.notifItem,
              { borderBottomColor: colors.glassBorder },
            ]}
          >
            <NeoBrutalBox
              borderColor={`${notif.color}60`}
              backgroundColor={`${notif.color}20`}
              shadowColor={colors.bgBase}
              shadowOffsetX={3}
              shadowOffsetY={3}
              borderWidth={1.5}
              borderRadius={12}
              contentStyle={styles.notifIconContent}
              style={{ height: 50 }}
            >
              <Ionicons name={notif.icon} size={18} color={notif.color} />
            </NeoBrutalBox>

            <View style={styles.notifText}>
              <Text style={styles.notifTitle}>{notif.title}</Text>
              <Text style={styles.notifBody}>{notif.body}</Text>
              <Text style={styles.notifTime}>{notif.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: IColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.bgSurface,
    },
    headerWrap: {
      borderBottomWidth: 1,
      borderBottomColor: colors.glassBorder,
    },
    notifAccentStrip: {
      height: 4,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.textPrimary,
    },
    closeButtonContent: {
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
    },
    list: {
      flex: 1,
    },
    listContent: {
      paddingHorizontal: 20,
      paddingTop: 6,
      paddingBottom: 24,
    },
    notifItem: {
      flexDirection: "row",
      gap: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
    },
    notifIconContent: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    notifText: {
      flex: 1,
      gap: 4,
    },
    notifTitle: {
      fontSize: 15,
      fontFamily: "SpaceGrotesk-Bold",
      fontWeight: "700",
      color: colors.textPrimary,
    },
    notifBody: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    notifTime: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 2,
    },
    backBtnContent: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
    },
  });
