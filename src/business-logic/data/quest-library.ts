import type { Quest, Branch, Difficulty } from '../types';

type QuestTemplate = Omit<Quest, 'quest_id' | 'completed_at'>;

const CAREER_QUESTS: QuestTemplate[] = [
  // Easy – 10 XP – 5 min
  {
    title: 'Viết 3 điểm mạnh của bản thân',
    description: 'Liệt kê 3 kỹ năng hoặc phẩm chất nổi bật nhất mà bạn tự hào.',
    branch: 'career',
    difficulty: 'easy',
    duration_min: 5,
    xp_reward: 10,
  },
  {
    title: 'Cập nhật tiêu đề LinkedIn',
    description: 'Chỉnh sửa tiêu đề hồ sơ LinkedIn để phản ánh đúng vai trò và giá trị của bạn.',
    branch: 'career',
    difficulty: 'easy',
    duration_min: 5,
    xp_reward: 10,
  },
  {
    title: 'Đọc 1 bài viết nghề nghiệp',
    description: 'Đọc một bài viết liên quan đến ngành của bạn và ghi lại 1 điều học được.',
    branch: 'career',
    difficulty: 'easy',
    duration_min: 5,
    xp_reward: 10,
  },
  {
    title: 'Xem lại mô tả công việc mơ ước',
    description: 'Tìm 1 vị trí công việc bạn muốn và gạch chân những yêu cầu bạn chưa đáp ứng.',
    branch: 'career',
    difficulty: 'easy',
    duration_min: 5,
    xp_reward: 10,
  },
  {
    title: 'Ghi mục tiêu nghề nghiệp tuần này',
    description: 'Viết ra 1 mục tiêu cụ thể, đo lường được cho tuần này liên quan đến sự nghiệp.',
    branch: 'career',
    difficulty: 'easy',
    duration_min: 5,
    xp_reward: 10,
  },
  {
    title: 'Nghiên cứu công ty muốn ứng tuyển',
    description: 'Dành 5 phút tìm hiểu văn hóa và sản phẩm của một công ty bạn quan tâm.',
    branch: 'career',
    difficulty: 'easy',
    duration_min: 5,
    xp_reward: 10,
  },
  // Medium – 25 XP – 15 min
  {
    title: 'Hoàn thiện 1 mục trong CV',
    description: 'Cập nhật phần kinh nghiệm hoặc kỹ năng trong CV với thành tích cụ thể và con số.',
    branch: 'career',
    difficulty: 'medium',
    duration_min: 15,
    xp_reward: 25,
  },
  {
    title: 'Luyện tập trả lời câu hỏi "Hãy kể về bản thân"',
    description: 'Tập nói và ghi âm phần giới thiệu bản thân trong 2 phút, sau đó nghe lại và cải thiện.',
    branch: 'career',
    difficulty: 'medium',
    duration_min: 15,
    xp_reward: 25,
  },
  {
    title: 'Viết email xin tư vấn nghề nghiệp',
    description: 'Soạn một email ngắn gọn, chuyên nghiệp gửi đến một mentor hoặc người trong ngành để xin lời khuyên.',
    branch: 'career',
    difficulty: 'medium',
    duration_min: 15,
    xp_reward: 25,
  },
  {
    title: 'Nghiên cứu xu hướng ngành',
    description: 'Đọc ít nhất 2 bài về xu hướng trong ngành của bạn và tóm tắt lại thành ghi chú.',
    branch: 'career',
    difficulty: 'medium',
    duration_min: 15,
    xp_reward: 25,
  },
  {
    title: 'Phân tích khoảng cách kỹ năng',
    description: 'So sánh kỹ năng bạn đang có với yêu cầu của vị trí mơ ước và liệt kê những gì cần học.',
    branch: 'career',
    difficulty: 'medium',
    duration_min: 15,
    xp_reward: 25,
  },
  {
    title: 'Xây dựng danh sách 10 công ty mục tiêu',
    description: 'Nghiên cứu và tạo danh sách 10 công ty phù hợp với định hướng nghề nghiệp của bạn.',
    branch: 'career',
    difficulty: 'medium',
    duration_min: 15,
    xp_reward: 25,
  },
  // Hard – 50 XP – 30 min
  {
    title: 'Thực hành phỏng vấn mock',
    description: 'Nhờ bạn bè hoặc dùng AI để luyện tập phỏng vấn với ít nhất 5 câu hỏi khó.',
    branch: 'career',
    difficulty: 'hard',
    duration_min: 30,
    xp_reward: 50,
  },
  {
    title: 'Hoàn thiện hồ sơ LinkedIn đầy đủ',
    description: 'Điền đầy đủ tất cả các phần trong LinkedIn: About, Experience, Skills, Education và thêm ít nhất 1 recommendation.',
    branch: 'career',
    difficulty: 'hard',
    duration_min: 30,
    xp_reward: 50,
  },
  {
    title: 'Lập kế hoạch sự nghiệp 12 tháng',
    description: 'Viết kế hoạch chi tiết với các mốc quan trọng theo từng quý trong 1 năm tới.',
    branch: 'career',
    difficulty: 'hard',
    duration_min: 30,
    xp_reward: 50,
  },
  {
    title: 'Tham gia sự kiện networking online',
    description: 'Tham dự một buổi webinar hoặc meetup trong ngành và kết nối với ít nhất 2 người mới.',
    branch: 'career',
    difficulty: 'hard',
    duration_min: 30,
    xp_reward: 50,
  },
];

