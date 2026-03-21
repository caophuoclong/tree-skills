-- ============================================================
-- Migration 021: Fallback Skill Nodes and Quests
--
-- Pre-seeded data for when AI generation fails
-- Each branch has nodes in all 3 tiers with quests
-- ============================================================

-- ═══════════════════════════════════════════════════════════════════════════════
-- FALLBACK SKILL NODES
-- ═══════════════════════════════════════════════════════════════════════════════

-- Career Branch
insert into skill_nodes (node_id, branch, tier, title, description, xp_required, quests_total, tier_order) values
  ('career_t1_resume', 'career', 1, 'Create a Professional Resume', 'Learn how to write a compelling resume that highlights your skills and experience. You will understand the key sections, formatting best practices, and how to tailor your resume for different jobs.', 75, 4, 1),
  ('career_t1_linkedin', 'career', 1, 'Build Your LinkedIn Profile', 'Set up a professional LinkedIn profile that attracts recruiters. You will learn how to write a headline, summary, and showcase your experience effectively.', 75, 4, 2),
  ('career_t2_interview', 'career', 2, 'Master Job Interviews', 'Prepare for common interview questions and practice your responses. You will learn the STAR method, how to handle behavioral questions, and salary negotiation basics.', 150, 5, 3),
  ('career_t2_portfolio', 'career', 2, 'Build a Portfolio Website', 'Create a personal portfolio to showcase your work. You will learn basic HTML/CSS and how to present your projects professionally.', 150, 6, 4),
  ('career_t3_leadership', 'career', 3, 'Develop Leadership Skills', 'Learn essential leadership qualities and how to motivate teams. You will understand delegation, feedback, and decision-making frameworks.', 300, 8, 5),
  ('career_t3_career_path', 'career', 3, 'Plan Your Career Path', 'Create a 5-year career development plan. You will learn goal-setting frameworks, skill gap analysis, and networking strategies.', 300, 8, 6)
on conflict (node_id) do nothing;

-- Finance Branch
insert into skill_nodes (node_id, branch, tier, title, description, xp_required, quests_total, tier_order) values
  ('finance_t1_budget', 'finance', 1, 'Create a Monthly Budget', 'Learn how to track your income and expenses. You will understand the 50/30/20 rule and create a sustainable budget plan.', 75, 4, 1),
  ('finance_t1_savings', 'finance', 1, 'Build an Emergency Fund', 'Set up a savings plan for unexpected expenses. You will learn how to calculate your emergency fund target and automate your savings.', 75, 4, 2),
  ('finance_t2_investing', 'finance', 2, 'Start Investing Basics', 'Learn the fundamentals of investing in stocks and bonds. You will understand risk tolerance, diversification, and how to open a brokerage account.', 150, 5, 3),
  ('finance_t2_debt', 'finance', 2, 'Create a Debt Payoff Plan', 'Develop a strategy to pay off debt efficiently. You will learn the snowball vs avalanche methods and how to negotiate with creditors.', 150, 6, 4),
  ('finance_t3_retirement', 'finance', 3, 'Plan for Retirement', 'Understand retirement accounts and create a long-term savings strategy. You will learn about 401k, IRA, and compound interest calculations.', 300, 8, 5),
  ('finance_t3_passive', 'finance', 3, 'Build Passive Income Streams', 'Explore different ways to earn passive income. You will learn about rental properties, dividends, and online business models.', 300, 8, 6)
on conflict (node_id) do nothing;

