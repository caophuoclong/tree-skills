import type MockAdapter from 'axios-mock-adapter';
import { getDemoCustomData } from '../../../data/skill-tree-nodes';
import { API } from '../../endpoints';

export function setupCustomTreeHandlers(mock: MockAdapter) {
  // GET /custom-trees → returns user's saved custom goal trees
  mock.onGet(API.customTrees.list).reply(() => {
    const { trees } = getDemoCustomData();
    return [200, trees];
  });

  // POST /custom-trees/seed → returns seed data for first-time users
  mock.onPost(API.customTrees.seed).reply(() => {
    return [200, getDemoCustomData()];
  });
}