const FINANCE_QUESTS: QuestTemplate[] = [
  // Easy – 5 min
  {
    title: 'Ghi lại chi tiêu hôm nay',
    description: 'Liệt kê tất cả các khoản chi tiêu trong ngày hôm nay, dù nhỏ đến đâu.',
    branch: 'finance',
    difficulty: 'easy',
    duration_min: 5,
    xp_reward: 10,
  },
  {
    title: 'Xem số dư tài khoản',
    description: 'Kiểm tra số dư tất cả các tài khoản ngân hàng và ví điện tử của bạn.',
    branch: 'finance',
    difficulty: 'easy',
    duration_min: 5,
    xp_reward: 10,
  },
  {
    title: 'Xác định 1 khoản chi không cần thiết',
    description: 'Tìm một khoản chi tiêu tuần này có thể cắt giảm hoặc loại bỏ hoàn toàn.',
    branch: 'finance',
    difficulty: 'easy',
    duration_min: 5,
    xp_reward: 10,
  },
  {
    title: 'Đặt mục tiêu tiết kiệm tuần này',
    description: 'Quyết định một con số tiết kiệm cụ thể cho 7 ngày tới và viết ra.',
    branch: 'finance',
    difficulty: 'easy',
    duration_min: 5,
    xp_reward: 10,
  },
  {
    title: 'Đọc 1 mẹo tài chính cá nhân',
    description: 'Tìm và đọc một bài viết về tài chính cá nhân, ghi lại điểm áp dụng được ngay.',
    branch: 'finance',
    difficulty: 'easy',
    duration_min: 5,
    xp_reward: 10,
  },
  {
    title: 'Kiểm tra hóa đơn đăng ký dịch vụ',
    description: 'Xem lại danh sách subscription đang trả tiền và xác định cái nào không còn dùng.',
    branch: 'finance',
    difficulty: 'easy',
    duration_min: 5,
    xp_reward: 10,
  },
  // Medium – 15 min
  {
    title: 'Lập ngân sách tháng theo quy tắc 50/30/20',
    description: 'Phân bổ thu nhập theo: 50% nhu cầu thiết yếu, 30% mong muốn, 20% tiết kiệm/đầu tư.',
    branch: 'finance',
    difficulty: 'medium',
    duration_min: 15,
    xp_reward: 25,
  },
  {
    title: 'Phân tích chi tiêu 30 ngày qua',
    description: 'Xem lịch sử giao dịch, phân loại chi tiêu và tìm danh mục nào vượt ngân sách.',
    branch: 'finance',
    difficulty: 'medium',
    duration_min: 15,
    xp_reward: 25,
  },
  {
    title: 'Nghiên cứu tài khoản tiết kiệm lãi suất cao',
    description: 'So sánh lãi suất của 3 ngân hàng và xác định nên mở tài khoản tiết kiệm ở đâu.',
    branch: 'finance',
    difficulty: 'medium',
    duration_min: 15,
    xp_reward: 25,
  },
  {
    title: 'Tính toán quỹ khẩn cấp cần thiết',
    description: 'Tính chi phí sinh hoạt tháng × 6 và xem bạn còn thiếu bao nhiêu để đủ quỹ khẩn cấp.',
    branch: 'finance',
    difficulty: 'medium',
    duration_min: 15,
    xp_reward: 25,
  },
  {
    title: 'Học về chứng khoán cơ bản',
    description: 'Đọc phần giải thích về cổ phiếu, ETF và trái phiếu; ghi tóm tắt sự khác biệt.',
    branch: 'finance',
    difficulty: 'medium',
    duration_min: 15,
    xp_reward: 25,
  },
  {
    title: 'Lên kế hoạch trả nợ ưu tiên',
    description: 'Liệt kê tất cả các khoản nợ, sắp xếp theo lãi suất cao nhất và lên lịch trả.',
    branch: 'finance',
    difficulty: 'medium',
    duration_min: 15,
    xp_reward: 25,
  },
  // Hard – 30 min
  {
    title: 'Lập bảng tài sản & nợ cá nhân',
    description: 'Tạo bảng balance sheet cá nhân: liệt kê tất cả tài sản, khoản nợ và tính net worth.',
    branch: 'finance',
    difficulty: 'hard',
    duration_min: 30,
    xp_reward: 50,
  },
  {
    title: 'Mô phỏng danh mục đầu tư đầu tiên',
    description: 'Dùng tài khoản paper trading hoặc mô phỏng để tạo danh mục đầu tư 10 triệu đồng.',
    branch: 'finance',
    difficulty: 'hard',
    duration_min: 30,
    xp_reward: 50,
  },
  {
    title: 'Tạo kế hoạch tài chính 1 năm',
    description: 'Viết kế hoạch tài chính chi tiết gồm mục tiêu tiết kiệm, đầu tư và trả nợ từng quý.',
    branch: 'finance',
    difficulty: 'hard',
    duration_min: 30,
    xp_reward: 50,
  },
  {
    title: 'Phân tích và tối ưu hóa chi tiêu lớn',
    description: 'Tìm 3 khoản chi tiêu lớn nhất tháng, nghiên cứu phương án tiết kiệm cho mỗi khoản.',
    branch: 'finance',
    difficulty: 'hard',
    duration_min: 30,
    xp_reward: 50,
  },
];

