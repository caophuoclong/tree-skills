import { create } from 'zustand';
import type { Branch, OnboardingAnswer, SkillNode } from '../types';

interface TreeConfig {
  primaryBranch: Branch;
  branchWeights: Record<Branch, number>;
  initialNodes: SkillNode[];
}

interface OnboardingStore {
  currentQuestionIndex: number;
  answers: OnboardingAnswer[];
  treeConfig: TreeConfig | null;
  completed: boolean;
  skipped: boolean;
  setAnswer: (answer: OnboardingAnswer) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  setTreeConfig: (config: TreeConfig) => void;
  completeOnboarding: () => void;
  skip: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  currentQuestionIndex: 0,
  answers: [],
  treeConfig: null,
  completed: false,
  skipped: false,

  setAnswer: (answer) =>
    set((state) => {
      const existing = state.answers.findIndex((a) => a.question_id === answer.question_id);
      const answers = [...state.answers];
      if (existing >= 0) {
        answers[existing] = answer;
      } else {
        answers.push(answer);
      }
      return { answers };
    }),

  nextQuestion: () =>
    set((state) => ({ currentQuestionIndex: state.currentQuestionIndex + 1 })),

  previousQuestion: () =>
    set((state) => ({ currentQuestionIndex: Math.max(0, state.currentQuestionIndex - 1) })),

  setTreeConfig: (config) => set({ treeConfig: config }),

  completeOnboarding: () => set({ completed: true }),

  skip: () => set({ skipped: true, completed: true }),

  reset: () =>
    set({ currentQuestionIndex: 0, answers: [], treeConfig: null, completed: false, skipped: false }),
}));