-- Softskills Branch
insert into skill_nodes (node_id, branch, tier, title, description, xp_required, quests_total, tier_order) values
  ('soft_t1_communication', 'softskills', 1, 'Improve Communication Skills', 'Learn to express your ideas clearly and confidently. You will practice active listening, clear speaking, and written communication basics.', 75, 4, 1),
  ('soft_t1_time', 'softskills', 1, 'Master Time Management', 'Learn techniques to manage your time effectively. You will understand prioritization, the Pomodoro technique, and how to avoid procrastination.', 75, 4, 2),
  ('soft_t2_presentation', 'softskills', 2, 'Deliver Great Presentations', 'Learn to create and deliver engaging presentations. You will practice structuring content, handling nerves, and using visual aids effectively.', 150, 5, 3),
  ('soft_t2_networking', 'softskills', 2, 'Build Your Network', 'Learn networking strategies to grow your professional connections. You will understand how to approach people, maintain relationships, and provide value.', 150, 6, 4),
  ('soft_t3_negotiation', 'softskills', 3, 'Master Negotiation', 'Learn advanced negotiation techniques for any situation. You will understand BATNA, anchoring, and how to create win-win outcomes.', 300, 8, 5),
  ('soft_t3_emotional', 'softskills', 3, 'Develop Emotional Intelligence', 'Build self-awareness and empathy. You will learn to recognize emotions, manage stress, and build stronger relationships.', 300, 8, 6)
on conflict (node_id) do nothing;

-- Wellbeing Branch
insert into skill_nodes (node_id, branch, tier, title, description, xp_required, quests_total, tier_order) values
  ('well_t1_sleep', 'wellbeing', 1, 'Optimize Your Sleep', 'Learn sleep hygiene habits for better rest. You will understand sleep cycles, create a bedtime routine, and improve sleep quality.', 75, 4, 1),
  ('well_t1_exercise', 'wellbeing', 1, 'Start a Fitness Routine', 'Begin a sustainable exercise habit. You will learn basic exercises, create a weekly schedule, and track your progress.', 75, 4, 2),
  ('well_t2_mindfulness', 'wellbeing', 2, 'Practice Mindfulness', 'Learn meditation and mindfulness techniques. You will practice breathing exercises, body scans, and mindful daily activities.', 150, 5, 3),
  ('well_t2_nutrition', 'wellbeing', 2, 'Improve Your Nutrition', 'Learn healthy eating habits and meal planning. You will understand macronutrients, portion control, and how to prepare balanced meals.', 150, 6, 4),
  ('well_t3_stress', 'wellbeing', 3, 'Master Stress Management', 'Develop comprehensive stress management strategies. You will learn cognitive reframing, relaxation techniques, and work-life balance.', 300, 8, 5),
  ('well_t3_resilience', 'wellbeing', 3, 'Build Mental Resilience', 'Strengthen your ability to bounce back from challenges. You will learn growth mindset, coping strategies, and how to build support systems.', 300, 8, 6)
on conflict (node_id) do nothing;

-- ═══════════════════════════════════════════════════════════════════════════════
-- FALLBACK QUESTS (3 per node)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Career T1 Resume
insert into quests (quest_id, title, description, branch, difficulty, duration_min, xp_reward, node_id) values
  ('career_t1_resume_q1', 'List Your Skills and Experience', 'Write down all your skills, work experience, and education. Include dates, job titles, and key responsibilities for each role.', 'career', 'easy', 5, 10, 'career_t1_resume'),
  ('career_t1_resume_q2', 'Write Resume Summary', 'Create a 2-3 sentence professional summary that highlights your strengths and career goals. Make it specific to your target job.', 'career', 'easy', 5, 10, 'career_t1_resume'),
  ('career_t1_resume_q3', 'Format Your Resume', 'Use a clean template to format your resume. Include sections: Contact Info, Summary, Experience, Education, Skills. Save as PDF.', 'career', 'medium', 15, 25, 'career_t1_resume'),
  ('career_t1_resume_q4', 'Tailor Resume for a Job', 'Find a job posting and customize your resume to match the requirements. Highlight relevant skills and experience.', 'career', 'medium', 15, 25, 'career_t1_resume')
on conflict (quest_id) do nothing;

-- Career T1 LinkedIn
insert into quests (quest_id, title, description, branch, difficulty, duration_min, xp_reward, node_id) values
  ('career_t1_linkedin_q1', 'Write Professional Headline', 'Create a compelling LinkedIn headline (120 chars) that includes your job title and key skills. Avoid just listing your job title.', 'career', 'easy', 5, 10, 'career_t1_linkedin'),
  ('career_t1_linkedin_q2', 'Write About Section', 'Write a 3-paragraph About section that tells your professional story. Include your passion, experience, and what you are looking for.', 'career', 'easy', 5, 10, 'career_t1_linkedin'),
  ('career_t1_linkedin_q3', 'Add Experience and Skills', 'Add your work experience with achievements (not just duties). Add at least 5 relevant skills to your profile.', 'career', 'medium', 15, 25, 'career_t1_linkedin'),
  ('career_t1_linkedin_q4', 'Connect with 10 People', 'Find and connect with 10 people in your industry. Send personalized connection requests mentioning common interests.', 'career', 'medium', 15, 25, 'career_t1_linkedin')
