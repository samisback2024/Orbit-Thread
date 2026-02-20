-- ════════════════════════════════════════════════════════════
-- ORBIT THREAD · Direct Messaging Schema
-- Migration: 20260220100000_direct_messages
-- ════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────
-- 1. TABLES
-- ────────────────────────────────────────────────────────────

-- Conversations (1:1 or future group)
create table if not exists public.direct_conversations (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Conversation membership (who is in which conversation)
create table if not exists public.direct_conversation_members (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.direct_conversations(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  joined_at       timestamptz not null default now(),
  constraint uq_conversation_member unique (conversation_id, user_id)
);

-- Direct messages
create table if not exists public.direct_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.direct_conversations(id) on delete cascade,
  sender_id       uuid not null references auth.users(id) on delete cascade,
  content         text not null check (char_length(content) > 0 and char_length(content) <= 10000),
  created_at      timestamptz not null default now(),
  edited_at       timestamptz,
  deleted         boolean not null default false
);

-- ────────────────────────────────────────────────────────────
-- 2. INDEXES (optimized for scale: 1M users, 100M messages)
-- ────────────────────────────────────────────────────────────

-- Fast lookup: "which conversations does this user belong to?"
create index if not exists idx_dcm_user_id
  on public.direct_conversation_members(user_id);

-- Fast lookup: "who is in this conversation?"
create index if not exists idx_dcm_conversation_id
  on public.direct_conversation_members(conversation_id);

-- Fast lookup: messages in a conversation, ordered by time (covering index)
create index if not exists idx_dm_conversation_created
  on public.direct_messages(conversation_id, created_at desc);

-- Fast lookup: messages by sender
create index if not exists idx_dm_sender_id
  on public.direct_messages(sender_id);

-- Fast lookup: conversation updated_at for sorting conversation list
create index if not exists idx_dc_updated_at
  on public.direct_conversations(updated_at desc);

-- ────────────────────────────────────────────────────────────
-- 3. ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────────────────────

alter table public.direct_conversations enable row level security;
alter table public.direct_conversation_members enable row level security;
alter table public.direct_messages enable row level security;

-- ── direct_conversations ──

-- Users can only see conversations they are a member of
create policy "Members can view their conversations"
  on public.direct_conversations for select
  using (
    exists (
      select 1 from public.direct_conversation_members
      where conversation_id = direct_conversations.id
        and user_id = auth.uid()
    )
  );

-- Any authenticated user can create a conversation
create policy "Authenticated users can create conversations"
  on public.direct_conversations for insert
  with check (auth.uid() is not null);

-- Members can update conversation (for updated_at bumps)
create policy "Members can update their conversations"
  on public.direct_conversations for update
  using (
    exists (
      select 1 from public.direct_conversation_members
      where conversation_id = direct_conversations.id
        and user_id = auth.uid()
    )
  );

-- ── direct_conversation_members ──

-- Users can see members of conversations they belong to
create policy "Members can view conversation members"
  on public.direct_conversation_members for select
  using (
    exists (
      select 1 from public.direct_conversation_members as dcm
      where dcm.conversation_id = direct_conversation_members.conversation_id
        and dcm.user_id = auth.uid()
    )
  );

-- Users can only add themselves or others when creating a conversation
-- (insert requires caller is authenticated)
create policy "Authenticated users can add members"
  on public.direct_conversation_members for insert
  with check (auth.uid() is not null);

-- ── direct_messages ──

-- Users can only read messages in conversations they belong to
create policy "Members can read conversation messages"
  on public.direct_messages for select
  using (
    exists (
      select 1 from public.direct_conversation_members
      where conversation_id = direct_messages.conversation_id
        and user_id = auth.uid()
    )
  );

-- Users can only send messages to conversations they belong to, as themselves
create policy "Members can send messages"
  on public.direct_messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.direct_conversation_members
      where conversation_id = direct_messages.conversation_id
        and user_id = auth.uid()
    )
  );

-- Users can only edit/soft-delete their own messages
create policy "Senders can edit own messages"
  on public.direct_messages for update
  using (auth.uid() = sender_id);

-- ────────────────────────────────────────────────────────────
-- 4. FUNCTIONS
-- ────────────────────────────────────────────────────────────

-- Auto-update updated_at on direct_conversations when a new message is inserted
create or replace function public.update_conversation_timestamp()
returns trigger as $$
begin
  update public.direct_conversations
  set updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_dm_update_conversation_timestamp
  after insert on public.direct_messages
  for each row
  execute function public.update_conversation_timestamp();

-- Find existing 1:1 conversation between two users (prevents duplicates)
create or replace function public.find_dm_conversation(user_a uuid, user_b uuid)
returns uuid as $$
  select dcm1.conversation_id
  from public.direct_conversation_members dcm1
  inner join public.direct_conversation_members dcm2
    on dcm1.conversation_id = dcm2.conversation_id
  where dcm1.user_id = user_a
    and dcm2.user_id = user_b
  limit 1;
$$ language sql stable security definer;

-- ────────────────────────────────────────────────────────────
-- 5. REALTIME
-- ────────────────────────────────────────────────────────────

alter publication supabase_realtime add table public.direct_messages;
