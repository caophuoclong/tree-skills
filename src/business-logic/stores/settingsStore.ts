import { create } from "zustand";

interface SettingsStore {
  dailyNotifications: boolean;
  setDailyNotifications: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  dailyNotifications: false,
  setDailyNotifications: (enabled: boolean) =>
    set({ dailyNotifications: enabled }),
}));
