-- ============================================================
-- Migration 015: Add Localization to Profiles
--
-- Adds localization settings (language, timezone, etc.)
-- ============================================================

-- Add localization column to profiles
alter table profiles add column if not exists localization jsonb not null default '{
  "language": "vi",
  "timezone": "Asia/Ho_Chi_Minh",
  "currency": "VND",
  "date_format": "DD/MM/YYYY",
  "first_day_of_week": 1
}';

-- Add comment
comment on column profiles.localization is 'User localization settings: language, timezone, currency, date_format, first_day_of_week';
