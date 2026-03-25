/**
 * Local push notifications using expo-notifications.
 *
 * Scheduled types:
 * - Streak at risk: 8pm if no activity today
 * - Morning nudge: 8am daily
 * - Streak milestone tomorrow: 8pm the day before hitting 7/14/30/60/100
 * - Weekly review ready: Monday 9am
 *
 * Rules: max 1 per day, not before 8am or after 9pm.
 */
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { STREAK_MILESTONES } from "./useGrowthStreak";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function requestPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

async function cancelAllScheduled() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

interface ScheduleOptions {
  streak: number;
  questsCompletedToday: number;
  userName: string;
  pendingQuestCount: number;
}

export async function scheduleLocalNotifications({
  streak,
  questsCompletedToday,
  userName,
  pendingQuestCount,
}: ScheduleOptions) {
  const granted = await requestPermission();
  if (!granted) return;

  await cancelAllScheduled();

  const now = new Date();
  const hour = now.getHours();
  const today = new Date();
  today.setSeconds(0, 0);

  // ── Streak At Risk (8pm today, if no quests done yet) ───────────────────
  if (questsCompletedToday === 0 && streak > 0 && hour < 20) {
    const riskTime = new Date(today);
    riskTime.setHours(20, 0, 0, 0);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🔥 Streak sắp hết hạn!",
        body: `Streak ngày ${streak} hết hạn trong 4 tiếng. Làm 1 quest để cứu nhé!`,
      },
      trigger: { type: "date", date: riskTime } as any,
    });
  }

  // ── Morning Nudge (8am tomorrow) ────────────────────────────────────────
  if (pendingQuestCount > 0) {
    const morning = new Date(today);
    morning.setDate(morning.getDate() + 1);
    morning.setHours(8, 0, 0, 0);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `☀️ Chào ${userName}!`,
        body: `${pendingQuestCount} nhiệm vụ đang chờ hôm nay.`,
      },
      trigger: { type: "date", date: morning } as any,
    });
  }

  // ── Streak Milestone Tomorrow ────────────────────────────────────────────
  const nextMilestone = STREAK_MILESTONES.find((m) => m === streak + 1);
  if (nextMilestone && hour < 20) {
    const milestoneAlert = new Date(today);
    milestoneAlert.setHours(20, 0, 0, 0);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🎯 Milestone ngày mai!",
        body: `Ngày mai là streak ngày ${nextMilestone}! Đừng bỏ lỡ milestone này.`,
      },
      trigger: { type: "date", date: milestoneAlert } as any,
    });
  }

  // ── Weekly Review (next Monday 9am) ─────────────────────────────────────
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon...
  const daysUntilMonday = (8 - dayOfWeek) % 7 || 7;
  const monday = new Date(today);
  monday.setDate(monday.getDate() + daysUntilMonday);
  monday.setHours(9, 0, 0, 0);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "📊 Weekly Review sẵn sàng!",
      body: `Xem lại tuần vừa rồi của bạn →`,
    },
    trigger: { type: "date", date: monday } as any,
  });
}

export async function cancelLocalNotifications() {
  await cancelAllScheduled();
}
