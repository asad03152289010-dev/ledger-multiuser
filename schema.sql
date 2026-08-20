-- Run this whole file in Supabase: left sidebar -> SQL Editor -> New query -> paste -> Run

create table entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null default auth.uid(),
  date date not null,
  amount numeric not null,
  source text not null,
  payee text not null,
  category text not null,
  note text default '',
  origin text default 'manual',
  created_at timestamptz default now()
);

create table budgets (
  user_id uuid references auth.users not null default auth.uid(),
  overall numeric default 0,
  categories jsonb default '{}'::jsonb,
  primary key (user_id)
);

create table accounts (
  user_id uuid references auth.users not null default auth.uid(),
  name text not null,
  balance numeric not null,
  primary key (user_id, name)
);

create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null default auth.uid(),
  subscription jsonb not null,
  created_at timestamptz default now()
);

alter table entries enable row level security;
alter table budgets enable row level security;
alter table accounts enable row level security;
alter table push_subscriptions enable row level security;

create policy "own entries" on entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own budgets" on budgets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own accounts" on accounts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own subscriptions" on push_subscriptions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
