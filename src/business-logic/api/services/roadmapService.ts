import { apiClient } from '../client';
import { API } from '../endpoints';
import type { RoadmapMilestone, TimeHorizon, Branch } from '../../types';

export const roadmapService = {
  async getAll(): Promise<RoadmapMilestone[]> {
    const { data } = await apiClient.get<RoadmapMilestone[]>(API.roadmap.list);
    return data;
  },
  async create(title: string, branch: Branch, horizon: TimeHorizon): Promise<RoadmapMilestone> {
    const { data } = await apiClient.post<RoadmapMilestone>(API.roadmap.create, {
      title, branch, horizon,
    });
    return data;
  },
  async update(id: string, patch: Partial<RoadmapMilestone>): Promise<RoadmapMilestone> {
    const { data } = await apiClient.patch<RoadmapMilestone>(API.roadmap.update(id), patch);
    return data;
  },
  async delete(id: string): Promise<void> {
    await apiClient.delete(API.roadmap.delete(id));
  },
};
