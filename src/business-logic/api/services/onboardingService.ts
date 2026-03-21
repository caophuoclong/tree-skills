import { supabase } from '../supabase';

// Cast to any for tables not yet in generated types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

async function getAuthUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export interface OnboardingOption {
  id: string;
  key: string;
  label: string;
  label_en: string;
  icon: string;
  desc?: string;
}

export interface OnboardingStep {
  step_key: string;
  master_type: string | null;
  title: string;
  subtitle: string;
  multiple: boolean;
  required: boolean;
  sort_order: number;
  options: OnboardingOption[];
}

export type OnboardingAnswers = Record<string, string | string[] | number | null>;

export const onboardingService = {
  /**
   * Fetch all onboarding steps with their options
   */
  async getSteps(): Promise<OnboardingStep[]> {
    console.log("[onboardingService] getSteps called");

    // Fetch steps config
    const { data: steps, error: stepsError } = await db
      .from('onboarding_steps')
      .select('*')
      .order('sort_order');

    console.log("[onboardingService] steps result:", { steps: steps?.length, error: stepsError });

    if (stepsError) {
      console.error("[onboardingService] Error fetching steps:", stepsError.message);
      return [];
    }

    if (!steps) return [];

    // Fetch all master_data for these steps
    const masterTypes = steps
      .map((s: any) => s.master_type)
      .filter((t: string | null) => t !== null);

    console.log("[onboardingService] masterTypes:", masterTypes);

    const { data: allOptions, error: optionsError } = await db
      .from('master_data')
      .select('id, key, type, data')
      .in('type', masterTypes)
      .eq('is_active', true)
      .order('sort_order');

    console.log("[onboardingService] options result:", { options: allOptions?.length, error: optionsError });

    // Group options by type
    const optionsByType: Record<string, OnboardingOption[]> = {};
    for (const opt of allOptions ?? []) {
      if (!optionsByType[opt.type]) {
        optionsByType[opt.type] = [];
      }
      optionsByType[opt.type].push({
        id: opt.id,
        key: opt.key,
        label: opt.data.label,
        label_en: opt.data.label_en ?? '',
        icon: opt.data.icon ?? '',
        desc: opt.data.desc,
      });
    }

    // Combine steps with options
    return steps.map((step: any) => ({
      step_key: step.step_key,
      master_type: step.master_type,
      title: step.title,
      subtitle: step.subtitle,
      multiple: step.multiple,
      required: step.required,
      sort_order: step.sort_order,
      options: optionsByType[step.master_type] ?? [],
    }));
  },

  /**
   * Save onboarding answers
   */
  async saveAnswers(answers: OnboardingAnswers): Promise<boolean> {
    const userId = await getAuthUserId();
    console.log("[onboardingService] saveAnswers userId:", userId);
    if (!userId) return false;

    const { data, error } = await db
      .from('user_onboardings')
      .upsert({
        user_id: userId,
        answers,
      }, { onConflict: 'user_id' })
      .select();

    console.log("[onboardingService] upsert result:", { data, error });

    if (error) {
      console.error("[onboardingService] Error saving:", error.message);
    }

    return !error;
  },

  /**
   * Get user's existing onboarding
   */
  async getAnswers(): Promise<OnboardingAnswers | null> {
    const userId = await getAuthUserId();
    if (!userId) return null;

    const { data } = await db
      .from('user_onboardings')
      .select('answers')
      .eq('user_id', userId)
      .single();

    return data?.answers ?? null;
  },

  /**
   * Check if user has completed onboarding
   */
  async hasCompleted(): Promise<boolean> {
    const userId = await getAuthUserId();
    if (!userId) return false;

    const { data } = await db
      .from('user_onboardings')
      .select('id')
      .eq('user_id', userId)
      .single();

    return !!data;
  },
};
