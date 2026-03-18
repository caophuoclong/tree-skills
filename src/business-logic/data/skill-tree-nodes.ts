import type { NodeGoalEntry } from "../stores/customSkillTreeStore";
import type { CustomGoalTree, SkillNode } from "../types";

const RAW_NODES: Omit<SkillNode, "status" | "quests_completed">[] = [
  // ─── CAREER ───────────────────────────────────────────────────────────────
  {
    node_id: "career_t1_1",
    branch: "career",
    tier: 1,
    title: "Khám phá nghề nghiệp",
    description: "Hiểu rõ thế mạnh và định hướng nghề nghiệp phù hợp",
    xp_required: 50,
    quests_total: 5,
  },
  {
    node_id: "career_t1_2",
    branch: "career",
    tier: 1,
    title: "Xây dựng CV chuyên nghiệp",
    description: "Tạo hồ sơ ấn tượng thu hút nhà tuyển dụng",
    xp_required: 75,
    quests_total: 5,
  },
  {
    node_id: "career_t2_1",
    branch: "career",
    tier: 2,
    title: "Kỹ năng phỏng vấn",
    description: "Tự tin trả lời mọi câu hỏi phỏng vấn và gây ấn tượng tốt",
    xp_required: 100,
    quests_total: 6,
  },
  {
    node_id: "career_t2_2",
    branch: "career",
    tier: 2,
    title: "Networking chuyên nghiệp",
    description: "Xây dựng mạng lưới quan hệ trong ngành",
    xp_required: 120,
    quests_total: 6,
  },
  {
    node_id: "career_t2_3",
    branch: "career",
    tier: 2,
    title: "LinkedIn & Personal Brand",
    description: "Xây dựng thương hiệu cá nhân trên mạng xã hội chuyên nghiệp",
    xp_required: 100,
    quests_total: 5,
  },
  {
    node_id: "career_t3_1",
    branch: "career",
    tier: 3,
    title: "Lãnh đạo nhóm",
    description: "Phát triển kỹ năng quản lý và lãnh đạo đội nhóm hiệu quả",
    xp_required: 200,
    quests_total: 7,
  },
  {
    node_id: "career_t3_2",
    branch: "career",
    tier: 3,
    title: "Chiến lược sự nghiệp dài hạn",
    description: "Lập kế hoạch 5 năm và định hướng phát triển bền vững",
    xp_required: 250,
    quests_total: 7,
  },
  {
    node_id: "career_t3_3",
    branch: "career",
    tier: 3,
    title: "Kỹ năng đàm phán lương",
    description: "Tối đa hóa thu nhập và phúc lợi trong đàm phán",
    xp_required: 200,
    quests_total: 6,
  },

  // ─── FINANCE ─────────────────────────────────────────────────────────────
  {
    node_id: "finance_t1_1",
    branch: "finance",
    tier: 1,
    title: "Ngân sách cá nhân",
    description: "Lập và tuân thủ ngân sách hàng tháng hiệu quả",
    xp_required: 50,
    quests_total: 5,
  },
  {
    node_id: "finance_t1_2",
    branch: "finance",
    tier: 1,
    title: "Quỹ khẩn cấp",
    description: "Xây dựng quỹ dự phòng tài chính 3–6 tháng chi phí",
    xp_required: 75,
    quests_total: 5,
  },
  {
    node_id: "finance_t2_1",
    branch: "finance",
    tier: 2,
    title: "Đầu tư cơ bản",
    description: "Hiểu chứng khoán, quỹ ETF và bắt đầu đầu tư nhỏ",
    xp_required: 120,
    quests_total: 6,
  },
  {
    node_id: "finance_t2_2",
    branch: "finance",
    tier: 2,
    title: "Trả nợ thông minh",
    description: "Chiến lược trả hết nợ nhanh nhất và tiết kiệm lãi suất",
    xp_required: 100,
    quests_total: 5,
  },
  {
    node_id: "finance_t3_1",
    branch: "finance",
    tier: 3,
    title: "Đầu tư nâng cao",
    description: "Xây dựng danh mục đầu tư đa dạng và dòng thu nhập thụ động",
    xp_required: 200,
    quests_total: 7,
  },
  {
    node_id: "finance_t3_2",
    branch: "finance",
    tier: 3,
    title: "Tự do tài chính",
    description: "Lập kế hoạch FIRE và đạt được độc lập tài chính",
    xp_required: 250,
    quests_total: 8,
  },
  {
    node_id: "finance_t3_3",
    branch: "finance",
    tier: 3,
    title: "Kinh doanh & Thu nhập phụ",
    description: "Tạo nguồn thu nhập bổ sung thông qua kinh doanh nhỏ",
    xp_required: 200,
    quests_total: 7,
  },

  // ─── SOFT SKILLS ─────────────────────────────────────────────────────────
  {
    node_id: "softskills_t1_1",
    branch: "softskills",
    tier: 1,
    title: "Giao tiếp hiệu quả",
    description:
      "Truyền đạt ý kiến rõ ràng, súc tích trong công việc và cuộc sống",
    xp_required: 50,
    quests_total: 5,
  },
  {
    node_id: "softskills_t1_2",
    branch: "softskills",
    tier: 1,
    title: "Lắng nghe chủ động",
    description: "Phát triển khả năng lắng nghe sâu và thấu hiểu người khác",
    xp_required: 60,
    quests_total: 5,
  },
  {
    node_id: "softskills_t2_1",
    branch: "softskills",
    tier: 2,
    title: "Thuyết trình & Public Speaking",
    description: "Tự tin nói trước đám đông và thuyết phục người nghe",
    xp_required: 120,
    quests_total: 6,
  },
  {
    node_id: "softskills_t2_2",
    branch: "softskills",
    tier: 2,
    title: "Trí tuệ cảm xúc (EQ)",
    description:
      "Nhận biết và điều tiết cảm xúc trong các tình huống căng thẳng",
    xp_required: 100,
    quests_total: 6,
  },
  {
    node_id: "softskills_t2_3",
    branch: "softskills",
    tier: 2,
    title: "Giải quyết xung đột",
    description: "Xử lý mâu thuẫn một cách xây dựng và chuyên nghiệp",
    xp_required: 110,
    quests_total: 5,
  },
  {
    node_id: "softskills_t3_1",
    branch: "softskills",
    tier: 3,
    title: "Kỹ năng đàm phán",
    description: "Thương lượng để đạt kết quả win-win trong mọi tình huống",
    xp_required: 200,
    quests_total: 7,
  },
  {
    node_id: "softskills_t3_2",
    branch: "softskills",
    tier: 3,
    title: "Xây dựng quan hệ tin cậy",
    description: "Tạo và duy trì mối quan hệ bền vững, chân thành",
    xp_required: 180,
    quests_total: 6,
  },

  // ─── WELLBEING ───────────────────────────────────────────────────────────
  {
    node_id: "wellbeing_t1_1",
    branch: "wellbeing",
    tier: 1,
    title: "Giấc ngủ chất lượng",
    description: "Thiết lập thói quen ngủ đủ giấc và phục hồi năng lượng",
    xp_required: 40,
    quests_total: 5,
  },
  {
    node_id: "wellbeing_t1_2",
    branch: "wellbeing",
    tier: 1,
    title: "Vận động mỗi ngày",
    description: "Duy trì thói quen tập thể dục đơn giản nhưng đều đặn",
    xp_required: 50,
    quests_total: 5,
  },
  {
    node_id: "wellbeing_t2_1",
    branch: "wellbeing",
    tier: 2,
    title: "Quản lý stress",
    description: "Nhận diện và giảm thiểu các tác nhân gây căng thẳng",
    xp_required: 100,
    quests_total: 6,
  },
  {
    node_id: "wellbeing_t2_2",
    branch: "wellbeing",
    tier: 2,
    title: "Mindfulness & Thiền định",
    description:
      "Thực hành chánh niệm để cải thiện tập trung và bình an nội tâm",
    xp_required: 120,
    quests_total: 6,
  },
  {
    node_id: "wellbeing_t3_1",
    branch: "wellbeing",
    tier: 3,
    title: "Phục hồi cảm xúc (Resilience)",
    description: "Phát triển sức bền tâm lý và khả năng phục hồi sau thất bại",
    xp_required: 200,
    quests_total: 7,
  },
  {
    node_id: "wellbeing_t3_2",
    branch: "wellbeing",
    tier: 3,
    title: "Sống trọn vẹn & Tự thương",
    description: "Thực hành tự yêu thương và sống có ý nghĩa mỗi ngày",
    xp_required: 200,
    quests_total: 6,
  },

  // ─── DEMO: Custom goal — "Học Fullstack Developer" (career + softskills) ─────
  {
    node_id: "custom_demo_html_css",
    branch: "career",
    tier: 1,
    title: "HTML & CSS cơ bản",
    description: "Xây dựng giao diện web với HTML/CSS",
    xp_required: 50,
    quests_total: 3,
  },
  {
    node_id: "custom_demo_js_core",
    branch: "career",
    tier: 1,
    title: "JavaScript cốt lõi",
    description: "Biến, hàm, vòng lặp, DOM manipulation",
    xp_required: 50,
    quests_total: 3,
  },
  {
    node_id: "custom_demo_git",
    branch: "career",
    tier: 1,
    title: "Git & GitHub",
    description: "Quản lý phiên bản và làm việc nhóm với Git",
    xp_required: 50,
    quests_total: 3,
  },
  {
    node_id: "custom_demo_react",
    branch: "career",
    tier: 2,
    title: "React / React Native",
    description: "Component, state, hooks, lifecycle",
    xp_required: 100,
    quests_total: 3,
  },
  {
    node_id: "custom_demo_backend",
    branch: "career",
    tier: 2,
    title: "Node.js backend",
    description: "API RESTful, server-side logic",
    xp_required: 100,
    quests_total: 3,
  },
  {
    node_id: "custom_demo_teamwork",
    branch: "softskills",
    tier: 2,
    title: "Làm việc nhóm & Agile",
    description: "Scrum, kanban, sprint planning",
    xp_required: 75,
    quests_total: 3,
  },
  {
    node_id: "custom_demo_code_review",
    branch: "softskills",
    tier: 2,
    title: "Code review & Docs",
    description: "Viết code sạch và tài liệu rõ ràng",
    xp_required: 75,
    quests_total: 3,
  },

  // ─── DEMO: Custom goal — "Nâng cấp sức khỏe toàn diện" (wellbeing + softskills) ─
  {
    node_id: "custom_demo_gym",
    branch: "wellbeing",
    tier: 1,
    title: "Tập gym cơ bản",
    description: "Big 3: Squat, Bench, Deadlift",
    xp_required: 50,
    quests_total: 3,
  },
  {
    node_id: "custom_demo_sleep",
    branch: "wellbeing",
    tier: 1,
    title: "Giấc ngủ chất lượng",
    description: "Sleep hygiene, 7-8 tiếng mỗi đêm",
    xp_required: 40,
    quests_total: 3,
  },
  {
    node_id: "custom_demo_nutrition",
    branch: "wellbeing",
    tier: 2,
    title: "Dinh dưỡng cân bằng",
    description: "Protein, carb, fat đúng tỉ lệ",
    xp_required: 75,
    quests_total: 3,
  },
  {
    node_id: "custom_demo_habit",
    branch: "softskills",
    tier: 2,
    title: "Xây dựng thói quen bền vững",
    description: "Habit stacking, streak tracking",
    xp_required: 75,
    quests_total: 3,
  },
];

