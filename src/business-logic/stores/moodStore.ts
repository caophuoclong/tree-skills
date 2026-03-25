/**
 * Stores the user's daily mood check-in and grace day streak recovery state.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

export type MoodScore = 1 | 2 | 3 | 4 | 5;
// 1=😴 2=😞 3=😐 4=😊 5=🔥

export interface MoodState {
  // Daily mood check-in
  todayMood: MoodScore | null;
  moodCheckedDate: string | null;
  checkInShownDate: string | null;

  // Streak recovery
  graceDayActive: boolean;
  graceDayUsedDates: string[];
  comebackDayActive: boolean;
  comebackQuestsCompleted: number;

  // Weekly review
  weeklyReviewShownWeek: string | null; // ISO week "2026-W12"

  // Branch focus week
  focusBranch: string | null;
  focusWeekStart: string | null; // YYYY-MM-DD

  setMood: (mood: MoodScore) => void;
  markCheckInShown: () => void;
  setGraceDayActive: (active: boolean, date?: string) => void;
  setComebackDayActive: (active: boolean) => void;
  incrementComebackQuests: () => void;
  markWeeklyReviewShown: (week: string) => void;
  setFocusBranch: (branch: string | null) => void;
}

function getISOWeek(date: Date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum =
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7,
    );
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

const STORAGE_KEY = "@moodStore";

export const useMoodStore = create<MoodState>((set, get) => ({
  todayMood: null,
  moodCheckedDate: null,
  checkInShownDate: null,
  graceDayActive: false,
  graceDayUsedDates: [],
  comebackDayActive: false,
  comebackQuestsCompleted: 0,
  weeklyReviewShownWeek: null,
  focusBranch: null,
  focusWeekStart: null,

  setMood: (mood) => {
    const today = new Date().toISOString().split("T")[0];
    set({ todayMood: mood, moodCheckedDate: today });
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...get(), todayMood: mood, moodCheckedDate: today }),
    ).catch(() => {});
  },

  markCheckInShown: () => {
    const today = new Date().toISOString().split("T")[0];
    set({ checkInShownDate: today });
  },

  setGraceDayActive: (active, date) => {
    const today = date ?? new Date().toISOString().split("T")[0];
    set((s) => {
      const usedDates = active
        ? [...s.graceDayUsedDates.filter(
            (d) => Date.now() - new Date(d).getTime() < 7 * 86400000,
          ), today]
        : s.graceDayUsedDates;
      return { graceDayActive: active, graceDayUsedDates: usedDates };
    });
  },

  setComebackDayActive: (active) =>
    set({ comebackDayActive: active, comebackQuestsCompleted: 0 }),

  incrementComebackQuests: () =>
    set((s) => ({ comebackQuestsCompleted: s.comebackQuestsCompleted + 1 })),

  markWeeklyReviewShown: (week) => set({ weeklyReviewShownWeek: week }),

  setFocusBranch: (branch) => {
    const today = new Date().toISOString().split("T")[0];
    set({
      focusBranch: branch,
      focusWeekStart: branch ? today : null,
    });
  },
}));

// Rehydrate from AsyncStorage on import
AsyncStorage.getItem(STORAGE_KEY)
  .then((raw) => {
    if (!raw) return;
    const saved = JSON.parse(raw);
    const today = new Date().toISOString().split("T")[0];
    useMoodStore.setState({
      todayMood: saved.moodCheckedDate === today ? saved.todayMood : null,
      moodCheckedDate: saved.moodCheckedDate,
      checkInShownDate: saved.checkInShownDate,
      graceDayActive: saved.graceDayActive ?? false,
      graceDayUsedDates: saved.graceDayUsedDates ?? [],
      comebackDayActive: saved.comebackDayActive ?? false,
      comebackQuestsCompleted: saved.comebackQuestsCompleted ?? 0,
      weeklyReviewShownWeek: saved.weeklyReviewShownWeek ?? null,
      focusBranch: saved.focusBranch ?? null,
      focusWeekStart: saved.focusWeekStart ?? null,
    });
  })
  .catch(() => {});
