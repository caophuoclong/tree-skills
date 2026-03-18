import { apiClient } from '../client';
import { API } from '../endpoints';
import type { UserProgress } from '../../types';

export const userService = {
  async getMe(): Promise<UserProgress> {
    const { data } = await apiClient.get<UserProgress>(API.user.me);
    return data;
  },
  async update(patch: Partial<UserProgress>): Promise<UserProgress> {
    const { data } = await apiClient.patch<UserProgress>(API.user.update, patch);
    return data;
  },
};
