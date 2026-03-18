import type { Branch, CustomGoalTree } from '../types';
import { detectBranch, generateQuests } from '../utils/skill-tree-utils';
import { makeCluster, makeSkill } from './skill-tree-defaults';

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function mockAIGenerate(goal: string): CustomGoalTree {
  const lower = goal.toLowerCase();
  let clusters = [];

  if (lower.includes('lập trình') || lower.includes('developer') || lower.includes('code') || lower.includes('fullstack')) {
    clusters = [
      makeCluster('Nền tảng kỹ thuật', 'career', 1, '⚙️', [
        makeSkill('HTML & CSS cơ bản', 'Xây dựng giao diện web với HTML/CSS', 'career', 1, generateQuests),
        makeSkill('JavaScript cốt lõi', 'Biến, hàm, vòng lặp, DOM manipulation', 'career', 1, generateQuests),
        makeSkill('Git & GitHub', 'Quản lý phiên bản và làm việc nhóm với Git', 'career', 1, generateQuests),
      ]),
      makeCluster('Frontend Development', 'career', 2, '🖥️', [
        makeSkill('React / React Native', 'Component, state, hooks, lifecycle', 'career', 2, generateQuests),
        makeSkill('Thiết kế UI/UX cơ bản', 'Nguyên tắc thiết kế, Figma cơ bản', 'career', 1, generateQuests),
        makeSkill('Responsive & CSS nâng cao', 'Flexbox, Grid, animation', 'career', 1, generateQuests),
      ]),
      makeCluster('Backend & Database', 'career', 2, '🗄️', [
        makeSkill('Node.js / Python backend', 'API RESTful, server-side logic', 'career', 2, generateQuests),
        makeSkill('Database cơ bản', 'SQL, NoSQL — queries và thiết kế schema', 'career', 1, generateQuests),
        makeSkill('Authentication & Security', 'JWT, OAuth, bảo mật cơ bản', 'career', 2, generateQuests),
      ]),
      makeCluster('Làm việc chuyên nghiệp', 'softskills', 3, '🤝', [
        makeSkill('Làm việc nhóm & Agile', 'Scrum, kanban, sprint planning', 'softskills', 1, generateQuests),
        makeSkill('Code review & Documentation', 'Viết code sạch và tài liệu rõ ràng', 'softskills', 1, generateQuests),
      ]),
    ];
  } else if (lower.includes('tiếng anh') || lower.includes('english')) {
    clusters = [
      makeCluster('Nền tảng ngôn ngữ', 'career', 1, '📚', [
        makeSkill('Ngữ pháp cơ bản', 'Thì hiện tại, quá khứ, tương lai', 'career', 1, generateQuests),
        makeSkill('Từ vựng hằng ngày', '500 từ vựng thiết yếu nhất', 'career', 1, generateQuests),
        makeSkill('Phát âm chuẩn', 'IPA, âm cuối, trọng âm từ', 'career', 1, generateQuests),
      ]),
      makeCluster('Kỹ năng nghe & nói', 'softskills', 2, '🗣️', [
        makeSkill('Nghe podcast / YouTube', 'Listen & Repeat 15 phút/ngày', 'softskills', 1, generateQuests),
        makeSkill('Nói chuyện cơ bản', 'Hội thoại hằng ngày, small talk', 'softskills', 1, generateQuests),
        makeSkill('Thuyết trình tiếng Anh', 'Trình bày ý tưởng rõ ràng bằng tiếng Anh', 'softskills', 2, generateQuests),
      ]),
      makeCluster('Kỹ năng đọc & viết', 'career', 2, '✍️', [
        makeSkill('Đọc hiểu tài liệu kỹ thuật', 'Documentation, emails, reports', 'career', 1, generateQuests),
        makeSkill('Viết email chuyên nghiệp', 'Business email, follow-up, tone', 'career', 1, generateQuests),
      ]),
      makeCluster('Thói quen hằng ngày', 'wellbeing', 1, '🌅', [
        makeSkill('Học tiếng Anh mỗi sáng', 'Duolingo hoặc Anki flashcard 10 phút', 'wellbeing', 1, generateQuests),
      ]),
    ];
  } else if (lower.includes('tài chính') || lower.includes('đầu tư') || lower.includes('tiết kiệm')) {
    clusters = [
      makeCluster('Nhận thức tài chính cá nhân', 'finance', 1, '💡', [
        makeSkill('Lập ngân sách tháng', 'Quy tắc 50/30/20 và theo dõi chi tiêu', 'finance', 1, generateQuests),
        makeSkill('Quỹ khẩn cấp', 'Xây dựng quỹ 3-6 tháng chi tiêu', 'finance', 1, generateQuests),
        makeSkill('Tư duy tài chính lành mạnh', 'Phân biệt tài sản, tiêu sản, dòng tiền', 'finance', 1, generateQuests),
      ]),
      makeCluster('Đầu tư cơ bản', 'finance', 2, '📈', [
        makeSkill('Chứng khoán cổ phiếu', 'Cách đọc biểu đồ, chọn cổ phiếu cơ bản', 'finance', 2, generateQuests),
        makeSkill('Quỹ ETF / Index Fund', 'Đầu tư thụ động dài hạn', 'finance', 1, generateQuests),
        makeSkill('Crypto an toàn', 'Bitcoin, ETH, quản lý rủi ro', 'finance', 2, generateQuests),
      ]),
      makeCluster('Tăng thu nhập', 'career', 2, '🚀', [
        makeSkill('Kỹ năng freelance', 'Tìm khách hàng, định giá dịch vụ', 'career', 2, generateQuests),
        makeSkill('Xây dựng thương hiệu cá nhân', 'LinkedIn, portfolio, mạng lưới quan hệ', 'career', 2, generateQuests),
      ]),
      makeCluster('Tâm lý tiêu dùng', 'softskills', 1, '🧠', [
        makeSkill('Kiểm soát mua sắm cảm tính', 'Nhận diện trigger, kỹ thuật 24h rule', 'softskills', 1, generateQuests),
      ]),
    ];
  } else if (lower.includes('sức khỏe') || lower.includes('gym') || lower.includes('thể dục') || lower.includes('giảm cân')) {
    clusters = [
      makeCluster('Vận động & Tập luyện', 'wellbeing', 1, '💪', [
        makeSkill('Tập gym cơ bản', 'Big 3: Squat, Bench, Deadlift', 'wellbeing', 2, generateQuests),
        makeSkill('Cardio hằng tuần', 'Chạy bộ 3 buổi/tuần 20-30 phút', 'wellbeing', 1, generateQuests),
        makeSkill('Bài tập linh hoạt', 'Stretching, foam roller, mobility', 'wellbeing', 1, generateQuests),
      ]),
      makeCluster('Dinh dưỡng', 'wellbeing', 2, '🥗', [
        makeSkill('Nguyên tắc ăn sạch', 'Protein, carb, fat cân bằng', 'wellbeing', 1, generateQuests),
        makeSkill('Theo dõi calories', 'Dùng app tracking, meal prep cơ bản', 'wellbeing', 1, generateQuests),
        makeSkill('Thói quen uống nước', '2L/ngày, uống đúng thời điểm', 'wellbeing', 1, generateQuests),
      ]),
      makeCluster('Sức khỏe tinh thần', 'wellbeing', 2, '🧘', [
        makeSkill('Thiền định cơ bản', '10 phút/ngày, mindfulness', 'wellbeing', 1, generateQuests),
        makeSkill('Giấc ngủ chất lượng', 'Sleep hygiene, 7-8 tiếng', 'wellbeing', 1, generateQuests),
      ]),
      makeCluster('Kỷ luật & Duy trì', 'softskills', 3, '🎯', [
        makeSkill('Xây dựng thói quen bền vững', 'Habit stacking, streak tracking', 'softskills', 1, generateQuests),
      ]),
    ];
  } else {
    const primaryBranch = detectBranch(goal);
    clusters = [
      makeCluster('Nền tảng kiến thức', primaryBranch, 1, '📖', [
        makeSkill(`Tổng quan về "${goal}"`, 'Nghiên cứu, đọc tài liệu, xem video nền tảng', primaryBranch, 1, generateQuests),
        makeSkill('Xác định mục tiêu cụ thể', 'SMART goals — cụ thể, đo được, có thời hạn', primaryBranch, 1, generateQuests),
        makeSkill('Tìm mentors & cộng đồng', 'Kết nối với người đã thành công trong lĩnh vực', primaryBranch, 1, generateQuests),
      ]),
      makeCluster('Thực hành & Ứng dụng', primaryBranch, 2, '⚡', [
        makeSkill('Dự án thực hành đầu tiên', 'Làm một dự án nhỏ để áp dụng kiến thức', primaryBranch, 2, generateQuests),
        makeSkill('Xây dựng thói quen học hằng ngày', '30 phút/ngày tập trung vào mục tiêu', primaryBranch, 1, generateQuests),
        makeSkill('Thu thập phản hồi', 'Nhờ người khác review, cải thiện từ feedback', primaryBranch, 1, generateQuests),
      ]),
      makeCluster('Kỹ năng hỗ trợ', 'softskills', 2, '🔧', [
        makeSkill('Quản lý thời gian hiệu quả', 'Time blocking, Pomodoro, ưu tiên đúng task', 'softskills', 1, generateQuests),
        makeSkill('Tư duy phản biện', 'Phân tích vấn đề từ nhiều góc độ', 'softskills', 2, generateQuests),
      ]),
      makeCluster('Duy trì động lực', 'wellbeing', 1, '🌟', [
        makeSkill('Celebrate small wins', 'Ghi nhận tiến bộ nhỏ, duy trì momentum', 'wellbeing', 1, generateQuests),
        makeSkill('Tránh burnout', 'Rest days, cân bằng học & nghỉ ngơi', 'wellbeing', 1, generateQuests),
      ]),
    ];
  }

  return { id: uid(), goal, created_at: new Date().toISOString(), clusters };
}
