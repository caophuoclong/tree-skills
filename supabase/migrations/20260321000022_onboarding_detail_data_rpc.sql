-- ============================================================
-- Migration 022: RPC function for onboarding detail data
--
-- Returns user onboarding answers enriched with master_data:
-- type, key, label (prefers label_en over label), description
-- ============================================================

create or replace function onboarding_detail_data(p_user_id uuid)
returns table (
  step_key    text,
  type        text,
  key         text,
  label       text,
  description text
)
language plpgsql
security definer
stable
as $$
declare
  v_answers jsonb;
begin
  -- Get user's onboarding answers
  select uo.answers into v_answers
  from user_onboardings uo
  where uo.user_id = p_user_id;

  if v_answers is null then
    return;
  end if;

  -- Return rows: unnest answers, join master_data
  return query
  with answer_entries as (
    -- Single-value answers (text/uuid stored as string)
    select
      os.step_key,
      os.master_type,
      case jsonb_typeof(v_answers -> os.step_key)
        when 'string' then array[(v_answers ->> os.step_key)]
        when 'array'  then (
          select array_agg(elem)
          from jsonb_array_elements_text(v_answers -> os.step_key) as elem
        )
        else null
      end as master_ids
    from onboarding_steps os
    where v_answers ? os.step_key
      and os.master_type is not null
  ),
  unnested as (
    select
      ae.step_key,
      ae.master_type,
      unnest(ae.master_ids) as master_id
    from answer_entries ae
    where ae.master_ids is not null
  )
  select
    u.step_key,
    md.type,
    md.key,
    coalesce(
      nullif(md.data ->> 'label_en', ''),
      nullif(md.data ->> 'label', ''),
      md.key
    ) as label,
    md.description
  from unnested u
  join master_data md on md.id = u.master_id::uuid;
end;
$$;

-- Grant execute to authenticated users
grant execute on function onboarding_detail_data(uuid) to authenticated;

comment on function onboarding_detail_data is
'Returns onboarding detail data for a user: type, key, label (prefers label_en), description from master_data joined via user_onboardings.answers.';
