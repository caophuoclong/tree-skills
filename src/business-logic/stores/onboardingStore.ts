import { create } from 'zustand';
import type { Branch, OnboardingAnswer } from '../types';

interface SkillTreeConfig {
  career: number;
  finance: number;
  softskills: number;
  wellbeing: number;
}

interface OnboardingStore {
  currentQuestion: number;
  answers: OnboardingAnswer[];
  treeConfig: SkillTreeConfig | null;
  skipped: boolean;
  setAnswer: (questionId: number, branch: Branch) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  skipOnboarding: () => void;
  setTreeConfig: (config: SkillTreeConfig) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  currentQuestion: 0,
  answers: [],
  treeConfig: null,
  skipped: false,

  setAnswer: (questionId, branch) =>
    set((state) => {
      const existing = state.answers.findIndex((a) => a.question_id === questionId);
      const answers = [...state.answers];
      if (existing >= 0) {
        answers[existing] = { question_id: questionId, selected_branch: branch };
      } else {
        answers.push({ question_id: questionId, selected_branch: branch });
      }
      return { answers };
    }),

  nextQuestion: () => set((state) => ({ currentQuestion: state.currentQuestion + 1 })),
  prevQuestion: () =>
    set((state) => ({ currentQuestion: Math.max(0, state.currentQuestion - 1) })),
  skipOnboarding: () => set({ skipped: true }),
  setTreeConfig: (config) => set({ treeConfig: config }),
  reset: () => set({ currentQuestion: 0, answers: [], treeConfig: null, skipped: false }),
}));
