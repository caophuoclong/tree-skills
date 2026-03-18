import { apiClient } from '../client';
import { API } from '../endpoints';
import type { AssessmentQuestion } from '../../data/assessment-questions';

export const assessmentService = {
  async getQuestions(): Promise<AssessmentQuestion[]> {
    const { data } = await apiClient.get<AssessmentQuestion[]>(API.assessment.questions);
    return data;
  },
};
