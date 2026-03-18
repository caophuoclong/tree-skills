import type MockAdapter from 'axios-mock-adapter';
import type { UserProgress } from '../../../types';
import { API } from '../../endpoints';

const MOCK_USER: UserProgress = {
  user_id: 'mock-user-1',
  name: 'Người Dùng Thử Nghiệm',
  avatar_url: null,
  level: 3,
  total_xp: 450,
  current_xp_in_level: 100,
  xp_to_next_level: 200,
  streak: 5,
  best_streak: 12,
  stamina: 85,
  last_active_date: new Date().toISOString().split('T')[0],
  last_login_at: new Date().toISOString().split('T')[0],
  onboarding_done: true,
};

export function setupUserHandlers(mock: MockAdapter) {
  mock.onGet(API.user.me).reply(200, MOCK_USER);
  mock.onPatch(API.user.update).reply((config) => {
    const patch = JSON.parse(config.data);
    return [200, { ...MOCK_USER, ...patch }];
  });
}
