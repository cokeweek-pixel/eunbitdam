-- Supabase SQL Editor에서 관리자 확인 후 1회 실행
create table if not exists public.community_posts (
 id bigint generated always as identity primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 nickname text not null default '은빛손님',
 body text not null check (char_length(trim(body)) between 1 and 150),
 created_at timestamptz not null default now()
);
alter table public.community_posts enable row level security;
create policy "Community posts public read" on public.community_posts for select to anon,authenticated using(true);
create policy "Community posts member insert" on public.community_posts for insert to authenticated with check(auth.uid()=user_id);
create policy "Community posts author delete" on public.community_posts for delete to authenticated using(auth.uid()=user_id);
create or replace function public.community_set_nickname() returns trigger language plpgsql security definer set search_path=public as $$
begin
 new.nickname:=left(coalesce(nullif(trim((select raw_user_meta_data->>'nickname' from auth.users where id=auth.uid())),''),'은빛손님'),20);
 return new;
end;$$;
drop trigger if exists community_nickname_trigger on public.community_posts;
create trigger community_nickname_trigger before insert on public.community_posts for each row execute function public.community_set_nickname();
-- 공개 게시판이므로 운영 전 Supabase 대시보드에서 인증 이메일, CAPTCHA 및 악성 게시글 관리 설정 확인 필요.
