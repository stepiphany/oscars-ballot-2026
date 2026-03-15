-- Run this in your Supabase SQL editor to set up the database

-- Rooms: one per watch party
create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text default 'Oscars Ballot',
  created_at timestamptz default now(),
  locked_at timestamptz
);

-- Participants: one per person in a room
create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade not null,
  display_name text not null,
  ballot jsonb default '{}',
  joined_at timestamptz default now()
);

-- Results: official winners (entered by admin during ceremony)
create table if not exists results (
  category_id text primary key,
  winner_id text not null,
  announced_at timestamptz default now()
);

-- Enable realtime (run in SQL editor after tables exist):
-- alter publication supabase_realtime add table participants;
-- alter publication supabase_realtime add table results;

-- RLS: allow anonymous read/write for simplicity (no auth)
alter table rooms enable row level security;
alter table participants enable row level security;
alter table results enable row level security;

create policy "Allow all on rooms" on rooms for all using (true) with check (true);
create policy "Allow all on participants" on participants for all using (true) with check (true);
create policy "Allow all on results" on results for all using (true) with check (true);
