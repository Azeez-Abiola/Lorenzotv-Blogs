-- Create analytics table
create table if not exists public.analytics (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  device_type text, -- 'mobile', 'tablet', 'desktop'
  browser text,
  os text,
  country text,
  referrer text,
  path text
);

-- Enable RLS
alter table public.analytics enable row level security;

-- Policies
create policy "Allow anon insert" on public.analytics for insert with check (true);
create policy "Allow admin select" on public.analytics for select using (
  auth.role() = 'service_role' or 
  auth.uid() in (select id from profiles where role = 'admin')
);
