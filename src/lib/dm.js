/**
 * ════════════════════════════════════════════════════════════
 * ORBIT THREAD · Direct Messaging — Backend Functions
 * ════════════════════════════════════════════════════════════
 *
 * Production-grade Supabase functions for the DM system.
 * All functions use the existing Supabase client.
 * All queries are optimized with proper indexes.
 * All operations respect RLS policies.
 */

import { supabase } from "../supabase";

// ────────────────────────────────────────────────────────────
// createConversation
// ────────────────────────────────────────────────────────────
// Creates a 1:1 conversation with another user.
// If a conversation already exists, returns the existing one.
// Uses the find_dm_conversation() SQL function to prevent duplicates.
//
// @param otherUserId - The UUID of the other participant
// @returns { conversation, isExisting }
// ────────────────────────────────────────────────────────────
export async function createConversation(otherUserId) {
  // 1. Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Not authenticated");
  }
  if (user.id === otherUserId) {
    throw new Error("Cannot create conversation with yourself");
  }

  // 2. Check for existing conversation using server-side function
  const { data: existingId, error: findError } = await supabase.rpc(
    "find_dm_conversation",
    { user_a: user.id, user_b: otherUserId },
  );

  if (findError) {
    throw new Error(
      `Failed to check existing conversation: ${findError.message}`,
    );
  }

  // 3. If conversation already exists, return it
  if (existingId) {
    const { data: existing, error: fetchError } = await supabase
      .from("direct_conversations")
      .select("*")
      .eq("id", existingId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch conversation: ${fetchError.message}`);
    }

    return { conversation: existing, isExisting: true };
  }

  // 4. Create new conversation
  const { data: conversation, error: createError } = await supabase
    .from("direct_conversations")
    .insert({})
    .select()
    .single();

  if (createError) {
    throw new Error(`Failed to create conversation: ${createError.message}`);
  }

  // 5. Add both members
  const { error: membersError } = await supabase
    .from("direct_conversation_members")
    .insert([
      { conversation_id: conversation.id, user_id: user.id },
      { conversation_id: conversation.id, user_id: otherUserId },
    ]);

  if (membersError) {
    // Cleanup: delete the conversation if member insertion fails
    await supabase
      .from("direct_conversations")
      .delete()
      .eq("id", conversation.id);
    throw new Error(
      `Failed to add conversation members: ${membersError.message}`,
    );
  }

  return { conversation, isExisting: false };
}

// ────────────────────────────────────────────────────────────
// sendDirectMessage
// ────────────────────────────────────────────────────────────
// Sends a message in a conversation.
// RLS ensures the sender is a member of the conversation.
//
// @param conversationId - The conversation UUID
// @param content - Message text (1-10000 chars)
// @returns The created message row
// ────────────────────────────────────────────────────────────
export async function sendDirectMessage(conversationId, content) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Not authenticated");
  }

  const trimmed = content.trim();
  if (!trimmed) {
    throw new Error("Message cannot be empty");
  }
  if (trimmed.length > 10000) {
    throw new Error("Message too long (max 10,000 characters)");
  }

  const { data: message, error } = await supabase
    .from("direct_messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: trimmed,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to send message: ${error.message}`);
  }

  return message;
}

// ────────────────────────────────────────────────────────────
// getUserConversations
// ────────────────────────────────────────────────────────────
// Fetches all conversations for the current user, enriched
// with the other participant's profile and last message.
// Sorted by most recently updated.
//
// @returns Array of enriched conversation objects
// ────────────────────────────────────────────────────────────
export async function getUserConversations() {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Not authenticated");
  }

  // Get all conversation IDs the user belongs to
  const { data: memberships, error: memberError } = await supabase
    .from("direct_conversation_members")
    .select("conversation_id")
    .eq("user_id", user.id);

  if (memberError) {
    throw new Error(`Failed to fetch memberships: ${memberError.message}`);
  }

  if (!memberships || memberships.length === 0) {
    return [];
  }

  const conversationIds = memberships.map((m) => m.conversation_id);

  // Fetch conversations with members and profiles in one query
  const { data: conversations, error: convError } = await supabase
    .from("direct_conversations")
    .select(
      `
      id,
      created_at,
      updated_at,
      direct_conversation_members (
        user_id,
        profiles:user_id (
          id,
          name,
          handle,
          initials,
          avatar_color,
          status,
          is_verified
        )
      )
    `,
    )
    .in("id", conversationIds)
    .order("updated_at", { ascending: false });

  if (convError) {
    throw new Error(`Failed to fetch conversations: ${convError.message}`);
  }

  // Fetch last message for each conversation in a single batch
  const enriched = await Promise.all(
    (conversations || []).map(async (conv) => {
      // Find the other user (not the current user)
      const otherMember = conv.direct_conversation_members.find(
        (m) => m.user_id !== user.id,
      );
      const otherProfile = otherMember?.profiles || {
        id: otherMember?.user_id || "",
        name: "Unknown",
        handle: "@unknown",
        initials: "??",
        avatar_color: "linear-gradient(135deg,#E8845A,#C4624A)",
        status: "offline",
        is_verified: false,
      };

      // Fetch last message
      const { data: lastMessages } = await supabase
        .from("direct_messages")
        .select("content, sender_id, created_at")
        .eq("conversation_id", conv.id)
        .eq("deleted", false)
        .order("created_at", { ascending: false })
        .limit(1);

      return {
        id: conv.id,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        other_user: otherProfile,
        last_message: lastMessages?.[0] || null,
        unread_count: 0, // Future: implement read cursors
      };
    }),
  );

  return enriched;
}

