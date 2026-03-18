import { useCallback, useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useOnboardingStore } from '../stores/onboardingStore';
import { useUserStore } from '../stores/userStore';
import { assessmentService } from '../api/services/assessmentService';
import { calculateBranchWeights, getPrimaryBranch } from '../data/assessment-questions';
import { getInitialNodes } from '../data/skill-tree-nodes';
import type { Branch, OnboardingAnswer } from '../types';

export interface OnboardingResult {
  currentQuestion: any | null;
  currentIndex: number;
  totalQuestions: number;
  progress: number;
  answers: OnboardingAnswer[];
  canGoBack: boolean;
  selectAnswer: (branch: Branch) => void;
  goBack: () => void;
  skip: () => void;
  finishOnboarding: () => void;
  isLoadingQuestions: boolean;
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

  // Fetch assessment questions from API
  const { data: questions = [], isLoading: isLoadingQuestions } = useQuery({
    queryKey: ['assessment', 'questions'],
    queryFn: () => assessmentService.getQuestions(),
    staleTime: Infinity, // questions never change during session
  });

  const currentQuestion = questions[currentQuestionIndex] ?? null;
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? (currentQuestionIndex / totalQuestions) * 100 : 0;

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
    isLoadingQuestions,
  };
}
