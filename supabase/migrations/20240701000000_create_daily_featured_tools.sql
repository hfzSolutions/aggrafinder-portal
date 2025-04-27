-- Create a table to store daily featured tools
create table if not exists public.daily_featured_tools (
  id uuid primary key default uuid_generate_v4(),
  tool_id uuid not null references public.ai_tools(id) on delete cascade,
  feature_date date not null,
  created_at timestamp with time zone default now(),
  created_by uuid references auth.users(id) on delete set null,
  notes text
);

-- Add RLS policies
alter table public.daily_featured_tools enable row level security;

-- Only admins can manage daily featured tools
create policy "Admins can manage daily featured tools"
  on public.daily_featured_tools
  for all
  to authenticated
  using (
    exists (
      select 1 from public.admin_users
      where user_id = auth.uid()
    )
  );

-- Everyone can view daily featured tools
create policy "Everyone can view daily featured tools"
  on public.daily_featured_tools
  for select
  to anon, authenticated
  using (true);

-- Create function to get today's featured tool
create or replace function public.get_todays_featured_tool()
returns setof public.ai_tools
language sql
security definer
as $$
  select t.*
  from public.daily_featured_tools dft
  join public.ai_tools t on dft.tool_id = t.id
  where dft.feature_date = current_date
  and t.approval_status = 'approved'
  limit 1;
$$;