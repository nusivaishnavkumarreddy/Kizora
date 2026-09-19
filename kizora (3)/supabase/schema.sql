-- Run this in the Supabase SQL Editor (Project > SQL Editor > New Query)

-- Profiles (extends Supabase auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "Profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Auto-create a profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Meetings: a meeting "room" that can be scheduled or instant, with a custom slug
create table if not exists meetings (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,          -- e.g. "acme-standup" -> becomes the join link
  host_id uuid references profiles(id) not null,
  title text default 'Meeting',
  password text,                       -- optional meeting password
  waiting_room boolean default false,
  max_participants int default 200,
  scheduled_for timestamptz,
  created_at timestamptz default now(),
  ended_at timestamptz
);

alter table meetings enable row level security;
create policy "Meetings are viewable by everyone with the slug" on meetings for select using (true);
create policy "Hosts can create meetings" on meetings for insert with check (auth.uid() = host_id);
create policy "Hosts can update their meetings" on meetings for update using (auth.uid() = host_id);

-- Participant sessions (for history / moderation / "who was in the call")
create table if not exists participant_sessions (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid references meetings(id) on delete cascade,
  user_id uuid references profiles(id),
  display_name text,
  joined_at timestamptz default now(),
  left_at timestamptz,
  role text default 'participant' -- 'host' | 'cohost' | 'participant'
);

alter table participant_sessions enable row level security;
create policy "Sessions viewable by everyone" on participant_sessions for select using (true);
create policy "Anyone can insert their own session" on participant_sessions for insert with check (true);
create policy "Users can update their own session" on participant_sessions for update using (true);

-- Chat messages (persisted meeting chat)
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid references meetings(id) on delete cascade,
  sender_name text,
  body text,
  created_at timestamptz default now()
);

alter table chat_messages enable row level security;
create policy "Chat viewable by everyone" on chat_messages for select using (true);
create policy "Anyone can post chat" on chat_messages for insert with check (true);

-- Reports (abuse / problem reports)
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid references meetings(id) on delete cascade,
  reporter_name text,
  type text, -- 'abuse' | 'problem'
  details text,
  created_at timestamptz default now()
);

alter table reports enable row level security;
create policy "Anyone can file a report" on reports for insert with check (true);

-- Recordings metadata (actual files land in Supabase Storage or S3 via LiveKit Egress)
create table if not exists recordings (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid references meetings(id) on delete cascade,
  file_url text,
  duration_seconds int,
  created_at timestamptz default now()
);

alter table recordings enable row level security;
create policy "Recordings viewable by everyone with link" on recordings for select using (true);