on conflict (quest_id) do nothing;

-- Finance T1 Budget
insert into quests (quest_id, title, description, branch, difficulty, duration_min, xp_reward, node_id) values
  ('finance_t1_budget_q1', 'Track Today Expenses', 'Write down everything you spent money on today. Include small purchases like coffee or snacks.', 'finance', 'easy', 5, 10, 'finance_t1_budget'),
  ('finance_t1_budget_q2', 'List Monthly Income', 'Write down all sources of monthly income. Include salary, side jobs, and any passive income.', 'finance', 'easy', 5, 10, 'finance_t1_budget'),
  ('finance_t1_budget_q3', 'Categorize Expenses', 'Group your expenses into categories: Housing, Food, Transport, Entertainment, Savings. Calculate total for each.', 'finance', 'medium', 15, 25, 'finance_t1_budget'),
  ('finance_t1_budget_q4', 'Apply 50/30/20 Rule', 'Calculate how much you should spend on Needs (50%), Wants (30%), and Savings (20%) based on your income.', 'finance', 'medium', 15, 25, 'finance_t1_budget')
on conflict (quest_id) do nothing;

-- Softskills T1 Communication
insert into quests (quest_id, title, description, branch, difficulty, duration_min, xp_reward, node_id) values
  ('soft_t1_comm_q1', 'Practice Active Listening', 'Have a 5-minute conversation where you only listen and ask questions. Do not interrupt or give advice.', 'softskills', 'easy', 5, 10, 'soft_t1_communication'),
  ('soft_t1_comm_q2', 'Write a Clear Email', 'Write a professional email with a clear subject line, greeting, body (3 sentences max), and closing.', 'softskills', 'easy', 5, 10, 'soft_t1_communication'),
  ('soft_t1_comm_q3', 'Explain a Concept Simply', 'Choose a topic you know well and explain it in simple terms that a child could understand.', 'softskills', 'medium', 15, 25, 'soft_t1_communication'),
  ('soft_t1_comm_q4', 'Give Constructive Feedback', 'Practice giving feedback using the SBI model: Situation, Behavior, Impact. Write an example.', 'softskills', 'medium', 15, 25, 'soft_t1_communication')
on conflict (quest_id) do nothing;

-- Wellbeing T1 Sleep
insert into quests (quest_id, title, description, branch, difficulty, duration_min, xp_reward, node_id) values
  ('well_t1_sleep_q1', 'Set a Bedtime', 'Choose a consistent bedtime and set a reminder 30 minutes before. Turn off screens at that time.', 'wellbeing', 'easy', 5, 10, 'well_t1_sleep'),
  ('well_t1_sleep_q2', 'Create Sleep Environment', 'Make your bedroom dark and cool. Remove distractions like phone or bright lights.', 'wellbeing', 'easy', 5, 10, 'well_t1_sleep'),
  ('well_t1_sleep_q3', 'Avoid Caffeine After 2pm', 'Skip coffee, tea, or energy drinks after 2pm. Replace with water or herbal tea.', 'wellbeing', 'medium', 15, 25, 'well_t1_sleep'),
  ('well_t1_sleep_q4', 'Track Sleep Quality', 'Rate your sleep quality (1-10) and note what helped or hurt your sleep. Track for 3 days.', 'wellbeing', 'medium', 15, 25, 'well_t1_sleep')
on conflict (quest_id) do nothing;

-- ═══════════════════════════════════════════════════════════════════════════════
-- Generate tier dependencies for fallback nodes
-- ═══════════════════════════════════════════════════════════════════════════════

select generate_tier_dependencies();
