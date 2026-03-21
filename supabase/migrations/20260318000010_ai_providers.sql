-- ============================================================
-- Migration 010: AI Providers Configuration
--
-- Stores AI provider settings (OpenAI, Anthropic, Google, etc.)
-- Managed by external admin service only.
-- ============================================================

-- ─── Table ────────────────────────────────────────────────────────────────────

create table ai_providers (
  id            uuid primary key default gen_random_uuid(),
  name          text not null unique,              -- e.g. 'openai', 'anthropic', 'google', 'local'
  display_name  text not null,                     -- e.g. 'OpenAI GPT-4o'
  api_base_url  text not null,                     -- e.g. 'https://api.openai.com/v1'
  api_key_env   text not null,                     -- env var name containing the key
  default_model text not null,                     -- e.g. 'gpt-4o-mini'
  is_active     boolean not null default true,
  config        jsonb not null default '{}',       -- extra config (headers, params, etc.)
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ─── RLS ──────────────────────────────────────────────────────────────────────

alter table ai_providers enable row level security;

-- No client-side access
create policy "No public access to ai providers"
  on ai_providers for all
  using (false);

-- ─── Trigger ──────────────────────────────────────────────────────────────────

create trigger ai_providers_updated_at
  before update on ai_providers
  for each row execute procedure set_updated_at();

-- ─── Seed: Default Providers ──────────────────────────────────────────────────

insert into ai_providers (name, display_name, api_base_url, api_key_env, default_model, config) values

  ('openai', 'OpenAI GPT-4o-mini',
   'https://api.openai.com/v1/chat/completions',
   'OPENAI_API_KEY',
   'gpt-4o-mini',
   '{"headers": {"Content-Type": "application/json", "Authorization": "Bearer {{api_key}}"}, "body_params": {"temperature": 0.7, "max_tokens": 2000, "response_format": {"type": "json_object"}}}'),

  ('anthropic', 'Anthropic Claude',
   'https://api.anthropic.com/v1/messages',
   'ANTHROPIC_API_KEY',
   'claude-3-haiku-20240307',
   '{"headers": {"Content-Type": "application/json", "x-api-key": "{{api_key}}", "anthropic-version": "2023-06-01"}, "body_params": {"max_tokens": 2000}}'),

  ('google', 'Google Gemini',
   'https://generativelanguage.googleapis.com/v1beta/models',
   'GOOGLE_API_KEY',
   'gemini-1.5-flash',
   '{"headers": {"Content-Type": "application/json"}, "body_params": {"generationConfig": {"temperature": 0.7, "maxOutputTokens": 2000}}}'),

  ('local', 'Local Ollama',
   'http://host.docker.internal:11434/api/chat',
   '',
   'llama3.1',
   '{"headers": {"Content-Type": "application/json"}, "body_params": {"stream": false}}')

on conflict (name) do nothing;

-- ─── Link system_prompts to provider ───────────────────────────────────────────

alter table system_prompts add column if not exists provider_id uuid references ai_providers(id);
alter table system_prompts add column if not exists model text;
