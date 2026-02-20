/**
 * ════════════════════════════════════════════════════════════
 * ORBIT THREAD · useDirectMessages Hook
 * ════════════════════════════════════════════════════════════
 *
 * Fetches and manages messages for a single conversation
 * with realtime updates via Supabase Realtime WebSocket.
 *
 * Features:
 *   - Initial message fetch on mount
 *   - Realtime INSERT subscription (new messages appear instantly)
 *   - Realtime UPDATE subscription (edits reflected)
 *   - Deduplication (prevents double-render from optimistic + realtime)
 *   - Auto-cleanup on unmount
 *
 * Returns:
 *   messages - Array of messages with sender profiles
 *   loading  - Boolean for initial load
 *   error    - Error string or null
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { getConversationMessages, subscribeToConversation } from "../lib/dm";
import { supabase } from "../supabase";

export function useDirectMessages(conversationId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const unsubRef = useRef(null);
  const currentUserRef = useRef(null);

  // Fetch messages for the conversation
  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    try {
      setError(null);
      setLoading(true);
      const data = await getConversationMessages(conversationId);
      setMessages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    let mounted = true;

    const init = async () => {
      // Get current user for deduplication
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) currentUserRef.current = user.id;

      await fetchMessages();

      if (!mounted) return;

      // Subscribe to realtime changes
      unsubRef.current = subscribeToConversation(
        conversationId,
        ({ eventType, message }) => {
          if (!mounted) return;

          if (eventType === "INSERT") {
            setMessages((prev) => {
              // Deduplicate: check if message already exists (from optimistic insert)
              const exists = prev.some((m) => m.id === message.id);
              if (exists) return prev;

              // Also replace any optimistic placeholder with matching content
              const withoutOptimistic = prev.filter((m) => {
                if (!m._optimistic) return true;
                // If the optimistic message was from us and has same content, remove it
                return !(
                  m.sender_id === message.sender_id &&
                  m.content === message.content &&
                  m._optimistic
                );
              });

              return [...withoutOptimistic, message];
            });
          } else if (eventType === "UPDATE") {
            setMessages((prev) =>
              prev.map((m) => (m.id === message.id ? { ...m, ...message } : m)),
            );
          }
        },
      );
    };

    init();

    return () => {
      mounted = false;
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
  }, [conversationId, fetchMessages]);

  // Optimistically add a message to the UI immediately
  const addOptimisticMessage = useCallback((tempMessage) => {
    setMessages((prev) => [...prev, { ...tempMessage, _optimistic: true }]);
  }, []);

  return {
    messages,
    loading,
    error,
    addOptimisticMessage,
  };
}
