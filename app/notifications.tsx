import {
  AppNotification,
  useNotificationStore,
} from "@/src/business-logic/stores/notificationStore";
import {
  CompleteIcon,
  HappyIcon,
  NeutralIcon,
  StreakFlameIcon,
  XPGainIcon,
} from "@/src/ui/atoms/FaceIcons";
import { useTheme } from "@/src/ui/tokens";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const NOTIF_ICONS: Record<string, () => React.ReactNode> = {
  milestone: () => <CompleteIcon size={32} color="#ffd700" />,
  streak:    () => <StreakFlameIcon level={3} size={32} />,
  levelup:   () => <XPGainIcon size={32} color="#facc15" />,
  suggestion:() => <HappyIcon size={32} color="#a78bfa" />,
};

function relativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { notifications, markRead, markAllRead } = useNotificationStore();

  const handlePress = useCallback(
    (notif: AppNotification) => {
      markRead(notif.id);
      if (notif.targetRoute) router.push(notif.targetRoute as any);
    },
    [markRead, router],
  );

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.bgBase }]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.textPrimary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text
            style={[
              styles.backText,
              { color: colors.textPrimary, fontFamily: "SpaceGrotesk-Bold" },
            ]}
          >
            ← Back
          </Text>
        </TouchableOpacity>
        <Text
          style={[
            styles.headerTitle,
            { color: colors.textPrimary, fontFamily: "SpaceGrotesk-Bold" },
          ]}
        >
          Notifications
        </Text>
        {unread > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text
              style={[
                styles.markAllText,
                {
                  color: colors.brandPrimary,
                  fontFamily: "SpaceGrotesk-SemiBold",
                },
              ]}
            >
              Mark all read
            </Text>
          </TouchableOpacity>
        )}
        {unread === 0 && <View style={{ width: 80 }} />}
      </View>

      {notifications.length === 0 ? (
        // Empty state
        <View style={styles.emptyContainer}>
          <View style={styles.emptyWrapper}>
            <View
              style={[
                styles.emptyShadow,
                { backgroundColor: colors.textPrimary },
              ]}
            />
            <View
              style={[
                styles.emptyCard,
                {
                  backgroundColor: colors.bgSurface,
                  borderColor: colors.textPrimary,
                },
              ]}
            >
              <HappyIcon size={72} />
              <Text
                style={[
                  styles.emptyTitle,
                  {
                    color: colors.textPrimary,
                    fontFamily: "SpaceGrotesk-Bold",
                  },
                ]}
              >
                You're all caught up!
              </Text>
              <Text
                style={[
                  styles.emptySub,
                  {
                    color: colors.textSecondary,
                    fontFamily: "SpaceGrotesk-Regular",
                  },
                ]}
              >
                No new notifications right now.
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(n) => n.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handlePress(item)}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.notifItem,
                  {
                    backgroundColor: item.read
                      ? colors.bgSurface
                      : colors.bgElevated,
                    borderColor: colors.textPrimary,
                  },
                ]}
              >
                {/* Unread accent bar */}
                {!item.read && (
                  <View
                    style={[
                      styles.unreadBar,
                      { backgroundColor: colors.brandPrimary },
                    ]}
                  />
                )}
                <View style={styles.notifContent}>
                  <View style={styles.notifRow}>
                    <View style={styles.notifIcon}>
                      {(NOTIF_ICONS[item.type] ?? (() => <NeutralIcon size={32} />))()}
                    </View>
                    <Text
                      style={[
                        styles.notifTitle,
                        {
                          color: colors.textPrimary,
                          fontFamily: "SpaceGrotesk-Bold",
                        },
                      ]}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={[
                        styles.notifTime,
                        {
                          color: colors.textMuted,
                          fontFamily: "SpaceGrotesk-Regular",
                        },
                      ]}
                    >
                      {relativeTime(item.createdAt)}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.notifBody,
                      {
                        color: colors.textSecondary,
                        fontFamily: "SpaceGrotesk-Regular",
                      },
                    ]}
                  >
                    {item.body}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 2,
  },
  backBtn: { width: 80 },
  backText: { fontSize: 15 },
  headerTitle: { fontSize: 18 },
  markAllText: { fontSize: 13 },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyWrapper: { position: "relative" },
  emptyShadow: {
    position: "absolute",
    top: 5,
    left: 5,
    right: -5,
    bottom: -5,
    borderRadius: 0,
  },
  emptyCard: {
    padding: 32,
    borderRadius: 0,
    borderWidth: 3,
    alignItems: "center",
    gap: 12,
  },
  emptyTitle: { fontSize: 20, textAlign: "center" },
  emptySub: { fontSize: 14, textAlign: "center" },
  notifItem: {
    borderWidth: 2,
    borderRadius: 12,
    flexDirection: "row",
    overflow: "hidden",
  },
  unreadBar: { width: 4 },
  notifContent: { flex: 1, padding: 12, gap: 4 },
  notifRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  notifIcon: { width: 32, height: 32 },
  notifTitle: { flex: 1, fontSize: 14 },
  notifTime: { fontSize: 11 },
  notifBody: { fontSize: 13, lineHeight: 18 },
});
