-- ============================================================
-- Migration 005: Seed quests catalog (65 quests across 4 branches)
--
-- Quest IDs match the deterministic algorithm in quest-library.ts:
--   quest_id = `${branch}_${difficulty}_${(i+1).padStart(3,'0')}`
--   where i is the 0-based index in the combined branch array
--   (easy first, then medium, then hard).
-- ============================================================

insert into quests (quest_id, title, description, branch, difficulty, duration_min, xp_reward) values

  -- ═══════════════════════════════════════════════════════════
  -- CAREER  (16 quests: 6 easy · 6 medium · 4 hard)
  -- ═══════════════════════════════════════════════════════════

  ('career_easy_001', 'Viết 3 điểm mạnh của bản thân',
   'Liệt kê 3 kỹ năng hoặc phẩm chất nổi bật nhất mà bạn tự hào.',
   'career', 'easy', 5, 10),

  ('career_easy_002', 'Cập nhật tiêu đề LinkedIn',
   'Chỉnh sửa tiêu đề hồ sơ LinkedIn để phản ánh đúng vai trò và giá trị của bạn.',
   'career', 'easy', 5, 10),

  ('career_easy_003', 'Đọc 1 bài viết nghề nghiệp',
   'Đọc một bài viết liên quan đến ngành của bạn và ghi lại 1 điều học được.',
   'career', 'easy', 5, 10),

  ('career_easy_004', 'Xem lại mô tả công việc mơ ước',
   'Tìm 1 vị trí công việc bạn muốn và gạch chân những yêu cầu bạn chưa đáp ứng.',
   'career', 'easy', 5, 10),

  ('career_easy_005', 'Ghi mục tiêu nghề nghiệp tuần này',
   'Viết ra 1 mục tiêu cụ thể, đo lường được cho tuần này liên quan đến sự nghiệp.',
   'career', 'easy', 5, 10),

  ('career_easy_006', 'Nghiên cứu công ty muốn ứng tuyển',
   'Dành 5 phút tìm hiểu văn hóa và sản phẩm của một công ty bạn quan tâm.',
   'career', 'easy', 5, 10),

  ('career_medium_007', 'Hoàn thiện 1 mục trong CV',
   'Cập nhật phần kinh nghiệm hoặc kỹ năng trong CV với thành tích cụ thể và con số.',
   'career', 'medium', 15, 25),

  ('career_medium_008', 'Luyện tập trả lời câu hỏi về bản thân',
   'Tập nói và ghi âm phần giới thiệu bản thân trong 2 phút, sau đó nghe lại và cải thiện.',
   'career', 'medium', 15, 25),

  ('career_medium_009', 'Viết email xin tư vấn nghề nghiệp',
   'Soạn một email ngắn gọn, chuyên nghiệp gửi đến một mentor để xin lời khuyên.',
   'career', 'medium', 15, 25),

  ('career_medium_010', 'Nghiên cứu xu hướng ngành',
   'Đọc ít nhất 2 bài về xu hướng trong ngành của bạn và tóm tắt lại thành ghi chú.',
   'career', 'medium', 15, 25),

  ('career_medium_011', 'Phân tích khoảng cách kỹ năng',
   'So sánh kỹ năng bạn đang có với yêu cầu của vị trí mơ ước và liệt kê những gì cần học.',
   'career', 'medium', 15, 25),

  ('career_medium_012', 'Xây dựng danh sách 10 công ty mục tiêu',
   'Nghiên cứu và tạo danh sách 10 công ty phù hợp với định hướng nghề nghiệp của bạn.',
   'career', 'medium', 15, 25),

  ('career_hard_013', 'Thực hành phỏng vấn mock',
   'Nhờ bạn bè hoặc dùng AI để luyện tập phỏng vấn với ít nhất 5 câu hỏi khó.',
   'career', 'hard', 30, 50),

  ('career_hard_014', 'Hoàn thiện hồ sơ LinkedIn đầy đủ',
   'Điền đầy đủ tất cả các phần trong LinkedIn và thêm ít nhất 1 recommendation.',
   'career', 'hard', 30, 50),

  ('career_hard_015', 'Lập kế hoạch sự nghiệp 12 tháng',
   'Viết kế hoạch chi tiết với các mốc quan trọng theo từng quý trong 1 năm tới.',
   'career', 'hard', 30, 50),

  ('career_hard_016', 'Tham gia sự kiện networking online',
   'Tham dự một buổi webinar hoặc meetup trong ngành và kết nối với ít nhất 2 người mới.',
   'career', 'hard', 30, 50),

  -- ═══════════════════════════════════════════════════════════
  -- FINANCE  (16 quests: 6 easy · 6 medium · 4 hard)
  -- ═══════════════════════════════════════════════════════════

  ('finance_easy_001', 'Ghi lại chi tiêu hôm nay',
   'Liệt kê tất cả các khoản chi tiêu trong ngày hôm nay, dù nhỏ đến đâu.',
   'finance', 'easy', 5, 10),

  ('finance_easy_002', 'Xem số dư tài khoản',
   'Kiểm tra số dư tất cả các tài khoản ngân hàng và ví điện tử của bạn.',
   'finance', 'easy', 5, 10),

  ('finance_easy_003', 'Xác định 1 khoản chi không cần thiết',
   'Tìm một khoản chi tiêu tuần này có thể cắt giảm hoặc loại bỏ hoàn toàn.',
   'finance', 'easy', 5, 10),

  ('finance_easy_004', 'Đặt mục tiêu tiết kiệm tuần này',
   'Quyết định một con số tiết kiệm cụ thể cho 7 ngày tới và viết ra.',
   'finance', 'easy', 5, 10),

  ('finance_easy_005', 'Đọc 1 mẹo tài chính cá nhân',
   'Tìm và đọc một bài viết về tài chính cá nhân, ghi lại điểm áp dụng được ngay.',
   'finance', 'easy', 5, 10),

  ('finance_easy_006', 'Kiểm tra hóa đơn đăng ký dịch vụ',
   'Xem lại danh sách subscription đang trả tiền và xác định cái nào không còn dùng.',
   'finance', 'easy', 5, 10),

  ('finance_medium_007', 'Lập ngân sách tháng theo quy tắc 50/30/20',
   'Phân bổ thu nhập: 50% nhu cầu thiết yếu, 30% mong muốn, 20% tiết kiệm/đầu tư.',
   'finance', 'medium', 15, 25),

  ('finance_medium_008', 'Phân tích chi tiêu 30 ngày qua',
   'Xem lịch sử giao dịch, phân loại chi tiêu và tìm danh mục nào vượt ngân sách.',
   'finance', 'medium', 15, 25),

  ('finance_medium_009', 'Nghiên cứu tài khoản tiết kiệm lãi suất cao',
   'So sánh lãi suất của 3 ngân hàng và xác định nên mở tài khoản tiết kiệm ở đâu.',
   'finance', 'medium', 15, 25),

  ('finance_medium_010', 'Tính toán quỹ khẩn cấp cần thiết',
   'Tính chi phí sinh hoạt tháng × 6 và xem bạn còn thiếu bao nhiêu.',
   'finance', 'medium', 15, 25),

  ('finance_medium_011', 'Học về chứng khoán cơ bản',
   'Đọc phần giải thích về cổ phiếu, ETF và trái phiếu; ghi tóm tắt sự khác biệt.',
   'finance', 'medium', 15, 25),

  ('finance_medium_012', 'Lên kế hoạch trả nợ ưu tiên',
   'Liệt kê tất cả các khoản nợ, sắp xếp theo lãi suất cao nhất và lên lịch trả.',
   'finance', 'medium', 15, 25),

  ('finance_hard_013', 'Lập bảng tài sản & nợ cá nhân',
   'Tạo bảng balance sheet cá nhân: liệt kê tất cả tài sản, khoản nợ và tính net worth.',
   'finance', 'hard', 30, 50),

  ('finance_hard_014', 'Mô phỏng danh mục đầu tư đầu tiên',
   'Dùng tài khoản paper trading để tạo danh mục đầu tư và theo dõi 1 tuần.',
   'finance', 'hard', 30, 50),

  ('finance_hard_015', 'Tạo kế hoạch tài chính 1 năm',
   'Viết kế hoạch tài chính chi tiết gồm mục tiêu tiết kiệm, đầu tư và trả nợ từng quý.',
   'finance', 'hard', 30, 50),

  ('finance_hard_016', 'Phân tích và tối ưu hóa chi tiêu lớn',
   'Tìm 3 khoản chi tiêu lớn nhất tháng, nghiên cứu phương án tiết kiệm cho mỗi khoản.',
   'finance', 'hard', 30, 50),

  -- ═══════════════════════════════════════════════════════════
  -- SOFTSKILLS  (16 quests: 6 easy · 6 medium · 4 hard)
  -- ═══════════════════════════════════════════════════════════

  ('softskills_easy_001', 'Lắng nghe mà không ngắt lời',
   'Trong 1 cuộc trò chuyện hôm nay, hãy lắng nghe hoàn toàn mà không ngắt lời đối phương.',
   'softskills', 'easy', 5, 10),

  ('softskills_easy_002', 'Gửi tin nhắn tích cực cho 1 người',
   'Nhắn tin cho một người bạn hoặc đồng nghiệp với lời động viên hoặc cảm ơn chân thành.',
   'softskills', 'easy', 5, 10),

  ('softskills_easy_003', 'Viết nhật ký cảm xúc 3 phút',
   'Ghi lại cảm xúc hiện tại và nguyên nhân gây ra nó trong 3 phút.',
   'softskills', 'easy', 5, 10),

  ('softskills_easy_004', 'Thực hành giao tiếp bằng mắt',
   'Trong cuộc trò chuyện tiếp theo, duy trì giao tiếp bằng mắt tự nhiên với đối phương.',
   'softskills', 'easy', 5, 10),

  ('softskills_easy_005', 'Đặt 3 câu hỏi mở trong cuộc trò chuyện',
   'Tập đặt câu hỏi bắt đầu bằng "Tại sao", "Như thế nào" thay vì câu hỏi có/không.',
   'softskills', 'easy', 5, 10),

  ('softskills_easy_006', 'Nhận phản hồi từ 1 người',
   'Chủ động hỏi một người đáng tin cậy về một điểm bạn có thể cải thiện trong giao tiếp.',
   'softskills', 'easy', 5, 10),

  ('softskills_medium_007', 'Luyện tập kỹ thuật sandwich feedback',
   'Viết ví dụ phản hồi theo cấu trúc: Tích cực – Cải thiện – Tích cực.',
   'softskills', 'medium', 15, 25),

  ('softskills_medium_008', 'Xem video kỹ năng thuyết trình',
   'Xem 1 TED Talk ngắn (10–15 phút), chú ý 3 kỹ thuật thuyết trình và ghi chú lại.',
   'softskills', 'medium', 15, 25),

  ('softskills_medium_009', 'Luyện tập ngôn ngữ cơ thể tích cực',
   'Đứng trước gương 15 phút, luyện tập tư thế mở, giao tiếp bằng mắt và nụ cười tự tin.',
   'softskills', 'medium', 15, 25),

  ('softskills_medium_010', 'Phân tích tình huống xung đột',
   'Nhớ lại 1 tình huống bất đồng gần đây, phân tích từ góc độ cả hai bên và tìm giải pháp.',
   'softskills', 'medium', 15, 25),

  ('softskills_medium_011', 'Viết email chuyên nghiệp',
   'Soạn và gửi một email quan trọng với cấu trúc rõ ràng, tôn trọng và đúng ngữ cảnh.',
   'softskills', 'medium', 15, 25),

  ('softskills_medium_012', 'Nghiên cứu về trí tuệ cảm xúc',
   'Đọc về 4 trụ cột của EQ: tự nhận thức, tự điều tiết, đồng cảm, kỹ năng xã hội.',
   'softskills', 'medium', 15, 25),

  ('softskills_hard_013', 'Thực hành thuyết trình trước bạn bè',
   'Chuẩn bị và trình bày 1 chủ đề trong 5 phút trước ít nhất 2 người, xin phản hồi.',
   'softskills', 'hard', 30, 50),

  ('softskills_hard_014', 'Đóng vai để luyện kỹ năng đàm phán',
   'Nhờ bạn bè đóng vai đối phương trong tình huống đàm phán tăng lương hoặc ký hợp đồng.',
   'softskills', 'hard', 30, 50),

  ('softskills_hard_015', 'Viết bài phân tích phong cách giao tiếp',
   'Xác định phong cách giao tiếp của bạn và lập kế hoạch cải thiện.',
   'softskills', 'hard', 30, 50),

  ('softskills_hard_016', 'Kết nối và phỏng vấn với 1 chuyên gia',
   'Liên hệ và dành 30 phút trò chuyện với một người có kinh nghiệm trong lĩnh vực bạn quan tâm.',
   'softskills', 'hard', 30, 50),

  -- ═══════════════════════════════════════════════════════════
  -- WELLBEING  (17 quests: 7 easy · 6 medium · 4 hard)
  -- ═══════════════════════════════════════════════════════════

  ('wellbeing_easy_001', 'Hít thở sâu 5 phút',
   'Thực hành kỹ thuật thở 4-7-8: hít vào 4 giây, nín 7 giây, thở ra 8 giây. Lặp lại 5 lần.',
   'wellbeing', 'easy', 5, 10),

  ('wellbeing_easy_002', 'Viết 3 điều biết ơn hôm nay',
   'Ghi lại 3 điều dù nhỏ mà bạn cảm thấy biết ơn trong ngày hôm nay.',
   'wellbeing', 'easy', 5, 10),

  ('wellbeing_easy_003', 'Uống đủ nước buổi sáng',
   'Uống 1–2 ly nước ngay sau khi thức dậy để khởi động cơ thể và não bộ.',
   'wellbeing', 'easy', 5, 10),

  ('wellbeing_easy_004', 'Đặt điện thoại xuống 5 phút',
   'Dành 5 phút không nhìn màn hình, chỉ quan sát xung quanh hoặc nhắm mắt thư giãn.',
   'wellbeing', 'easy', 5, 10),

  ('wellbeing_easy_005', 'Giãn cơ nhẹ 5 phút',
   'Thực hiện 5–7 động tác giãn cơ cổ, vai, lưng để giảm căng thẳng sau khi ngồi lâu.',
   'wellbeing', 'easy', 5, 10),

  ('wellbeing_easy_006', 'Gọi điện cho người thân',
   'Gọi điện hoặc nhắn tin hỏi thăm một thành viên gia đình hoặc bạn bè lâu chưa liên lạc.',
   'wellbeing', 'easy', 5, 10),

  ('wellbeing_easy_007', 'Nhận ra và đặt tên cho cảm xúc hiện tại',
   'Dừng lại và xác định chính xác cảm xúc bạn đang có, ghi vào nhật ký hoặc điện thoại.',
   'wellbeing', 'easy', 5, 10),

  ('wellbeing_medium_008', 'Đi bộ 15 phút không điện thoại',
   'Đi bộ ngoài trời 15 phút, để điện thoại lại và chú ý đến xung quanh.',
   'wellbeing', 'medium', 15, 25),

  ('wellbeing_medium_009', 'Thiền định có hướng dẫn',
   'Nghe và thực hành theo 1 bài thiền guided meditation từ ứng dụng hoặc YouTube trong 15 phút.',
   'wellbeing', 'medium', 15, 25),

  ('wellbeing_medium_010', 'Viết nhật ký giải toả cảm xúc',
   'Viết tự do trong 15 phút về những gì đang khiến bạn căng thẳng, không cần chỉnh sửa.',
   'wellbeing', 'medium', 15, 25),

  ('wellbeing_medium_011', 'Lập thói quen buổi sáng đơn giản',
   'Thiết kế một morning routine 15 phút gồm ít nhất 3 hoạt động tích cực.',
   'wellbeing', 'medium', 15, 25),

  ('wellbeing_medium_012', 'Chuẩn bị môi trường ngủ tốt hơn',
   'Kiểm tra phòng ngủ: nhiệt độ, ánh sáng, tiếng ồn và điều chỉnh để cải thiện giấc ngủ.',
   'wellbeing', 'medium', 15, 25),

  ('wellbeing_medium_013', 'Thực hành body scan meditation',
   'Nằm xuống và quét qua từng bộ phận cơ thể từ đầu đến chân, thả lỏng từng vùng.',
   'wellbeing', 'medium', 15, 25),

  ('wellbeing_hard_014', 'Tập yoga hoặc bài tập thể dục đầy đủ',
   'Thực hiện một buổi tập yoga, gym hoặc cardio ít nhất 30 phút theo đúng kế hoạch.',
   'wellbeing', 'hard', 30, 50),

  ('wellbeing_hard_015', 'Lập kế hoạch chăm sóc bản thân tuần tới',
   'Lên lịch chi tiết cho các hoạt động chăm sóc bản thân trong 7 ngày tới.',
   'wellbeing', 'hard', 30, 50),

  ('wellbeing_hard_016', 'Viết thư cho bản thân tương lai',
   'Viết thư gửi cho bản thân 1 năm sau: nói về ước mơ, thách thức và lời động viên.',
   'wellbeing', 'hard', 30, 50),

  ('wellbeing_hard_017', 'Thực hành tự từ bi (Self-compassion)',
   'Đọc và thực hành bài tập self-compassion break của Dr. Kristin Neff trong 30 phút.',
   'wellbeing', 'hard', 30, 50)

on conflict (quest_id) do nothing;
