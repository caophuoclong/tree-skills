import { apiClient } from '../client';
import { API } from '../endpoints';
import type { Challenge } from '../../data/challenge-library';

export const challengeService = {
  async getAll(): Promise<Challenge[]> {
    const { data } = await apiClient.get<Challenge[]>(API.challenges.list);
    return data;
  },
};
