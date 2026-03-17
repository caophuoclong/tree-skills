import { useCallback } from 'react';
import { router } from 'expo-router';
import { useOnboardingStore } from '../stores/onboardingStore';
import { useUserStore } from '../stores/userStore';
import { ASSESSMENT_QUESTIONS, calculateBranchWeights, getPrimaryBranch } from '../data/assessment-questions';
import { getInitialNodes } from '../data/skill-tree-nodes';
import type { Branch, OnboardingAnswer } from '../types';

export interface OnboardingResult {
  currentQuestion: (typeof ASSESSMENT_QUESTIONS)[0] | null;
  currentIndex: number;
  totalQuestions: number;
  progress: number;
  answers: OnboardingAnswer[];
  canGoBack: boolean;
  selectAnswer: (branch: Branch) => void;
  goBack: () => void;
  skip: () => void;
  finishOnboarding: () => void;
}

export function useOnboarding(): OnboardingResult {
  const {
    currentQuestionIndex,
    answers,
    setAnswer,
    nextQuestion,
    previousQuestion,
    setTreeConfig,
    completeOnboarding,
    skip,
  } = useOnboardingStore();

  const { user, setUser } = useUserStore();

  const currentQuestion = ASSESSMENT_QUESTIONS[currentQuestionIndex] ?? null;
  const totalQuestions = ASSESSMENT_QUESTIONS.length;
  const progress = (currentQuestionIndex / totalQuestions) * 100;

  const selectAnswer = useCallback(
    (branch: Branch) => {
      if (!currentQuestion) return;

      const answer: OnboardingAnswer = {
        question_id: currentQuestion.id,
        selected_branch: branch,
      };

      setAnswer(answer);

      if (currentQuestionIndex < totalQuestions - 1) {
        nextQuestion();
      } else {
        finishOnboarding();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentQuestion, currentQuestionIndex, totalQuestions, setAnswer, nextQuestion],
  );

  const finishOnboarding = useCallback(() => {
    const weights = calculateBranchWeights(answers);
    const primary = getPrimaryBranch(weights);

    const initialNodes = getInitialNodes(primary);
    setTreeConfig({
      primaryBranch: primary,
      branchWeights: weights as Record<Branch, number>,
      initialNodes,
    });

    completeOnboarding();

    if (user) {
      setUser({
        ...user,
        onboarding_done: true,
        // Store primary branch in user object
        ...(primary ? { primaryBranch: primary } : {}),
      } as typeof user);
    }

    router.replace('/(auth)/generating');
  }, [answers, setTreeConfig, completeOnboarding, user, setUser]);

  const handleSkip = useCallback(() => {
    skip();
    router.replace('/(tabs)');
  }, [skip]);

  return {
    currentQuestion,
    currentIndex: currentQuestionIndex,
    totalQuestions,
    progress,
    answers,
    canGoBack: currentQuestionIndex > 0,
    selectAnswer,
    goBack: previousQuestion,
    skip: handleSkip,
    finishOnboarding,
  };
}
