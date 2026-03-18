import type MockAdapter from 'axios-mock-adapter';
import { getInitialNodes } from '../../../data/skill-tree-nodes';
import { API } from '../../endpoints';

export function setupSkillTreeHandlers(mock: MockAdapter) {
  mock.onGet(API.skillTree.nodes).reply(200, getInitialNodes());
  mock.onPatch(/\/skill-tree\/nodes\/.*/).reply((config) => {
    const patch = JSON.parse(config.data);
    return [200, patch];
  });
}
