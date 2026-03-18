import type MockAdapter from 'axios-mock-adapter';
import type { RoadmapMilestone, TimeHorizon, Branch } from '../../../types';
import { API } from '../../endpoints';

function generateId(): string {
  return Math.random().toString(36).slice(2);
}

function getTargetDate(horizon: TimeHorizon): string {
  const days = horizon === 'short' ? 90 : horizon === 'mid' ? 365 : 1095;
  const d = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return d.toISOString().split('T')[0];
}

// Seed milestones live here — NOT in the store
const MOCK_MILESTONES: RoadmapMilestone[] = [
  {
    id: generateId(),
    title: 'Hoàn thành khóa học Tiếng Anh A2',
    branch: 'softskills' as Branch,
    horizon: 'short' as TimeHorizon,
    targetDate: getTargetDate('short'),
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: 'Tiết kiệm được $5000 quỹ khẩn cấp',
    branch: 'finance' as Branch,
    horizon: 'short' as TimeHorizon,
    targetDate: getTargetDate('short'),
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: 'Nâng cấp lên vị trí cao hơn tại công ty',
    branch: 'career' as Branch,
    horizon: 'mid' as TimeHorizon,
    targetDate: getTargetDate('mid'),
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: 'Đạt trọng lượng lý tưởng và sức khỏe tốt',
    branch: 'wellbeing' as Branch,
    horizon: 'mid' as TimeHorizon,
    targetDate: getTargetDate('mid'),
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: 'Xây dựng sự nghiệp riêng độc lập',
    branch: 'career' as Branch,
    horizon: 'long' as TimeHorizon,
    targetDate: getTargetDate('long'),
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: 'Tự do tài chính — thu nhập thụ động đủ sống',
    branch: 'finance' as Branch,
    horizon: 'long' as TimeHorizon,
    targetDate: getTargetDate('long'),
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
];

// In-memory state for mock CRUD
let milestones = [...MOCK_MILESTONES];

export function setupRoadmapHandlers(mock: MockAdapter) {
  // GET /roadmap/milestones
  mock.onGet(API.roadmap.list).reply(200, milestones);

  // POST /roadmap/milestones
  mock.onPost(API.roadmap.create).reply((config) => {
    const body = JSON.parse(config.data) as { title: string; branch: Branch; horizon: TimeHorizon };
    const days = body.horizon === 'short' ? 90 : body.horizon === 'mid' ? 365 : 1095;
    const newItem: RoadmapMilestone = {
      id: generateId(),
      title: body.title,
      branch: body.branch,
      horizon: body.horizon,
      targetDate: getTargetDate(body.horizon),
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };
    milestones.push(newItem);
    return [201, newItem];
  });

  // PATCH /roadmap/milestones/:id
  mock.onPatch(/\/roadmap\/milestones\/.*/).reply((config) => {
    const id = config.url?.split('/').pop();
    const patch = JSON.parse(config.data);
    milestones = milestones.map((m) => (m.id === id ? { ...m, ...patch } : m));
    const updated = milestones.find((m) => m.id === id);
    return updated ? [200, updated] : [404, { error: 'Not found' }];
  });

  // DELETE /roadmap/milestones/:id
  mock.onDelete(/\/roadmap\/milestones\/.*/).reply((config) => {
    const id = config.url?.split('/').pop();
    milestones = milestones.filter((m) => m.id !== id);
    return [204, null];
  });
}
