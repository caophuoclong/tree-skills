import { apiClient } from '../client';
import { API } from '../endpoints';
import type { SkillNode } from '../../types';

export const skillTreeService = {
  async getNodes(): Promise<SkillNode[]> {
    const { data } = await apiClient.get<SkillNode[]>(API.skillTree.nodes);
    return data;
  },
  async updateNode(nodeId: string, patch: Partial<SkillNode>): Promise<SkillNode> {
    const { data } = await apiClient.patch<SkillNode>(API.skillTree.updateNode(nodeId), patch);
    return data;
  },
};
