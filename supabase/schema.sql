-- =====================================================================
-- ADAM DEUTSCH TRAINER - schemat bazy Supabase (PostgreSQL)
-- Uruchom w Supabase: SQL Editor → New query → wklej → Run.
-- Bezpieczeństwo: RLS włączone na wszystkich tabelach; każdy użytkownik
-- widzi i modyfikuje WYŁĄCZNIE własne wiersze (auth.uid()).
-- Frontend używa tylko klucza anon/publishable. service_role NIGDY w aplikacji.
-- =====================================================================

-- 1) Profil + pełny snapshot postępu (szybkie wczytanie na nowym urządzeniu)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  settings jsonb not null default '{}'::jsonb,
  progress jsonb,
  progress_updated_at timestamptz,
  created_at timestamptz not null default now()
);

-- 2) Sesje nauki
create table if not exists public.study_sessions (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  mode text not null,
  label text,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  active_sec integer not null default 0 check (active_sec >= 0),
  questions integer not null default 0,
  correct integer not null default 0,
  xp integer not null default 0
);
create index if not exists study_sessions_user_idx on public.study_sessions (user_id, started_at desc);

-- 3) Każda odpowiedź (question attempts / answers)
create table if not exists public.question_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  question_id text not null,
  topic_id text not null,
  category text not null,
  correct boolean not null,
  score real not null check (score between 0 and 1),
  mode text not null,
  answered_at timestamptz not null default now()
);
create index if not exists question_attempts_user_idx on public.question_attempts (user_id, answered_at desc);
create index if not exists question_attempts_topic_idx on public.question_attempts (user_id, topic_id);

-- 4) Mastery per temat
create table if not exists public.mastery (
  user_id uuid not null references auth.users (id) on delete cascade,
  topic_id text not null,
  attempts integer not null default 0,
  correct integer not null default 0,
  score real not null default 0.5,          -- EWMA 0..1
  status text not null check (status in ('new','learning','weak','good','mastered')),
  manual_mastered boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, topic_id)
);

-- 5) Moje błędy
create table if not exists public.mistakes (
  user_id uuid not null references auth.users (id) on delete cascade,
  question_id text not null,
  count integer not null default 1,
  last_given text,
  expected text,
  resolved boolean not null default false,
  flagged boolean not null default false,
  first_at timestamptz not null default now(),
  last_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

-- 6) Próbne konkursy
create table if not exists public.mock_exams (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  stage text not null check (stage in ('szkolny','rejonowy','wojewodzki')),
  started_at timestamptz not null,
  finished_at timestamptz not null,
  duration_sec integer not null,
  points integer not null,
  max_points integer not null,
  percent integer not null check (percent between 0 and 100),
  by_category jsonb not null default '{}'::jsonb,
  items jsonb not null default '[]'::jsonb
);
create index if not exists mock_exams_user_idx on public.mock_exams (user_id, finished_at desc);

-- 7) Osiągnięcia
create table if not exists public.achievements (
  user_id uuid not null references auth.users (id) on delete cascade,
  achievement_id text not null,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

-- 8) Historia nauki (dzienna)
create table if not exists public.daily_activity (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  questions integer not null default 0,
  correct integer not null default 0,
  active_sec integer not null default 0,
  primary key (user_id, day)
);

-- ===================== ROW LEVEL SECURITY =====================
alter table public.profiles          enable row level security;
alter table public.study_sessions    enable row level security;
alter table public.question_attempts enable row level security;
alter table public.mastery           enable row level security;
alter table public.mistakes          enable row level security;
alter table public.mock_exams        enable row level security;
alter table public.achievements      enable row level security;
alter table public.daily_activity    enable row level security;

-- profiles: klucz = id
drop policy if exists "own profile select" on public.profiles;
drop policy if exists "own profile insert" on public.profiles;
drop policy if exists "own profile update" on public.profiles;
create policy "own profile select" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "own profile insert" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "own profile update" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- pozostałe tabele: klucz = user_id (select / insert / update / delete tylko własne)
do $$
declare t text;
begin
  foreach t in array array['study_sessions','question_attempts','mastery','mistakes','mock_exams','achievements','daily_activity'] loop
    execute format('drop policy if exists "own rows select" on public.%I', t);
    execute format('drop policy if exists "own rows insert" on public.%I', t);
    execute format('drop policy if exists "own rows update" on public.%I', t);
    execute format('drop policy if exists "own rows delete" on public.%I', t);
    execute format('create policy "own rows select" on public.%I for select to authenticated using ((select auth.uid()) = user_id)', t);
    execute format('create policy "own rows insert" on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)', t);
    execute format('create policy "own rows update" on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t);
    execute format('create policy "own rows delete" on public.%I for delete to authenticated using ((select auth.uid()) = user_id)', t);
  end loop;
end $$;

-- Anonimowi (rola anon) nie mają żadnych uprawnień - brak polityk dla anon = brak dostępu.
