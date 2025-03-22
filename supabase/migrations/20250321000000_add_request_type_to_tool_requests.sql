alter table tool_requests
add column request_type text not null default 'new';

alter table tool_requests
add column tool_id uuid references ai_tools(id);

comment on column tool_requests.request_type is 'Type of request: new or update';
comment on column tool_requests.tool_id is 'Reference to the tool being updated (for update requests only)';