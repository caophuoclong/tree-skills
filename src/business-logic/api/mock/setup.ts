import MockAdapter from 'axios-mock-adapter';
import { apiClient } from '../client';
import { setupQuestHandlers } from './handlers/questHandlers';
import { setupSkillTreeHandlers } from './handlers/skillTreeHandlers';
import { setupChallengeHandlers } from './handlers/challengeHandlers';
import { setupAssessmentHandlers } from './handlers/assessmentHandlers';
import { setupUserHandlers } from './handlers/userHandlers';
import { setupRoadmapHandlers } from './handlers/roadmapHandlers';
import { setupCustomTreeHandlers } from './handlers/customTreeHandlers';

let _mock: MockAdapter | null = null;

export function setupNetworkMocks() {
  if (_mock) return; // already set up

  _mock = new MockAdapter(apiClient, {
    delayResponse: 400, // simulate 400ms network latency
    onNoMatch: 'throwException', // fail loudly on unhandled routes
  });

  setupQuestHandlers(_mock);
  setupSkillTreeHandlers(_mock);
  setupChallengeHandlers(_mock);
  setupAssessmentHandlers(_mock);
  setupUserHandlers(_mock);
  setupRoadmapHandlers(_mock);
  setupCustomTreeHandlers(_mock);

  console.log('[DEV] Network mocks enabled — axios-mock-adapter active');
}

export function teardownNetworkMocks() {
  _mock?.restore();
  _mock = null;
}
