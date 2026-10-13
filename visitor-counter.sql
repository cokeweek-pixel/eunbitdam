-- 은빛담 방문자 집계: Supabase SQL Editor에서 전체를 한 번 실행하세요.
-- 재실행해도 기존 방문 기록은 삭제되지 않습니다.
begin;
create table if not exists public.eunbitdam_visit_days (
  visit_day date not null,
  visitor_id uuid not null,
  first_seen_at timestamptz not null default now(),
  primary key (visit_day, visitor_id)
);
create table if not exists public.eunbitdam_visit_settings (
  id boolean primary key default true check (id),
  started_at timestamptz not null default now()
);
insert into public.eunbitdam_visit_settings (id) values (true) on conflict do nothing;
alter table public.eunbitdam_visit_days enable row level security;
alter table public.eunbitdam_visit_settings enable row level security;
revoke all on public.eunbitdam_visit_days, public.eunbitdam_visit_settings from public, anon, authenticated;

-- 익명 브라우저 식별자만 기록하며 날짜는 서버의 한국 시간으로 결정합니다.
create or replace function public.eunbitdam_record_visit(p_visitor_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_visitor_id is null then raise exception 'visitor id required'; end if;
  insert into public.eunbitdam_visit_days (visit_day, visitor_id)
  values ((now() at time zone 'Asia/Seoul')::date, p_visitor_id)
  on conflict (visit_day, visitor_id) do nothing;
end;
$$;

-- 공개하는 정보는 집계 숫자뿐입니다. 개별 방문 기록은 읽을 수 없습니다.
create or replace function public.eunbitdam_visit_stats()
returns jsonb language sql stable security definer set search_path = '' as $$
  with bounds as (
    select (now() at time zone 'Asia/Seoul')::date as today,
      date_trunc('month', now() at time zone 'Asia/Seoul')::date as month_start,
      date_trunc('year', now() at time zone 'Asia/Seoul')::date as year_start
  )
  select jsonb_build_object(
    'today', count(distinct v.visitor_id) filter (where v.visit_day = b.today),
    'month', count(distinct v.visitor_id) filter (where v.visit_day >= b.month_start),
    'year', count(distinct v.visitor_id) filter (where v.visit_day >= b.year_start),
    'total', count(distinct v.visitor_id),
    'as_of', b.today,
    'started_on', (select (started_at at time zone 'Asia/Seoul')::date
                   from public.eunbitdam_visit_settings where id = true)
  )
  from bounds b left join public.eunbitdam_visit_days v on v.visit_day <= b.today
  group by b.today;
$$;
revoke all on function public.eunbitdam_record_visit(uuid) from public, anon, authenticated;
revoke all on function public.eunbitdam_visit_stats() from public, anon, authenticated;
grant execute on function public.eunbitdam_record_visit(uuid) to anon, authenticated;
grant execute on function public.eunbitdam_visit_stats() to anon, authenticated;
notify pgrst, 'reload schema';
commit;
