create table tool_ownership_claims (
  id uuid primary key default uuid_generate_v4(),
  tool_id uuid references ai_tools(id) not null,
  user_id uuid references auth.users(id) not null,
  submitter_name text not null,
  submitter_email text not null,
  verification_details text not null,
  status text not null default 'pending',
  admin_feedback text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

comment on table tool_ownership_claims is 'Stores tool ownership claim requests';
comment on column tool_ownership_claims.tool_id is 'Reference to the tool being claimed';
comment on column tool_ownership_claims.user_id is 'Reference to the user making the claim';
comment on column tool_ownership_claims.status is 'Status of the claim: pending, approved, rejected';
comment on column tool_ownership_claims.admin_feedback is 'Optional feedback from admin when rejecting a claim';

-- Add RLS policies
alter table tool_ownership_claims enable row level security;

-- Allow users to view their own claims
create policy "Users can view their own claims"
  on tool_ownership_claims for select
  using (auth.uid() = user_id);

-- Allow users to insert their own claims
create policy "Users can insert their own claims"
  on tool_ownership_claims for insert
  with check (auth.uid() = user_id);

-- Allow admins to view all claims
create policy "Admins can view all claims"
  on tool_ownership_claims for select
  using (auth.uid() in (select user_id from admin_users));

-- Allow admins to update all claims
create policy "Admins can update all claims"
  on tool_ownership_claims for update
  using (auth.uid() in (select user_id from admin_users));