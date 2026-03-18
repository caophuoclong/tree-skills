import { apiClient } from '../client';
import { API } from '../endpoints';
import type { Quest, Branch } from '../../types';

export const questService = {
  async getDaily(branch: Branch, stamina: number): Promise<Quest[]> {
    const { data } = await apiClient.get<Quest[]>(API.quests.daily, {
      params: { branch, stamina },
    });
    return data;
  },
  async complete(questId: string): Promise<void> {
    await apiClient.post(API.quests.complete(questId));
  },
};