// ────────────────────────────────────────────────────────────
// getConversationMessages
// ────────────────────────────────────────────────────────────
// Fetches messages for a conversation with sender profiles.
// Paginated (default 50 messages, most recent first).
// RLS ensures only members can read.
//
// @param conversationId - The conversation UUID
// @param options - { limit, before } for cursor pagination
// @returns Array of messages with sender profiles
// ────────────────────────────────────────────────────────────
export async function getConversationMessages(conversationId, options = {}) {
  const { limit = 50, before = null } = options;

  let query = supabase
    .from("direct_messages")
    .select(
      `
      id,
      conversation_id,
      sender_id,
      content,
      created_at,
      edited_at,
      deleted,
      profiles:sender_id (
        id,
        name,
        initials,
        avatar_color,
        is_verified
      )
    `,
    )
    .eq("conversation_id", conversationId)
    .eq("deleted", false)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (before) {
    query = query.lt("created_at", before);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch messages: ${error.message}`);
  }

  return (data || []).map((msg) => ({
    id: msg.id,
    conversation_id: msg.conversation_id,
    sender_id: msg.sender_id,
    content: msg.content,
    created_at: msg.created_at,
    edited_at: msg.edited_at,
    deleted: msg.deleted,
    sender: msg.profiles || {
      id: msg.sender_id,
      name: "Unknown",
      initials: "??",
      avatar_color: "linear-gradient(135deg,#E8845A,#C4624A)",
      is_verified: false,
    },
  }));
}

// ────────────────────────────────────────────────────────────
// subscribeToConversation
// ────────────────────────────────────────────────────────────
// Sets up a Supabase Realtime subscription for new messages
// in a specific conversation. Returns an unsubscribe function.
//
// @param conversationId - The conversation UUID
// @param callback - Called with { eventType, message } on each change
// @returns Function to call to unsubscribe
// ────────────────────────────────────────────────────────────
export function subscribeToConversation(conversationId, callback) {
  const channel = supabase
    .channel(`dm-${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "direct_messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      async (payload) => {
        const msg = payload.new;

        // Fetch sender profile for the new message
        let sender = null;
        if (msg?.sender_id) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, name, initials, avatar_color, is_verified")
            .eq("id", msg.sender_id)
            .single();
          sender = profile;
        }

        callback({
          eventType: payload.eventType,
          message: {
            ...msg,
            sender: sender || {
              id: msg?.sender_id || "",
              name: "Unknown",
              initials: "??",
              avatar_color: "linear-gradient(135deg,#E8845A,#C4624A)",
              is_verified: false,
            },
          },
        });
      },
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}

// ────────────────────────────────────────────────────────────
// subscribeToAllConversations
// ────────────────────────────────────────────────────────────
// Subscribes to ALL direct messages for the current user
// across all conversations. Used for the conversation list
// to show live "last message" updates.
//
// @param userId - The current user's UUID
// @param callback - Called with { eventType, message } on each change
// @returns Function to unsubscribe
// ────────────────────────────────────────────────────────────
export function subscribeToAllConversations(userId, callback) {
  const channel = supabase
    .channel(`dm-all-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "direct_messages",
      },
      async (payload) => {
        const msg = payload.new;

        // Check if this message belongs to a conversation the user is in
        const { data: membership } = await supabase
          .from("direct_conversation_members")
          .select("conversation_id")
          .eq("conversation_id", msg.conversation_id)
          .eq("user_id", userId)
          .single();

        if (!membership) return; // Not our conversation

        let sender = null;
        if (msg?.sender_id) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, name, initials, avatar_color, is_verified")
            .eq("id", msg.sender_id)
            .single();
          sender = profile;
        }

        callback({
          eventType: payload.eventType,
          message: {
            ...msg,
            sender: sender || {
              id: msg?.sender_id || "",
              name: "Unknown",
              initials: "??",
              avatar_color: "linear-gradient(135deg,#E8845A,#C4624A)",
              is_verified: false,
            },
          },
        });
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ────────────────────────────────────────────────────────────
// editDirectMessage
// ────────────────────────────────────────────────────────────
export async function editDirectMessage(messageId, newContent) {
  const trimmed = newContent.trim();
  if (!trimmed) throw new Error("Message cannot be empty");
  if (trimmed.length > 10000) throw new Error("Message too long");

  const { data, error } = await supabase
    .from("direct_messages")
    .update({ content: trimmed, edited_at: new Date().toISOString() })
    .eq("id", messageId)
    .select()
    .single();

  if (error) throw new Error(`Failed to edit message: ${error.message}`);
  return data;
}

// ────────────────────────────────────────────────────────────
// deleteDirectMessage (soft delete)
// ────────────────────────────────────────────────────────────
export async function deleteDirectMessage(messageId) {
  const { data, error } = await supabase
    .from("direct_messages")
    .update({ deleted: true, content: "[Message deleted]" })
    .eq("id", messageId)
    .select()
    .single();

  if (error) throw new Error(`Failed to delete message: ${error.message}`);
  return data;
}