const SOFTSKILLS_QUESTS: QuestTemplate[] = [
  // Easy – 5 min
  {
    title: 'Lắng nghe mà không ngắt lời',
    description: 'Trong 1 cuộc trò chuyện hôm nay, hãy lắng nghe hoàn toàn mà không ngắt lời đối phương.',
    branch: 'softskills',
    difficulty: 'easy',
    duration_min: 5,
    xp_reward: 10,
  },
  {
    title: 'Gửi tin nhắn tích cực cho 1 người',
    description: 'Nhắn tin cho một người bạn hoặc đồng nghiệp với lời động viên hoặc cảm ơn chân thành.',
    branch: 'softskills',
    difficulty: 'easy',
    duration_min: 5,
    xp_reward: 10,
  },
  {
    title: 'Viết nhật ký cảm xúc 3 phút',
    description: 'Ghi lại cảm xúc hiện tại và nguyên nhân gây ra nó trong 3 phút.',
    branch: 'softskills',
    difficulty: 'easy',
    duration_min: 5,
    xp_reward: 10,
  },
  {
    title: 'Thực hành giao tiếp bằng mắt',
    description: 'Trong cuộc trò chuyện tiếp theo, chú ý duy trì giao tiếp bằng mắt tự nhiên với đối phương.',
    branch: 'softskills',
    difficulty: 'easy',
    duration_min: 5,
    xp_reward: 10,
  },
  {
    title: 'Đặt 3 câu hỏi mở trong cuộc trò chuyện',
    description: 'Tập đặt câu hỏi bắt đầu bằng "Tại sao", "Như thế nào", "Bạn nghĩ gì về..." thay vì câu hỏi có/không.',
    branch: 'softskills',
    difficulty: 'easy',
    duration_min: 5,
    xp_reward: 10,
  },
  {
    title: 'Nhận phản hồi từ 1 người',
    description: 'Chủ động hỏi một người đáng tin cậy về một điểm bạn có thể cải thiện trong cách giao tiếp.',
    branch: 'softskills',
    difficulty: 'easy',
    duration_min: 5,
    xp_reward: 10,
  },
  // Medium – 15 min
  {
    title: 'Luyện tập kỹ thuật "sandwich feedback"',
    description: 'Viết ví dụ cho phản hồi theo cấu trúc: Tích cực – Cải thiện – Tích cực khi đánh giá một tình huống.',
    branch: 'softskills',
    difficulty: 'medium',
    duration_min: 15,
    xp_reward: 25,
  },
  {
    title: 'Xem video kỹ năng thuyết trình',
    description: 'Xem 1 TED Talk ngắn (10-15 phút), chú ý 3 kỹ thuật thuyết trình và ghi chú lại.',
    branch: 'softskills',
    difficulty: 'medium',
    duration_min: 15,
    xp_reward: 25,
  },
  {
    title: 'Luyện tập ngôn ngữ cơ thể tích cực',
    description: 'Đứng trước gương 15 phút, luyện tập tư thế mở, giao tiếp bằng mắt và nụ cười tự tin.',
    branch: 'softskills',
    difficulty: 'medium',
    duration_min: 15,
    xp_reward: 25,
  },
  {
    title: 'Phân tích tình huống xung đột',
    description: 'Nhớ lại 1 tình huống bất đồng gần đây, phân tích từ góc độ của cả hai bên và tìm giải pháp tốt hơn.',
    branch: 'softskills',
    difficulty: 'medium',
    duration_min: 15,
    xp_reward: 25,
  },
  {
    title: 'Viết email chuyên nghiệp',
    description: 'Soạn và gửi một email quan trọng với cấu trúc rõ ràng, tôn trọng và đúng ngữ cảnh.',
    branch: 'softskills',
    difficulty: 'medium',
    duration_min: 15,
    xp_reward: 25,
  },
  {
    title: 'Nghiên cứu về trí tuệ cảm xúc',
    description: 'Đọc về 4 trụ cột của EQ (tự nhận thức, tự điều tiết, đồng cảm, kỹ năng xã hội) và ứng dụng trong công việc.',
    branch: 'softskills',
    difficulty: 'medium',
    duration_min: 15,
    xp_reward: 25,
  },
  // Hard – 30 min
  {
    title: 'Thực hành thuyết trình trước bạn bè',
    description: 'Chuẩn bị và trình bày 1 chủ đề trong 5 phút trước ít nhất 2 người, sau đó xin phản hồi.',
    branch: 'softskills',
    difficulty: 'hard',
    duration_min: 30,
    xp_reward: 50,
  },
  {
    title: 'Đóng vai để luyện kỹ năng đàm phán',
    description: 'Nhờ bạn bè đóng vai đối phương trong tình huống đàm phán tăng lương hoặc ký hợp đồng.',
    branch: 'softskills',
    difficulty: 'hard',
    duration_min: 30,
    xp_reward: 50,
  },
  {
    title: 'Viết bài phân tích phong cách giao tiếp',
    description: 'Xác định phong cách giao tiếp của bạn (assertive/passive/aggressive) và lập kế hoạch cải thiện.',
    branch: 'softskills',
    difficulty: 'hard',
    duration_min: 30,
    xp_reward: 50,
  },
  {
    title: 'Kết nối và phỏng vấn informational với 1 chuyên gia',
    description: 'Liên hệ và dành 30 phút trò chuyện với một người có kinh nghiệm trong lĩnh vực bạn quan tâm.',
    branch: 'softskills',
    difficulty: 'hard',
    duration_min: 30,
    xp_reward: 50,
  },
];

