import type MockAdapter from 'axios-mock-adapter';
import { getDailyQuestPool } from '../../../data/quest-library';
import type { Branch } from '../../../types';
import { API } from '../../endpoints';

export function setupQuestHandlers(mock: MockAdapter) {
  // GET /quests/daily?branch=career&stamina=80
  mock.onGet(API.quests.daily).reply((config) => {
    const branch = (config.params?.branch ?? 'career') as Branch;
    const stamina = Number(config.params?.stamina ?? 100);
    const quests = getDailyQuestPool(branch, stamina);
    return [200, quests];
  });

  // POST /quests/:id/complete — just 200 OK (state managed client-side)
  mock.onPost(/\/quests\/.*\/complete/).reply(200, { ok: true });
}
