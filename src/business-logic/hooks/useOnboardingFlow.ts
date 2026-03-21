import { useState, useEffect, useCallback, useMemo } from 'react';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { onboardingService, OnboardingStep, OnboardingAnswers } from '../api/services/onboardingService';
import { useUserStore } from '../stores/userStore';

interface OnboardingState {
  currentStepIndex: number;
  steps: OnboardingStep[];
  answers: OnboardingAnswers;
  isLoading: boolean;
  isSaving: boolean;
}

export function useOnboardingFlow() {
  const { isAuthenticated, isAuthLoading } = useUserStore();

  const [state, setState] = useState<OnboardingState>({
    currentStepIndex: 0,
    steps: [],
    answers: {},
    isLoading: true,
    isSaving: false,
  });

  // Fetch steps from DB
  const { data: steps, isLoading, error } = useQuery({
    queryKey: ['onboarding-steps'],
    queryFn: () => onboardingService.getSteps(),
    enabled: isAuthenticated && !isAuthLoading,
    staleTime: Infinity,
    retry: false,
  });

  console.log("[useOnboardingFlow] isAuthenticated:", isAuthenticated, "isAuthLoading:", isAuthLoading, "isLoading:", isLoading, "steps:", steps?.length, "error:", error);

  useEffect(() => {
    if (steps && steps.length > 0) {
      console.log("[useOnboardingFlow] Setting steps:", steps.length);
      setState(prev => ({ ...prev, steps, isLoading: false }));
    } else if (!isLoading && (steps || error)) {
      console.log("[useOnboardingFlow] No steps or error, setting loading false");
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [steps, isLoading, error]);

  // Fallback: set loading to false after 5 seconds if still loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (state.isLoading) {
        console.log("[useOnboardingFlow] Timeout fallback - setting loading false");
        setState(prev => ({ ...prev, isLoading: false }));
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const currentStep = state.steps[state.currentStepIndex] ?? null;
  const totalSteps = state.steps.length;

  // Toggle/select option
  const selectOption = useCallback((stepKey: string, optionId: string, multiple: boolean) => {
    setState(prev => {
      const currentAnswer = prev.answers[stepKey];
      let newAnswer: string | string[];

      if (multiple) {
        // Toggle in array
        const arr = Array.isArray(currentAnswer) ? currentAnswer : [];
        if (arr.includes(optionId)) {
          newAnswer = arr.filter(id => id !== optionId);
        } else {
          newAnswer = [...arr, optionId];
        }
      } else {
        // Single select
        newAnswer = optionId;
      }

      return {
        ...prev,
        answers: { ...prev.answers, [stepKey]: newAnswer },
      };
    });
  }, []);

  // Set stamina value
  const setStamina = useCallback((value: number) => {
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, stamina: value },
    }));
  }, []);

  // Check if current step can proceed
  const canProceed = useMemo((): boolean => {
    if (!currentStep) return false;
    const answer = state.answers[currentStep.step_key];

    if (currentStep.step_key === 'stamina') {
      return answer !== undefined && answer !== null;
    }
    if (currentStep.step_key === 'mbti') {
      return true; // MBTI is optional
    }
    if (currentStep.multiple) {
      return Array.isArray(answer) && answer.length > 0;
    }
    return answer !== undefined && answer !== null && answer !== '';
  }, [currentStep, state.answers]);

  const goNext = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStepIndex: Math.min(prev.currentStepIndex + 1, prev.steps.length - 1),
    }));
  }, []);

  const goBack = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStepIndex: Math.max(prev.currentStepIndex - 1, 0),
    }));
  }, []);

  const finishOnboarding = useCallback(async () => {
    console.log("[onboarding] finishOnboarding called with answers:", state.answers);

    setState(prev => ({ ...prev, isSaving: true }));

    try {
      const success = await onboardingService.saveAnswers(state.answers);
      console.log("[onboarding] saveAnswers result:", success);

      if (success) {
        const { supabase } = await import('../api/supabase');
        const userId = (await supabase.auth.getUser()).data.user?.id;
        if (userId) {
          await supabase
            .from('profiles')
            .update({ onboarding_done: true })
            .eq('id', userId);
          console.log("[onboarding] Profile updated");
        }
        router.replace('/(auth)/generating');
      }
    } catch (error) {
      console.error("[onboarding] Error:", error);
    }

    setState(prev => ({ ...prev, isSaving: false }));
  }, [state.answers]);

  const skipStep = useCallback(() => {
    if (currentStep?.step_key === 'mbti') {
      setState(prev => ({
        ...prev,
        answers: { ...prev.answers, mbti_type: null },
      }));
      setTimeout(() => finishOnboarding(), 0);
    }
  }, [currentStep, finishOnboarding]);

  return {
    currentStep,
    currentStepIndex: state.currentStepIndex,
    totalSteps,
    steps: state.steps,
    answers: state.answers,
    isLoading: state.isLoading,
    isSaving: state.isSaving,
    selectOption,
    setStamina,
    canProceed,
    goNext,
    goBack,
    finishOnboarding,
    skipStep,
    isLastStep: state.currentStepIndex === totalSteps - 1,
    isFirstStep: state.currentStepIndex === 0,
  };
}
