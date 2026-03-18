import type { Branch, CustomQuest } from '../types';
import { BRANCH_KEYWORDS, makeQuest } from '../data/skill-tree-defaults';

export function detectBranch(text: string): Branch {
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

export function generateQuests(skillTitle: string, branch: Branch): CustomQuest[] {
  const t = skillTitle.toLowerCase();

  // Specific skill patterns
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

  // Generic fallback by branch
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
