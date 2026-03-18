import type MockAdapter from 'axios-mock-adapter';
import { CHALLENGE_LIBRARY } from '../../../data/challenge-library';
import { API } from '../../endpoints';

export function setupChallengeHandlers(mock: MockAdapter) {
  mock.onGet(API.challenges.list).reply(200, CHALLENGE_LIBRARY);
  mock.onPost(/\/challenges\/.*\/join/).reply(200, { ok: true });
  mock.onPost(/\/challenges\/.*\/leave/).reply(200, { ok: true });
}
