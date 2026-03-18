import type { AssessmentQuestion } from "../../data/assessment-questions";
import { supabase } from "../supabase";

export const assessmentService = {
  async getQuestions(): Promise<AssessmentQuestion[]> {
    // Fetch questions and their options in one round-trip
    const { data, error } = await supabase
      .from("assessment_questions")
      .select(
        `
        id,
        question,
        assessment_options (
          id,
          text,
          branch,
          sort_order
        )
      `,
      )
      .order("sort_order", { ascending: true });

    if (error) throw error;

    return (data ?? []).map((q) => ({
      id: q.id,
      question: q.question,
      options: (q.assessment_options as any[])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((opt) => ({
          id: opt.id as string,
          text: opt.text as string,
          branch: opt.branch as import("../../types").Branch,
        })),
    }));
  },
};
