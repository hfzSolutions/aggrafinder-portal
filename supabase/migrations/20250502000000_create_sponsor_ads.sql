-- Create sponsor_ads table
create table public.sponsor_ads (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  image_url text not null,
  link text not null,
  link_text text not null default 'Learn More',
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  is_active boolean default true,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Add RLS policies
alter table public.sponsor_ads enable row level security;

-- Allow public read access to ads within their date range
create policy "Allow public read access to active ads" 
  on public.sponsor_ads for select 
  using (current_timestamp >= start_date AND 
         current_timestamp <= end_date AND
         is_active = true);

-- Allow admin users to manage ads
create policy "Allow admin users to manage ads" 
  on public.sponsor_ads for all 
  using (exists (select 1 from admin_users where user_id = auth.uid()));

-- Create function to validate date ranges
create or replace function public.validate_ad_date_range()
returns trigger as $$
begin
  -- Validate date range
  if new.start_date > new.end_date then
    raise exception 'Start date must be before end date';
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger to validate date ranges
create trigger validate_ad_date_range
  before insert or update on public.sponsor_ads
  for each row
  execute function public.validate_ad_date_range();