const WELLBEING_QUESTS: QuestTemplate[] = [
  // Easy – 5 min
  {
    title: 'Hít thở sâu 5 phút',
    description: 'Thực hành kỹ thuật thở 4-7-8: hít vào 4 giây, nín 7 giây, thở ra 8 giây. Lặp lại 5 lần.',
    branch: 'wellbeing',
    difficulty: 'easy',
    duration_min: 5,
    xp_reward: 10,
  },
  {
    title: 'Viết 3 điều biết ơn hôm nay',
    description: 'Ghi lại 3 điều dù nhỏ mà bạn cảm thấy biết ơn trong ngày hôm nay.',
    branch: 'wellbeing',
    difficulty: 'easy',
    duration_min: 5,
    xp_reward: 10,
  },
  {
    title: 'Uống đủ nước buổi sáng',
    description: 'Uống 1-2 ly nước ngay sau khi thức dậy để khởi động cơ thể và não bộ.',
    branch: 'wellbeing',
    difficulty: 'easy',
    duration_min: 5,
    xp_reward: 10,
  },
  {
    title: 'Đặt điện thoại xuống 5 phút',
    description: 'Dành 5 phút không nhìn màn hình, chỉ quan sát xung quanh hoặc nhắm mắt thư giãn.',
    branch: 'wellbeing',
    difficulty: 'easy',
    duration_min: 5,
    xp_reward: 10,
  },
  {
    title: 'Giãn cơ nhẹ 5 phút',
    description: 'Thực hiện 5-7 động tác giãn cơ cổ, vai, lưng để giảm căng thẳng sau khi ngồi lâu.',
    branch: 'wellbeing',
    difficulty: 'easy',
    duration_min: 5,
    xp_reward: 10,
  },
  {
    title: 'Gọi điện cho người thân',
    description: 'Gọi điện hoặc nhắn tin hỏi thăm một thành viên gia đình hoặc bạn bè lâu chưa liên lạc.',
    branch: 'wellbeing',
    difficulty: 'easy',
    duration_min: 5,
    xp_reward: 10,
  },
  {
    title: 'Nhận ra và đặt tên cho cảm xúc hiện tại',
    description: 'Dừng lại và xác định chính xác cảm xúc bạn đang có, ghi vào nhật ký hoặc ghi chú điện thoại.',
    branch: 'wellbeing',
    difficulty: 'easy',
    duration_min: 5,
    xp_reward: 10,
  },
  // Medium – 15 min
  {
    title: 'Đi bộ 15 phút không điện thoại',
    description: 'Đi bộ ngoài trời hoặc trong nhà 15 phút, để điện thoại lại và chú ý đến xung quanh.',
    branch: 'wellbeing',
    difficulty: 'medium',
    duration_min: 15,
    xp_reward: 25,
  },
  {
    title: 'Thiền định có hướng dẫn',
    description: 'Nghe và thực hành theo 1 bài thiền guided meditation từ ứng dụng hoặc YouTube trong 15 phút.',
    branch: 'wellbeing',
    difficulty: 'medium',
    duration_min: 15,
    xp_reward: 25,
  },
  {
    title: 'Viết nhật ký giải toả cảm xúc',
    description: 'Viết tự do trong 15 phút về những gì đang khiến bạn căng thẳng, không cần chỉnh sửa.',
    branch: 'wellbeing',
    difficulty: 'medium',
    duration_min: 15,
    xp_reward: 25,
  },
  {
    title: 'Lập thói quen buổi sáng đơn giản',
    description: 'Thiết kế một morning routine 15 phút gồm ít nhất 3 hoạt động tích cực.',
    branch: 'wellbeing',
    difficulty: 'medium',
    duration_min: 15,
    xp_reward: 25,
  },
  {
    title: 'Chuẩn bị môi trường ngủ tốt hơn',
    description: 'Kiểm tra phòng ngủ: nhiệt độ, ánh sáng, tiếng ồn và điều chỉnh để cải thiện chất lượng giấc ngủ.',
    branch: 'wellbeing',
    difficulty: 'medium',
    duration_min: 15,
    xp_reward: 25,
  },
  {
    title: 'Thực hành body scan meditation',
    description: 'Nằm xuống và quét qua từng bộ phận cơ thể từ đầu đến chân, thả lỏng từng vùng.',
    branch: 'wellbeing',
    difficulty: 'medium',
    duration_min: 15,
    xp_reward: 25,
  },
  // Hard – 30 min
  {
    title: 'Tập yoga hoặc bài tập thể dục đầy đủ',
    description: 'Thực hiện một buổi tập yoga, gym hoặc cardio ít nhất 30 phút theo đúng kế hoạch.',
    branch: 'wellbeing',
    difficulty: 'hard',
    duration_min: 30,
    xp_reward: 50,
  },
  {
    title: 'Lập kế hoạch chăm sóc bản thân tuần tới',
    description: 'Lên lịch chi tiết cho các hoạt động chăm sóc bản thân trong 7 ngày tới: giấc ngủ, vận động, dinh dưỡng, thư giãn.',
    branch: 'wellbeing',
    difficulty: 'hard',
    duration_min: 30,
    xp_reward: 50,
  },
  {
    title: 'Viết thư cho bản thân tương lai',
    description: 'Viết thư gửi cho bản thân 1 năm sau: nói về ước mơ, thách thức và lời động viên.',
    branch: 'wellbeing',
    difficulty: 'hard',
    duration_min: 30,
    xp_reward: 50,
  },
  {
    title: 'Thực hành tự từ bi (Self-compassion)',
    description: 'Đọc và thực hành bài tập self-compassion break của Dr. Kristin Neff trong 30 phút.',
    branch: 'wellbeing',
    difficulty: 'hard',
    duration_min: 30,
    xp_reward: 50,
  },
];

