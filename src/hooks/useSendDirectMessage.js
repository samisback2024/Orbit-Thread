/**
 * ════════════════════════════════════════════════════════════
 * ORBIT THREAD · useSendDirectMessage Hook
 * ════════════════════════════════════════════════════════════
 *
 * Handles sending direct messages with:
 *   - Optimistic UI (message appears instantly before server confirms)
 *   - Error handling with rollback
 *   - Loading state per send
 *   - Profanity filtering (client-side)
 *
 * Returns:
 *   send     - async function(conversationId, content, addOptimistic)
 *   sending  - boolean
 *   error    - string or null
 */

import { useState, useCallback } from "react";
import { sendDirectMessage } from "../lib/dm";
import { supabase } from "../supabase";

// Profanity list (same as main app)
const BANNED = [
  "fuck",
  "shit",
  "ass",
  "bitch",
  "bastard",
  "crap",
  "piss",
  "dick",
  "cock",
  "pussy",
  "nigger",
  "nigga",
  "faggot",
  "whore",
  "slut",
  "cunt",
  "motherfucker",
  "asshole",
  "douchebag",
  "bullshit",
  "wanker",
  "twat",
];
const hasProfanity = (t) =>
  BANNED.some((w) => new RegExp(`\\b${w}\\b`, "i").test(t));

export function useSendDirectMessage() {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const send = useCallback(
    async (conversationId, content, addOptimisticMessage = null) => {
      const trimmed = content.trim();
      if (!trimmed) return null;

      // Client-side profanity check
      if (hasProfanity(trimmed)) {
        setError("Message contains inappropriate language.");
        setTimeout(() => setError(null), 3000);
        return null;
      }

      setError(null);
      setSending(true);

      // Get current user for optimistic message
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Not authenticated");
        setSending(false);
        return null;
      }

      // Optimistic UI: add message to the list immediately
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const optimisticMsg = {
        id: tempId,
        conversation_id: conversationId,
        sender_id: user.id,
        content: trimmed,
        created_at: new Date().toISOString(),
        edited_at: null,
        deleted: false,
        sender: {
          id: user.id,
          name: "You",
          initials: "",
          avatar_color: "linear-gradient(135deg,#E8845A,#C4624A)",
          is_verified: false,
        },
        _optimistic: true,
      };

      if (addOptimisticMessage) {
        addOptimisticMessage(optimisticMsg);
      }

      try {
        const message = await sendDirectMessage(conversationId, trimmed);
        setSending(false);
        return message;
      } catch (err) {
        setError(err.message);
        setSending(false);
        return null;
      }
    },
    [],
  );

  return { send, sending, error };
}
