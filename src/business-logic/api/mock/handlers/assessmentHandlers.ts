import type MockAdapter from 'axios-mock-adapter';
import { ASSESSMENT_QUESTIONS } from '../../../data/assessment-questions';
import { API } from '../../endpoints';

export function setupAssessmentHandlers(mock: MockAdapter) {
  mock.onGet(API.assessment.questions).reply(200, ASSESSMENT_QUESTIONS);
}
