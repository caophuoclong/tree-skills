import { create } from 'zustand';
import type {
  Branch,
  CustomCluster,
  CustomGoalTree,
  CustomQuest,
  CustomSkillItem,
  Difficulty,
  QuestDuration,
} from '../types';

// ─── Mock AI generator ─────────────────────────────────────────────────────────
const BRANCH_KEYWORDS: Record<Branch, string[]> = {
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

function detectBranch(text: string): Branch {
  const lower = text.toLowerCase();
  const scores: Record<Branch, number> = { career: 0, finance: 0, softskills: 0, wellbeing: 0 };
  for (const [branch, keywords] of Object.entries(BRANCH_KEYWORDS) as [Branch, string[]][]) {
    for (const kw of keywords) {
      if (lower.includes(kw)) scores[branch]++;
    }
  }
  const top = (Object.entries(scores) as [Branch, number][]).sort((a, b) => b[1] - a[1]);
  return top[0][1] > 0 ? top[0][0] : 'softskills';
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function makeQuest(title: string, difficulty: Difficulty, duration: QuestDuration): CustomQuest {
  return { id: uid(), title, difficulty, duration_min: duration };
}

/** Generate 3 contextual quests for a skill based on title keywords */
function generateQuests(skillTitle: string, branch: Branch): CustomQuest[] {
  const t = skillTitle.toLowerCase();

  // ── Specific skill patterns ────────────────────────────────────────────────
  if (t.includes('html') || t.includes('css')) return [
    makeQuest('Xây dựng trang landing page cá nhân', 'easy', 30),
    makeQuest('Clone layout của 1 website yêu thích', 'medium', 30),
    makeQuest('Thêm animation & responsive breakpoints', 'hard', 30),
  ];
  if (t.includes('javascript') || t.includes('js')) return [
    makeQuest('Giải 5 bài tập về biến và hàm cơ bản', 'easy', 15),
    makeQuest('Xây dựng to-do list không dùng framework', 'medium', 30),
    makeQuest('Implement fetch API gọi dữ liệu từ JSONPlaceholder', 'hard', 30),
  ];
  if (t.includes('git')) return [
    makeQuest('Tạo repo đầu tiên và commit 3 lần', 'easy', 15),
    makeQuest('Thực hành branch, merge và resolve conflict', 'medium', 30),
    makeQuest('Đẩy code và tạo Pull Request đầu tiên', 'medium', 15),
  ];
  if (t.includes('react')) return [
    makeQuest('Xây dựng Counter component với useState', 'easy', 15),
    makeQuest('Fetch và hiển thị danh sách từ API thật', 'medium', 30),
    makeQuest('Tối ưu hiệu suất với useMemo và useCallback', 'hard', 30),
  ];
  if (t.includes('database') || t.includes('sql')) return [
    makeQuest('Thiết kế schema cho ứng dụng blog đơn giản', 'easy', 30),
    makeQuest('Viết 10 câu query SELECT, JOIN, WHERE', 'medium', 30),
    makeQuest('Tối ưu query với index và explain plan', 'hard', 30),
  ];
  if (t.includes('ngân sách') || t.includes('budget')) return [
    makeQuest('Liệt kê toàn bộ chi tiêu trong 7 ngày qua', 'easy', 15),
    makeQuest('Phân loại chi tiêu theo 50/30/20 rule', 'medium', 30),
    makeQuest('Thiết lập ngân sách tháng tới trong app', 'medium', 15),
  ];
  if (t.includes('đầu tư') || t.includes('chứng khoán') || t.includes('etf')) return [
    makeQuest('Đọc 1 báo cáo tài chính cơ bản của công ty', 'easy', 30),
    makeQuest('Mô phỏng đầu tư với tài khoản demo', 'medium', 30),
    makeQuest('Tính toán và so sánh lợi suất 3 kênh đầu tư', 'hard', 30),
  ];
  if (t.includes('thiền') || t.includes('meditation')) return [
    makeQuest('Thực hành thở 4-7-8 trong 5 phút', 'easy', 5),
    makeQuest('Hoàn thành 1 buổi thiền định hướng dẫn 10 phút', 'easy', 15),
    makeQuest('Duy trì chuỗi thiền 7 ngày liên tiếp', 'medium', 5),
  ];
  if (t.includes('tiếng anh') || t.includes('ngữ pháp') || t.includes('từ vựng')) return [
    makeQuest('Ôn 20 flashcard từ vựng mới', 'easy', 5),
    makeQuest('Viết 1 đoạn văn 100 chữ về ngày hôm nay', 'medium', 15),
    makeQuest('Xem 1 video YouTube không phụ đề và tóm tắt', 'hard', 30),
  ];
  if (t.includes('gym') || t.includes('tập')) return [
    makeQuest('Hoàn thành 1 buổi tập warmup & cooldown đúng cách', 'easy', 15),
    makeQuest('Ghi lại log tập 3 buổi trong tuần', 'medium', 5),
    makeQuest('Tăng tổng khối lượng nâng thêm 10% so với tuần trước', 'hard', 30),
  ];
  if (t.includes('giao tiếp') || t.includes('thuyết trình')) return [
    makeQuest('Ghi âm bản thân nói 2 phút về 1 chủ đề tự chọn', 'easy', 5),
    makeQuest('Thực hành kỹ thuật STAR khi kể câu chuyện', 'medium', 15),
    makeQuest('Thuyết trình 5 phút trước gương + tự đánh giá', 'hard', 30),
  ];

  // ── Generic fallback by branch ─────────────────────────────────────────────
  const genericByBranch: Record<Branch, CustomQuest[]> = {
    career: [
      makeQuest(`Nghiên cứu tổng quan về "${skillTitle}" (30 phút)`, 'easy', 30),
      makeQuest(`Làm bài tập thực hành nhỏ về "${skillTitle}"`, 'medium', 30),
      makeQuest(`Ứng dụng "${skillTitle}" vào dự án thực tế`, 'hard', 30),
    ],
    finance: [
      makeQuest(`Tìm hiểu khái niệm cơ bản về "${skillTitle}"`, 'easy', 15),
      makeQuest(`Tính toán ví dụ thực tế liên quan đến "${skillTitle}"`, 'medium', 30),
      makeQuest(`Lên kế hoạch hành động cho "${skillTitle}"`, 'hard', 30),
    ],
    softskills: [
      makeQuest(`Đọc 1 bài viết hay về "${skillTitle}"`, 'easy', 15),
      makeQuest(`Thực hành "${skillTitle}" trong tình huống thực tế`, 'medium', 30),
      makeQuest(`Nhờ người khác đánh giá kỹ năng "${skillTitle}" của bạn`, 'hard', 15),
    ],
    wellbeing: [
      makeQuest(`Thực hiện "${skillTitle}" lần đầu tiên đủ 10 phút`, 'easy', 15),
      makeQuest(`Duy trì "${skillTitle}" 3 ngày liên tiếp`, 'medium', 15),
      makeQuest(`Theo dõi cảm nhận sau 1 tuần thực hành "${skillTitle}"`, 'medium', 5),
    ],
  };
  return genericByBranch[branch];
}

/** Realistic AI mock — generates clusters from a goal string */
export function mockAIGenerate(goal: string): CustomGoalTree {
  const lower = goal.toLowerCase();
  let clusters: CustomCluster[] = [];

  if (lower.includes('lập trình') || lower.includes('developer') || lower.includes('code') || lower.includes('fullstack')) {
    clusters = [
      makeCluster('Nền tảng kỹ thuật', 'career', 1, '⚙️', [
        makeSkill('HTML & CSS cơ bản', 'Xây dựng giao diện web với HTML/CSS', 'career', 1),
        makeSkill('JavaScript cốt lõi', 'Biến, hàm, vòng lặp, DOM manipulation', 'career', 1),
        makeSkill('Git & GitHub', 'Quản lý phiên bản và làm việc nhóm với Git', 'career', 1),
      ]),
      makeCluster('Frontend Development', 'career', 2, '🖥️', [
        makeSkill('React / React Native', 'Component, state, hooks, lifecycle', 'career', 2),
        makeSkill('Thiết kế UI/UX cơ bản', 'Nguyên tắc thiết kế, Figma cơ bản', 'career', 1),
        makeSkill('Responsive & CSS nâng cao', 'Flexbox, Grid, animation', 'career', 1),
      ]),
      makeCluster('Backend & Database', 'career', 2, '🗄️', [
        makeSkill('Node.js / Python backend', 'API RESTful, server-side logic', 'career', 2),
        makeSkill('Database cơ bản', 'SQL, NoSQL — queries và thiết kế schema', 'career', 1),
        makeSkill('Authentication & Security', 'JWT, OAuth, bảo mật cơ bản', 'career', 2),
      ]),
      makeCluster('Làm việc chuyên nghiệp', 'softskills', 3, '🤝', [
        makeSkill('Làm việc nhóm & Agile', 'Scrum, kanban, sprint planning', 'softskills', 1),
        makeSkill('Code review & Documentation', 'Viết code sạch và tài liệu rõ ràng', 'softskills', 1),
      ]),
    ];
  } else if (lower.includes('tiếng anh') || lower.includes('english')) {
    clusters = [
      makeCluster('Nền tảng ngôn ngữ', 'career', 1, '📚', [
        makeSkill('Ngữ pháp cơ bản', 'Thì hiện tại, quá khứ, tương lai', 'career', 1),
        makeSkill('Từ vựng hằng ngày', '500 từ vựng thiết yếu nhất', 'career', 1),
        makeSkill('Phát âm chuẩn', 'IPA, âm cuối, trọng âm từ', 'career', 1),
      ]),
      makeCluster('Kỹ năng nghe & nói', 'softskills', 2, '🗣️', [
        makeSkill('Nghe podcast / YouTube', 'Listen & Repeat 15 phút/ngày', 'softskills', 1),
        makeSkill('Nói chuyện cơ bản', 'Hội thoại hằng ngày, small talk', 'softskills', 1),
        makeSkill('Thuyết trình tiếng Anh', 'Trình bày ý tưởng rõ ràng bằng tiếng Anh', 'softskills', 2),
      ]),
      makeCluster('Kỹ năng đọc & viết', 'career', 2, '✍️', [
        makeSkill('Đọc hiểu tài liệu kỹ thuật', 'Documentation, emails, reports', 'career', 1),
        makeSkill('Viết email chuyên nghiệp', 'Business email, follow-up, tone', 'career', 1),
      ]),
      makeCluster('Thói quen hằng ngày', 'wellbeing', 1, '🌅', [
        makeSkill('Học tiếng Anh mỗi sáng', 'Duolingo hoặc Anki flashcard 10 phút', 'wellbeing', 1),
      ]),
    ];
  } else if (lower.includes('tài chính') || lower.includes('đầu tư') || lower.includes('tiết kiệm')) {
    clusters = [
      makeCluster('Nhận thức tài chính cá nhân', 'finance', 1, '💡', [
        makeSkill('Lập ngân sách tháng', 'Quy tắc 50/30/20 và theo dõi chi tiêu', 'finance', 1),
        makeSkill('Quỹ khẩn cấp', 'Xây dựng quỹ 3-6 tháng chi tiêu', 'finance', 1),
        makeSkill('Tư duy tài chính lành mạnh', 'Phân biệt tài sản, tiêu sản, dòng tiền', 'finance', 1),
      ]),
      makeCluster('Đầu tư cơ bản', 'finance', 2, '📈', [
        makeSkill('Chứng khoán cổ phiếu', 'Cách đọc biểu đồ, chọn cổ phiếu cơ bản', 'finance', 2),
        makeSkill('Quỹ ETF / Index Fund', 'Đầu tư thụ động dài hạn', 'finance', 1),
        makeSkill('Crypto an toàn', 'Bitcoin, ETH, quản lý rủi ro', 'finance', 2),
      ]),
      makeCluster('Tăng thu nhập', 'career', 2, '🚀', [
        makeSkill('Kỹ năng freelance', 'Tìm khách hàng, định giá dịch vụ', 'career', 2),
        makeSkill('Xây dựng thương hiệu cá nhân', 'LinkedIn, portfolio, mạng lưới quan hệ', 'career', 2),
      ]),
      makeCluster('Tâm lý tiêu dùng', 'softskills', 1, '🧠', [
        makeSkill('Kiểm soát mua sắm cảm tính', 'Nhận diện trigger, kỹ thuật 24h rule', 'softskills', 1),
      ]),
    ];
  } else if (lower.includes('sức khỏe') || lower.includes('gym') || lower.includes('thể dục') || lower.includes('giảm cân')) {
    clusters = [
      makeCluster('Vận động & Tập luyện', 'wellbeing', 1, '💪', [
        makeSkill('Tập gym cơ bản', 'Big 3: Squat, Bench, Deadlift', 'wellbeing', 2),
        makeSkill('Cardio hằng tuần', 'Chạy bộ 3 buổi/tuần 20-30 phút', 'wellbeing', 1),
        makeSkill('Bài tập linh hoạt', 'Stretching, foam roller, mobility', 'wellbeing', 1),
      ]),
      makeCluster('Dinh dưỡng', 'wellbeing', 2, '🥗', [
        makeSkill('Nguyên tắc ăn sạch', 'Protein, carb, fat cân bằng', 'wellbeing', 1),
        makeSkill('Theo dõi calories', 'Dùng app tracking, meal prep cơ bản', 'wellbeing', 1),
        makeSkill('Thói quen uống nước', '2L/ngày, uống đúng thời điểm', 'wellbeing', 1),
      ]),
      makeCluster('Sức khỏe tinh thần', 'wellbeing', 2, '🧘', [
        makeSkill('Thiền định cơ bản', '10 phút/ngày, mindfulness', 'wellbeing', 1),
        makeSkill('Giấc ngủ chất lượng', 'Sleep hygiene, 7-8 tiếng', 'wellbeing', 1),
      ]),
      makeCluster('Kỷ luật & Duy trì', 'softskills', 3, '🎯', [
        makeSkill('Xây dựng thói quen bền vững', 'Habit stacking, streak tracking', 'softskills', 1),
      ]),
    ];
  } else {
    const primaryBranch = detectBranch(goal);
    clusters = [
      makeCluster('Nền tảng kiến thức', primaryBranch, 1, '📖', [
        makeSkill(`Tổng quan về "${goal}"`, 'Nghiên cứu, đọc tài liệu, xem video nền tảng', primaryBranch, 1),
        makeSkill('Xác định mục tiêu cụ thể', 'SMART goals — cụ thể, đo được, có thời hạn', primaryBranch, 1),
        makeSkill('Tìm mentors & cộng đồng', 'Kết nối với người đã thành công trong lĩnh vực', primaryBranch, 1),
      ]),
      makeCluster('Thực hành & Ứng dụng', primaryBranch, 2, '⚡', [
        makeSkill('Dự án thực hành đầu tiên', 'Làm một dự án nhỏ để áp dụng kiến thức', primaryBranch, 2),
        makeSkill('Xây dựng thói quen học hằng ngày', '30 phút/ngày tập trung vào mục tiêu', primaryBranch, 1),
        makeSkill('Thu thập phản hồi', 'Nhờ người khác review, cải thiện từ feedback', primaryBranch, 1),
      ]),
      makeCluster('Kỹ năng hỗ trợ', 'softskills', 2, '🔧', [
        makeSkill('Quản lý thời gian hiệu quả', 'Time blocking, Pomodoro, ưu tiên đúng task', 'softskills', 1),
        makeSkill('Tư duy phản biện', 'Phân tích vấn đề từ nhiều góc độ', 'softskills', 2),
      ]),
      makeCluster('Duy trì động lực', 'wellbeing', 1, '🌟', [
        makeSkill('Celebrate small wins', 'Ghi nhận tiến bộ nhỏ, duy trì momentum', 'wellbeing', 1),
        makeSkill('Tránh burnout', 'Rest days, cân bằng học & nghỉ ngơi', 'wellbeing', 1),
      ]),
    ];
  }

  return { id: uid(), goal, created_at: new Date().toISOString(), clusters };
}

function makeCluster(
  title: string,
  branch: Branch,
  tier: 1 | 2 | 3,
  emoji: string,
  skills: CustomSkillItem[],
): CustomCluster {
  return { id: uid(), title, branch, tier, emoji, skills };
}

function makeSkill(
  title: string,
  description: string,
  branch: Branch,
  durationWeeks: 1 | 2,
): CustomSkillItem {
  return {
    id: uid(),
    title,
    description,
    branch,
    duration_weeks: durationWeeks,
    quests: generateQuests(title, branch),
    status: 'locked',
  };
}

// ─── Store ─────────────────────────────────────────────────────────────────────
/** Maps custom node_id → goal metadata for tree screen display */
export type NodeGoalEntry = { goalId: string; goalTitle: string };

interface CustomSkillTreeStore {
  trees: CustomGoalTree[];
  currentDraft: CustomGoalTree | null;
  isGenerating: boolean;
  /** node_id → goal origin — populated when a draft is confirmed */
  nodeGoalMap: Record<string, NodeGoalEntry>;

  setGenerating: (v: boolean) => void;
  setDraft: (tree: CustomGoalTree) => void;
  discardDraft: () => void;
  confirmDraft: (onConfirmed: (nodeIds: string[], goal: CustomGoalTree) => void) => void;
  /** Seed store with pre-built demo data (called once on app init) */
  initWithDemoData: (data: { trees: CustomGoalTree[]; nodeGoalMap: Record<string, NodeGoalEntry> }) => void;

  // Cluster mutations
  addCluster: (cluster: CustomCluster) => void;
  removeCluster: (clusterId: string) => void;
  updateCluster: (clusterId: string, updates: Partial<Pick<CustomCluster, 'title' | 'branch' | 'emoji' | 'tier'>>) => void;

  // Skill mutations
  addSkillToCluster: (clusterId: string, skill: CustomSkillItem) => void;
  removeSkill: (clusterId: string, skillId: string) => void;
  updateSkill: (clusterId: string, skillId: string, updates: Partial<Pick<CustomSkillItem, 'title' | 'description'>>) => void;
  moveSkillUp: (clusterId: string, skillId: string) => void;
  moveSkillDown: (clusterId: string, skillId: string) => void;

  // Quest mutations within a skill
  updateQuest: (clusterId: string, skillId: string, questId: string, updates: Partial<Pick<CustomQuest, 'title' | 'difficulty' | 'duration_min'>>) => void;
  addQuest: (clusterId: string, skillId: string) => void;
  removeQuest: (clusterId: string, skillId: string, questId: string) => void;
}

export const useCustomSkillTreeStore = create<CustomSkillTreeStore>((set) => ({
  trees: [],
  currentDraft: null,
  isGenerating: false,
  nodeGoalMap: {},

  setGenerating: (v) => set({ isGenerating: v }),
  setDraft: (tree) => set({ currentDraft: tree, isGenerating: false }),
  discardDraft: () => set({ currentDraft: null }),
  initWithDemoData: (data) =>
    set((state) =>
      // Only seed if store is still empty (don't overwrite user's real data)
      state.trees.length === 0
        ? { trees: data.trees, nodeGoalMap: data.nodeGoalMap }
        : state
    ),

  confirmDraft: (onConfirmed) =>
    set((state) => {
      if (!state.currentDraft) return state;
      const draft = state.currentDraft;

      // Build node_id list + goal map entries
      const newGoalMap: Record<string, NodeGoalEntry> = {};
      const nodeIds: string[] = [];
      for (const cluster of draft.clusters) {
        for (const skill of cluster.skills) {
          const nodeId = `custom_${skill.id}`;
          nodeIds.push(nodeId);
          newGoalMap[nodeId] = { goalId: draft.id, goalTitle: draft.goal };
        }
      }

      onConfirmed(nodeIds, draft);
      return {
        trees: [...state.trees, draft],
        currentDraft: null,
        nodeGoalMap: { ...state.nodeGoalMap, ...newGoalMap },
      };
    }),

  addCluster: (cluster) =>
    set((state) => {
      if (!state.currentDraft) return state;
      return { currentDraft: { ...state.currentDraft, clusters: [...state.currentDraft.clusters, cluster] } };
    }),

  removeCluster: (clusterId) =>
    set((state) => {
      if (!state.currentDraft) return state;
      return { currentDraft: { ...state.currentDraft, clusters: state.currentDraft.clusters.filter((c) => c.id !== clusterId) } };
    }),

  updateCluster: (clusterId, updates) =>
    set((state) => {
      if (!state.currentDraft) return state;
      return {
        currentDraft: {
          ...state.currentDraft,
          clusters: state.currentDraft.clusters.map((c) => c.id === clusterId ? { ...c, ...updates } : c),
        },
      };
    }),

  addSkillToCluster: (clusterId, skill) =>
    set((state) => {
      if (!state.currentDraft) return state;
      return {
        currentDraft: {
          ...state.currentDraft,
          clusters: state.currentDraft.clusters.map((c) =>
            c.id === clusterId ? { ...c, skills: [...c.skills, skill] } : c,
          ),
        },
      };
    }),

  removeSkill: (clusterId, skillId) =>
    set((state) => {
      if (!state.currentDraft) return state;
      return {
        currentDraft: {
          ...state.currentDraft,
          clusters: state.currentDraft.clusters.map((c) =>
            c.id === clusterId ? { ...c, skills: c.skills.filter((s) => s.id !== skillId) } : c,
          ),
        },
      };
    }),

  updateSkill: (clusterId, skillId, updates) =>
    set((state) => {
      if (!state.currentDraft) return state;
      return {
        currentDraft: {
          ...state.currentDraft,
          clusters: state.currentDraft.clusters.map((c) =>
            c.id === clusterId
              ? { ...c, skills: c.skills.map((s) => s.id === skillId ? { ...s, ...updates } : s) }
              : c,
          ),
        },
      };
    }),

  moveSkillUp: (clusterId, skillId) =>
    set((state) => {
      if (!state.currentDraft) return state;
      return {
        currentDraft: {
          ...state.currentDraft,
          clusters: state.currentDraft.clusters.map((c) => {
            if (c.id !== clusterId) return c;
            const idx = c.skills.findIndex((s) => s.id === skillId);
            if (idx <= 0) return c;
            const s = [...c.skills];
            [s[idx - 1], s[idx]] = [s[idx], s[idx - 1]];
            return { ...c, skills: s };
          }),
        },
      };
    }),

  moveSkillDown: (clusterId, skillId) =>
    set((state) => {
      if (!state.currentDraft) return state;
      return {
        currentDraft: {
          ...state.currentDraft,
          clusters: state.currentDraft.clusters.map((c) => {
            if (c.id !== clusterId) return c;
            const idx = c.skills.findIndex((s) => s.id === skillId);
            if (idx < 0 || idx >= c.skills.length - 1) return c;
            const s = [...c.skills];
            [s[idx], s[idx + 1]] = [s[idx + 1], s[idx]];
            return { ...c, skills: s };
          }),
        },
      };
    }),

  updateQuest: (clusterId, skillId, questId, updates) =>
    set((state) => {
      if (!state.currentDraft) return state;
      return {
        currentDraft: {
          ...state.currentDraft,
          clusters: state.currentDraft.clusters.map((c) =>
            c.id === clusterId
              ? {
                  ...c,
                  skills: c.skills.map((s) =>
                    s.id === skillId
                      ? { ...s, quests: s.quests.map((q) => q.id === questId ? { ...q, ...updates } : q) }
                      : s,
                  ),
                }
              : c,
          ),
        },
      };
    }),

  addQuest: (clusterId, skillId) =>
    set((state) => {
      if (!state.currentDraft) return state;
      return {
        currentDraft: {
          ...state.currentDraft,
          clusters: state.currentDraft.clusters.map((c) =>
            c.id === clusterId
              ? {
                  ...c,
                  skills: c.skills.map((s) =>
                    s.id === skillId
                      ? { ...s, quests: [...s.quests, makeQuest('Nhiệm vụ mới', 'easy', 15)] }
                      : s,
                  ),
                }
              : c,
          ),
        },
      };
    }),

  removeQuest: (clusterId, skillId, questId) =>
    set((state) => {
      if (!state.currentDraft) return state;
      return {
        currentDraft: {
          ...state.currentDraft,
          clusters: state.currentDraft.clusters.map((c) =>
            c.id === clusterId
              ? {
                  ...c,
                  skills: c.skills.map((s) =>
                    s.id === skillId
                      ? { ...s, quests: s.quests.filter((q) => q.id !== questId) }
                      : s,
                  ),
                }
              : c,
          ),
        },
      };
    }),
}));
