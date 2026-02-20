/**
 * ════════════════════════════════════════════════════════════
 * ORBIT THREAD · Direct Messaging — Supabase Types
 * ════════════════════════════════════════════════════════════
 *
 * TypeScript type definitions for DM tables.
 * These types mirror the PostgreSQL schema exactly.
 */

// ── Database Row Types ─────────────────────────────────────

export interface DirectConversation {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface DirectConversationMember {
  id: string;
  conversation_id: string;
  user_id: string;
  joined_at: string;
}

export interface DirectMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  edited_at: string | null;
  deleted: boolean;
}

// ── Insert Types (fields the client provides) ──────────────

export interface DirectConversationInsert {
  id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DirectConversationMemberInsert {
  id?: string;
  conversation_id: string;
  user_id: string;
  joined_at?: string;
}

export interface DirectMessageInsert {
  id?: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at?: string;
  edited_at?: string | null;
  deleted?: boolean;
}

// ── Update Types (partial for PATCH operations) ────────────

export interface DirectMessageUpdate {
  content?: string;
  edited_at?: string;
  deleted?: boolean;
}

// ── Joined / Enriched Types (for UI consumption) ───────────

export interface ConversationWithDetails {
  id: string;
  created_at: string;
  updated_at: string;
  /** The other participant's profile */
  other_user: {
    id: string;
    name: string;
    handle: string;
    initials: string;
    avatar_color: string;
    status: string;
    is_verified: boolean;
  };
  /** Most recent message (null if no messages yet) */
  last_message: {
    content: string;
    sender_id: string;
    created_at: string;
  } | null;
  /** Count of unread messages (future: based on read cursors) */
  unread_count: number;
}

export interface DirectMessageWithSender {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  edited_at: string | null;
  deleted: boolean;
  sender: {
    id: string;
    name: string;
    initials: string;
    avatar_color: string;
    is_verified: boolean;
  };
}

// ── Realtime Payload Types ─────────────────────────────────

export interface RealtimeDirectMessagePayload {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: DirectMessage;
  old: DirectMessage | null;
}

// ── Function Return Types ──────────────────────────────────

export interface CreateConversationResult {
  conversation: DirectConversation;
  isExisting: boolean;
}

export interface DMError {
  code: string;
  message: string;
}
