import { create } from 'zustand';

export type NotifType = 'milestone' | 'streak' | 'levelup' | 'suggestion';

export interface AppNotification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  createdAt: string; // ISO
  read: boolean;
  targetRoute?: string;
}

interface NotificationStore {
  notifications: AppNotification[];
  addNotification: (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],

  addNotification: (n) => set((s) => ({
    notifications: [
      {
        ...n,
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        createdAt: new Date().toISOString(),
        read: false,
      },
      ...s.notifications,
    ].slice(0, 50), // keep max 50
  })),

  markRead: (id) => set((s) => ({
    notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n),
  })),

  markAllRead: () => set((s) => ({
    notifications: s.notifications.map(n => ({ ...n, read: true })),
  })),

  clearAll: () => set({ notifications: [] }),

  unreadCount: () => get().notifications.filter(n => !n.read).length,
}));