export function getInitialNodes(activeBranch?: string): SkillNode[] {
  return RAW_NODES.map((node) => {
    const isActiveBranch = !activeBranch || node.branch === activeBranch;
    const isTier1 = node.tier === 1;
    return {
      ...node,
      status: isActiveBranch && isTier1 ? "in_progress" : "locked",
      quests_completed: 0,
    } as SkillNode;
  });
}

// ─── Demo progress nodes for realistic UI display ─────────────────────────────
// career 6/8 ≈ 75%, finance 4/7 ≈ 57%, softskills 6/7 ≈ 86%, wellbeing 2/6 ≈ 33%

const DEMO_STATUSES: Record<string, SkillNode["status"]> = {
  // Career
  career_t1_1: "completed",
  career_t1_2: "completed",
  career_t2_1: "completed",
  career_t2_2: "completed",
  career_t2_3: "completed",
  career_t3_1: "in_progress",
  career_t3_2: "locked",
  career_t3_3: "locked",
  // Finance
  finance_t1_1: "completed",
  finance_t1_2: "completed",
  finance_t2_1: "completed",
  finance_t2_2: "completed",
  finance_t3_1: "in_progress",
  finance_t3_2: "locked",
  finance_t3_3: "locked",
  // Soft Skills
  softskills_t1_1: "completed",
  softskills_t1_2: "completed",
  softskills_t2_1: "completed",
  softskills_t2_2: "completed",
  softskills_t2_3: "completed",
  softskills_t3_1: "completed",
  softskills_t3_2: "in_progress",
  // Wellbeing
  wellbeing_t1_1: "completed",
  wellbeing_t1_2: "completed",
  wellbeing_t2_1: "in_progress",
  wellbeing_t2_2: "locked",
  wellbeing_t3_1: "locked",
  wellbeing_t3_2: "locked",
  // Custom goal 1: Học Fullstack Developer (career + softskills)
  custom_demo_html_css: "completed",
  custom_demo_js_core: "completed",
  custom_demo_git: "completed",
  custom_demo_react: "completed",
  custom_demo_backend: "completed",
  custom_demo_teamwork: "completed",
  custom_demo_code_review: "completed",
  // Custom goal 2: Nâng cấp sức khỏe toàn diện (wellbeing + softskills)
  custom_demo_gym: "in_progress",
  custom_demo_sleep: "completed",
  custom_demo_nutrition: "locked",
  custom_demo_habit: "locked",
};

