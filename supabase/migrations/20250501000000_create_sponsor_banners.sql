-- Create sponsor_banners table
create table public.sponsor_banners (
  id uuid primary key default uuid_generate_v4(),
  message text not null,
  link text not null,
  link_text text not null,
  background_color text not null default 'bg-primary',
  text_color text not null default 'text-primary-foreground',
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Add RLS policies
alter table public.sponsor_banners enable row level security;

-- Allow public read access to banners within their date range
create policy "Allow public read access to active banners" 
  on public.sponsor_banners for select 
  using (current_timestamp >= start_date AND 
         current_timestamp <= end_date);

-- Allow admin users to manage banners
create policy "Allow admin users to manage banners" 
  on public.sponsor_banners for all 
  using (exists (select 1 from admin_users where user_id = auth.uid()));

-- Create function to validate date ranges
create or replace function public.validate_banner_date_range()
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
create trigger validate_banner_date_range
  before insert or update on public.sponsor_banners
  for each row
  execute function public.validate_banner_date_range();