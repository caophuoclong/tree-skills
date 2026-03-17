import type { Branch } from '../types';

export interface AssessmentOption {
  id: string;
  text: string;
  branch: Branch;
}

export interface AssessmentQuestion {
  id: number;
  question: string;
  options: AssessmentOption[];
}

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 1,
    question: 'Điều bạn muốn cải thiện nhất trong cuộc sống hiện tại là gì?',
    options: [
      { id: '1a', text: 'Thăng tiến trong sự nghiệp và tìm công việc tốt hơn', branch: 'career' },
      { id: '1b', text: 'Quản lý tài chính và tiết kiệm nhiều hơn', branch: 'finance' },
      { id: '1c', text: 'Giao tiếp tốt hơn và xây dựng mối quan hệ', branch: 'softskills' },
      { id: '1d', text: 'Cân bằng cảm xúc và giảm stress trong cuộc sống', branch: 'wellbeing' },
    ],
  },
  {
    id: 2,
    question: 'Vào cuối ngày làm việc, điều gì thường khiến bạn cảm thấy chưa hài lòng?',
    options: [
      { id: '2a', text: 'Chưa hoàn thành đủ công việc quan trọng', branch: 'career' },
      { id: '2b', text: 'Đã tiêu quá nhiều tiền không cần thiết', branch: 'finance' },
      { id: '2c', text: 'Chưa nói chuyện đủ rõ ràng với đồng nghiệp hoặc bạn bè', branch: 'softskills' },
      { id: '2d', text: 'Cảm thấy mệt mỏi và kiệt sức về tinh thần', branch: 'wellbeing' },
    ],
  },
  {
    id: 3,
    question: 'Nếu có 30 phút rảnh mỗi ngày, bạn muốn dùng để làm gì?',
    options: [
      { id: '3a', text: 'Học thêm kỹ năng chuyên môn hoặc đọc sách nghề nghiệp', branch: 'career' },
      { id: '3b', text: 'Nghiên cứu đầu tư và lập kế hoạch tài chính', branch: 'finance' },
      { id: '3c', text: 'Tham gia cộng đồng hoặc kết nối với người mới', branch: 'softskills' },
      { id: '3d', text: 'Thiền định, tập yoga hoặc đi dạo thư giãn', branch: 'wellbeing' },
    ],
  },
  {
    id: 4,
    question: 'Bạn đang đối mặt với thách thức nào lớn nhất?',
    options: [
      { id: '4a', text: 'Không biết định hướng nghề nghiệp rõ ràng', branch: 'career' },
      { id: '4b', text: 'Không kiểm soát được chi tiêu và nợ nần', branch: 'finance' },
      { id: '4c', text: 'Khó khăn trong việc trình bày ý kiến trước đám đông', branch: 'softskills' },
      { id: '4d', text: 'Hay lo lắng, mất ngủ và thiếu năng lượng', branch: 'wellbeing' },
    ],
  },
  {
    id: 5,
    question: 'Thành tựu nào sẽ khiến bạn tự hào nhất sau 1 năm nữa?',
    options: [
      { id: '5a', text: 'Được thăng chức hoặc chuyển sang công việc mơ ước', branch: 'career' },
      { id: '5b', text: 'Tiết kiệm được số tiền đủ cho quỹ khẩn cấp 6 tháng', branch: 'finance' },
      { id: '5c', text: 'Tự tin thuyết trình trước 100 người', branch: 'softskills' },
      { id: '5d', text: 'Duy trì thói quen sống lành mạnh và hạnh phúc mỗi ngày', branch: 'wellbeing' },
    ],
  },
  {
    id: 6,
    question: 'Điều gì cản trở bạn nhiều nhất hiện nay?',
    options: [
      { id: '6a', text: 'Thiếu kinh nghiệm và bằng cấp cần thiết', branch: 'career' },
      { id: '6b', text: 'Không biết cách đầu tư và tăng thu nhập thụ động', branch: 'finance' },
      { id: '6c', text: 'Ngại ngùng, thiếu tự tin khi giao tiếp xã hội', branch: 'softskills' },
      { id: '6d', text: 'Sức khoẻ tinh thần không ổn định và hay burnout', branch: 'wellbeing' },
    ],
  },
  {
    id: 7,
    question: 'Bạn học tốt nhất theo cách nào?',
    options: [
      { id: '7a', text: 'Thực hành dự án thực tế và xây dựng portfolio', branch: 'career' },
      { id: '7b', text: 'Phân tích số liệu và theo dõi kết quả tài chính', branch: 'finance' },
      { id: '7c', text: 'Tham gia hội thảo và luyện tập cùng người khác', branch: 'softskills' },
      { id: '7d', text: 'Thực hành mindfulness và tự quan sát cảm xúc', branch: 'wellbeing' },
    ],
  },
  {
    id: 8,
    question: 'Bạn nghĩ phần nào của bản thân cần được "nâng cấp" ngay?',
    options: [
      { id: '8a', text: 'Kỹ năng kỹ thuật và chuyên môn trong lĩnh vực', branch: 'career' },
      { id: '8b', text: 'Tư duy về tiền bạc và thói quen tài chính', branch: 'finance' },
      { id: '8c', text: 'Khả năng lắng nghe và đồng cảm với người khác', branch: 'softskills' },
      { id: '8d', text: 'Khả năng phục hồi cảm xúc khi gặp khó khăn', branch: 'wellbeing' },
    ],
  },
  {
    id: 9,
    question: 'Bạn muốn được nhớ đến nhờ điều gì trong 5 năm tới?',
    options: [
      { id: '9a', text: 'Là người chuyên nghiệp và giỏi trong lĩnh vực của mình', branch: 'career' },
      { id: '9b', text: 'Là người tự chủ tài chính và thông minh trong đầu tư', branch: 'finance' },
      { id: '9c', text: 'Là người có khả năng kết nối và truyền cảm hứng cho mọi người', branch: 'softskills' },
      { id: '9d', text: 'Là người cân bằng, bình an và sống trọn vẹn từng ngày', branch: 'wellbeing' },
    ],
  },
  {
    id: 10,
    question: 'Khi gặp khó khăn, bạn thường phản ứng như thế nào?',
    options: [
      { id: '10a', text: 'Tìm kiếm mentor hoặc học thêm để giải quyết vấn đề', branch: 'career' },
      { id: '10b', text: 'Xem xét lại ngân sách và tìm cách cắt giảm chi phí', branch: 'finance' },
      { id: '10c', text: 'Nhờ bạn bè tư vấn và tìm kiếm sự hỗ trợ từ cộng đồng', branch: 'softskills' },
      { id: '10d', text: 'Dừng lại, hít thở sâu và cho bản thân thời gian phục hồi', branch: 'wellbeing' },
    ],
  },
];

export function calculateBranchWeights(answers: { question_id: number; selected_branch: string }[]): Record<string, number> {
  const weights: Record<string, number> = {
    career: 0,
    finance: 0,
    softskills: 0,
    wellbeing: 0,
  };
  for (const answer of answers) {
    if (answer.selected_branch in weights) {
      weights[answer.selected_branch]++;
    }
  }
  return weights;
}

export function getPrimaryBranch(weights: Record<string, number>): Branch {
  const entries = Object.entries(weights) as [Branch, number][];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}