export function getDemoNodes(): SkillNode[] {
  return RAW_NODES.map((node) => {
    const status = DEMO_STATUSES[node.node_id] ?? "locked";
    return {
      ...node,
      status,
      quests_completed:
        status === "completed"
          ? node.quests_total
          : status === "in_progress"
            ? Math.floor(node.quests_total / 2)
            : 0,
    } as SkillNode;
  });
}

export function getNodesByBranch(
  nodes: SkillNode[],
  branch: string,
): SkillNode[] {
  return nodes
    .filter((n) => n.branch === branch)
    .sort((a, b) => a.tier - b.tier);
}

export const SKILL_TREE_NODES = getInitialNodes();

// ─── Demo custom goal trees ───────────────────────────────────────────────────
// Pre-built data so the goal filter pills are visible without having to run
// through the AI builder flow first.

export function getDemoCustomData(): {
  trees: CustomGoalTree[];
  nodeGoalMap: Record<string, NodeGoalEntry>;
} {
  const trees: CustomGoalTree[] = [
    {
      id: "demo_goal_fullstack",
      goal: "Học Fullstack Developer",
      created_at: "2026-01-10T07:00:00.000Z",
      clusters: [
        {
          id: "demo_cl_foundation",
          title: "Nền tảng kỹ thuật",
          branch: "career",
          tier: 1,
          emoji: "⚙️",
          skills: [
            {
              id: "demo_html_css",
              title: "HTML & CSS cơ bản",
              description: "Xây dựng giao diện web",
              branch: "career",
              duration_weeks: 1,
              quests: [],
              status: "completed",
            },
            {
              id: "demo_js_core",
              title: "JavaScript cốt lõi",
              description: "Biến, hàm, DOM",
              branch: "career",
              duration_weeks: 1,
              quests: [],
              status: "in_progress",
            },
            {
              id: "demo_git",
              title: "Git & GitHub",
              description: "Version control",
              branch: "career",
              duration_weeks: 1,
              quests: [],
              status: "in_progress",
            },
          ],
        },
        {
          id: "demo_cl_frontend",
          title: "Frontend Development",
          branch: "career",
          tier: 2,
          emoji: "🖥️",
          skills: [
            {
              id: "demo_react",
              title: "React / React Native",
              description: "Component, hooks",
              branch: "career",
              duration_weeks: 2,
              quests: [],
              status: "locked",
            },
            {
              id: "demo_backend",
              title: "Node.js backend",
              description: "API RESTful",
              branch: "career",
              duration_weeks: 2,
              quests: [],
              status: "locked",
            },
          ],
        },
        {
          id: "demo_cl_professional",
          title: "Làm việc chuyên nghiệp",
          branch: "softskills",
          tier: 2,
          emoji: "🤝",
          skills: [
            {
              id: "demo_teamwork",
              title: "Làm việc nhóm & Agile",
              description: "Scrum, kanban",
              branch: "softskills",
              duration_weeks: 1,
              quests: [],
              status: "locked",
            },
            {
              id: "demo_code_review",
              title: "Code review & Docs",
              description: "Clean code",
              branch: "softskills",
              duration_weeks: 1,
              quests: [],
              status: "locked",
            },
          ],
        },
      ],
    },
    {
      id: "demo_goal_health",
      goal: "Nâng cấp sức khỏe toàn diện",
      created_at: "2026-02-01T07:00:00.000Z",
      clusters: [
        {
          id: "demo_cl_exercise",
          title: "Vận động & Tập luyện",
          branch: "wellbeing",
          tier: 1,
          emoji: "💪",
          skills: [
            {
              id: "demo_gym",
              title: "Tập gym cơ bản",
              description: "Big 3 compound lifts",
              branch: "wellbeing",
              duration_weeks: 2,
              quests: [],
              status: "in_progress",
            },
            {
              id: "demo_sleep",
              title: "Giấc ngủ chất lượng",
              description: "Sleep hygiene 7-8h",
              branch: "wellbeing",
              duration_weeks: 1,
              quests: [],
              status: "completed",
            },
          ],
        },
        {
          id: "demo_cl_nutrition",
          title: "Dinh dưỡng & Thói quen",
          branch: "wellbeing",
          tier: 2,
          emoji: "🥗",
          skills: [
            {
              id: "demo_nutrition",
              title: "Dinh dưỡng cân bằng",
              description: "Macro tracking",
              branch: "wellbeing",
              duration_weeks: 1,
              quests: [],
              status: "locked",
            },
            {
              id: "demo_habit",
              title: "Xây dựng thói quen bền vững",
              description: "Habit stacking",
              branch: "softskills",
              duration_weeks: 1,
              quests: [],
              status: "locked",
            },
          ],
        },
      ],
    },
  ];

  // Build nodeGoalMap: custom_{skill.id} → { goalId, goalTitle }
  const nodeGoalMap: Record<string, NodeGoalEntry> = {};
  for (const tree of trees) {
    for (const cluster of tree.clusters) {
      for (const skill of cluster.skills) {
        nodeGoalMap[`custom_${skill.id}`] = {
          goalId: tree.id,
          goalTitle: tree.goal,
        };
      }
    }
  }

  return { trees, nodeGoalMap };
}
