/**
 * ════════════════════════════════════════════════════════════
 * ORBIT THREAD · useConversations Hook
 * ════════════════════════════════════════════════════════════
 *
 * Fetches and manages the user's conversation list with
 * realtime updates for new messages across all conversations.
 *
 * Returns:
 *   conversations - Array of enriched conversation objects
 *   loading       - Boolean for initial load
 *   error         - Error string or null
 *   refresh       - Function to manually re-fetch
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { getUserConversations, subscribeToAllConversations } from "../lib/dm";
import { supabase } from "../supabase";

export function useConversations() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const unsubRef = useRef(null);

  const fetchConversations = useCallback(async () => {
    try {
      setError(null);
      const data = await getUserConversations();
      setConversations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      await fetchConversations();

      // Get current user for subscription
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !mounted) return;

      // Subscribe to all new messages across conversations
      unsubRef.current = subscribeToAllConversations(user.id, ({ message }) => {
        if (!mounted) return;

        // Update the conversation list: bump last_message and reorder
        setConversations((prev) => {
          const updated = prev.map((conv) => {
            if (conv.id === message.conversation_id) {
              return {
                ...conv,
                updated_at: message.created_at,
                last_message: {
                  content: message.content,
                  sender_id: message.sender_id,
                  created_at: message.created_at,
                },
              };
            }
            return conv;
          });

          // Sort by most recent message
          return updated.sort(
            (a, b) =>
              new Date(b.updated_at).getTime() -
              new Date(a.updated_at).getTime(),
          );
        });
      });
    };

    init();

    return () => {
      mounted = false;
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
  }, [fetchConversations]);

  return {
    conversations,
    loading,
    error,
    refresh: fetchConversations,
  };
}
