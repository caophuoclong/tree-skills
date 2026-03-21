-- ============================================================
-- Migration 007: branches master-data table
--
-- Stores the 4 branch definitions (career, finance, softskills,
-- wellbeing) that previously lived as hardcoded constants in the
-- app. Any future branch changes only require a DB update — no
-- app release needed.
--
-- Public read / admin write (same policy pattern as skill_nodes).
-- ============================================================

-- ─── Table ────────────────────────────────────────────────────────────────────

create table branches (
  id         branch_type primary key,   -- reuses the existing enum
  label      text not null,             -- Vietnamese display label
  label_en   text not null,             -- Short English name
  color      text not null,             -- Hex accent color  e.g. '#7C6AF7'
  emoji      text not null,             -- Single emoji  e.g. '💼'
  icon       text not null,             -- Ionicons name  e.g. 'briefcase'
  sort_order int  not null default 0
);

-- ─── RLS ──────────────────────────────────────────────────────────────────────

alter table branches enable row level security;

create policy "Anyone can read branches"
  on branches for select
  using (true);

-- ─── Seed ─────────────────────────────────────────────────────────────────────

insert into branches (id, label, label_en, color, emoji, icon, sort_order) values
  ('career',     'Sự nghiệp',   'Tech & Career',   '#7C6AF7', '💼', 'briefcase', 1),
  ('finance',    'Tài chính',   'Finance & Money', '#22C55E', '💰', 'wallet',    2),
  ('softskills', 'Kỹ năng mềm', 'Communication',   '#F59E0B', '💬', 'bulb',      3),
  ('wellbeing',  'Sức khỏe',    'Health & Mind',   '#EC4899', '🧘', 'leaf',      4)
on conflict (id) do nothing;
