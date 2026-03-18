import type { Branch, CustomCluster, CustomGoalTree, CustomQuest, CustomSkillItem } from '../types';

export const BRANCH_KEYWORDS: Record<Branch, string[]> = {
  career: [
    'lập trình', 'coding', 'code', 'python', 'javascript', 'react', 'backend', 'frontend',
    'fullstack', 'dev', 'developer', 'kỹ sư', 'engineer', 'it', 'công nghệ', 'tech',
    'thiết kế', 'design', 'ux', 'ui', 'marketing', 'kinh doanh', 'business', 'bán hàng',
    'sales', 'quản lý', 'manager', 'lãnh đạo', 'leader', 'startup', 'entrepreneur',
    'ngoại ngữ', 'tiếng anh', 'english', 'nghề nghiệp', 'career', 'sự nghiệp',
  ],
  finance: [
    'tài chính', 'finance', 'tiết kiệm', 'đầu tư', 'invest', 'chứng khoán', 'cổ phiếu',
    'crypto', 'tiền', 'money', 'ngân sách', 'budget', 'thu nhập', 'income', 'chi tiêu',
    'freelance', 'kiếm tiền', 'earn', 'tích lũy', 'wealth', 'giàu', 'rich',
  ],
  softskills: [
    'giao tiếp', 'communication', 'thuyết trình', 'presentation', 'kỹ năng mềm',
    'soft skill', 'tư duy', 'thinking', 'sáng tạo', 'creative', 'giải quyết vấn đề',
    'problem', 'quản lý thời gian', 'time management', 'productivity', 'năng suất',
    'cảm xúc', 'emotion', 'eq', 'trí tuệ', 'mindset', 'networking',
    'kết nối', 'viết', 'writing', 'đọc sách', 'reading', 'học', 'study', 'tự học',
  ],
  wellbeing: [
    'sức khỏe', 'health', 'thể dục', 'gym', 'tập luyện', 'exercise', 'chạy bộ', 'run',
    'yoga', 'thiền', 'meditation', 'ngủ', 'sleep', 'dinh dưỡng', 'nutrition', 'ăn uống',
    'diet', 'tâm lý', 'mental', 'stress', 'cân bằng', 'balance', 'wellbeing',
    'hạnh phúc', 'happy', 'thư giãn', 'relax', 'cơ thể', 'body',
  ],
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function makeQuest(title: string, difficulty: 'easy' | 'medium' | 'hard', duration: 5 | 15 | 30): CustomQuest {
  return { id: uid(), title, difficulty, duration_min: duration };
}

export function makeCluster(
  title: string,
  branch: Branch,
  tier: 1 | 2 | 3,
  emoji: string,
  skills: CustomSkillItem[],
): CustomCluster {
  return { id: uid(), title, branch, tier, emoji, skills };
}

export function makeSkill(
  title: string,
  description: string,
  branch: Branch,
  durationWeeks: 1 | 2,
  questsFn: (title: string, branch: Branch) => CustomQuest[],
): CustomSkillItem {
  return {
    id: uid(),
    title,
    description,
    branch,
    duration_weeks: durationWeeks,
    quests: questsFn(title, branch),
    status: 'locked',
  };
}