function buildQuests(templates: QuestTemplate[]): Quest[] {
  return templates.map((t, i) => ({
    ...t,
    quest_id: `${t.branch}_${t.difficulty}_${String(i + 1).padStart(3, '0')}`,
    completed_at: null,
  }));
}

export const CAREER_QUEST_LIBRARY = buildQuests(CAREER_QUESTS);
export const FINANCE_QUEST_LIBRARY = buildQuests(FINANCE_QUESTS);
export const SOFTSKILLS_QUEST_LIBRARY = buildQuests(SOFTSKILLS_QUESTS);
export const WELLBEING_QUEST_LIBRARY = buildQuests(WELLBEING_QUESTS);

export const ALL_QUESTS: Quest[] = [
  ...CAREER_QUEST_LIBRARY,
  ...FINANCE_QUEST_LIBRARY,
  ...SOFTSKILLS_QUEST_LIBRARY,
  ...WELLBEING_QUEST_LIBRARY,
];

export function getQuestsForBranch(branch: Branch): Quest[] {
  return ALL_QUESTS.filter((q) => q.branch === branch);
}

export function getQuestsByDifficulty(difficulty: Difficulty): Quest[] {
  return ALL_QUESTS.filter((q) => q.difficulty === difficulty);
}

export function getDailyQuestPool(
  primaryBranch: Branch,
  stamina: number,
): Quest[] {
  const isLowStamina = stamina < 30;

  const branchPool = getQuestsForBranch(primaryBranch);
  const wellbeingPool = getQuestsForBranch('wellbeing');

  // Low stamina: only wellbeing quests
  if (isLowStamina) {
    return shuffle(wellbeingPool).slice(0, 5);
  }

  // Normal: 3 from primary branch + 2 wellbeing
  const primaryPick = shuffle(branchPool).slice(0, 3);
  const wellbeingPick = shuffle(wellbeingPool).slice(0, 2);

  return shuffle([...primaryPick, ...wellbeingPick]);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
