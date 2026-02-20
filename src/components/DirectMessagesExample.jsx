/**
 * ════════════════════════════════════════════════════════════
 * ORBIT THREAD · DirectMessages Example Component
 * ════════════════════════════════════════════════════════════
 *
 * Standalone example demonstrating how to use the DM hooks.
 * This is NOT used in production — it's a reference for
 * integrating the DM system into the main OrbitThreadApp.
 *
 * Usage:
 *   <DirectMessagesExample />
 *
 * Integration pattern:
 *   1. useConversations() in your sidebar/DM list
 *   2. useDirectMessages(conversationId) in your chat view
 *   3. useSendDirectMessage() for the message composer
 *   4. createConversation(userId) when starting a new DM
 */

import { useState, useEffect, useRef } from "react";
import { useConversations } from "../hooks/useConversations";
import { useDirectMessages } from "../hooks/useDirectMessages";
import { useSendDirectMessage } from "../hooks/useSendDirectMessage";
import { createConversation } from "../lib/dm";

export default function DirectMessagesExample() {
  const { conversations, loading: convLoading, error: convError } = useConversations();
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [msgInput, setMsgInput] = useState("");
  const msgsEndRef = useRef(null);

  const {
    messages,
    loading: msgsLoading,
    error: msgsError,
    addOptimisticMessage,
  } = useDirectMessages(activeConversationId);

  const {
    send,
    sending,
    error: sendError,
  } = useSendDirectMessage();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Start New Conversation ──
  const handleStartConversation = async (otherUserId) => {
    try {
      const { conversation } = await createConversation(otherUserId);
      setActiveConversationId(conversation.id);
    } catch (err) {
      console.error("Failed to create conversation:", err);
    }
  };

  // ── Send Message ──
  const handleSend = async () => {
    if (!activeConversationId || !msgInput.trim()) return;
    const content = msgInput;
    setMsgInput(""); // Clear input immediately
    await send(activeConversationId, content, addOptimisticMessage);
  };

  // ── Handle Enter Key ──
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>
      {/* ── Conversation List Sidebar ── */}
      <div style={{ width: 300, borderRight: "1px solid #333", overflow: "auto" }}>
        <h3 style={{ padding: 16 }}>Messages</h3>
        {convLoading && <div style={{ padding: 16 }}>Loading...</div>}
        {convError && <div style={{ padding: 16, color: "red" }}>{convError}</div>}
        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => setActiveConversationId(conv.id)}
            style={{
              padding: "12px 16px",
              cursor: "pointer",
              background: activeConversationId === conv.id ? "rgba(232,132,90,0.1)" : "transparent",
              borderBottom: "1px solid #222",
            }}
          >
            <div style={{ fontWeight: 600 }}>{conv.other_user.name}</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
              {conv.last_message?.content || "No messages yet"}
            </div>
            <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>
              {conv.last_message
                ? new Date(conv.last_message.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </div>
          </div>
        ))}
      </div>

      {/* ── Chat Area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {!activeConversationId ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center", color: "#888" }}>
              <div style={{ fontSize: 36 }}>💬</div>
              <div>Select a conversation</div>
            </div>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
              {msgsLoading && <div>Loading messages...</div>}
              {msgsError && <div style={{ color: "red" }}>{msgsError}</div>}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    marginBottom: 8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: msg._optimistic || msg.sender?.name === "You" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "70%",
                      padding: "8px 12px",
                      borderRadius: 12,
                      background: msg._optimistic ? "rgba(232,132,90,0.3)" : "#2a2520",
                      opacity: msg._optimistic ? 0.7 : 1,
                    }}
                  >
                    <div style={{ fontSize: 10, fontWeight: 600, marginBottom: 2 }}>
                      {msg.sender?.name || "Unknown"}
                    </div>
                    <div>{msg.content}</div>
                    <div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {msg.edited_at && " (edited)"}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={msgsEndRef} />
            </div>

            {/* Composer */}
            <div style={{ padding: "8px 16px", borderTop: "1px solid #333" }}>
              {sendError && (
                <div style={{ color: "red", fontSize: 12, marginBottom: 4 }}>
                  {sendError}
                </div>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <textarea
                  rows={1}
                  placeholder="Type a message..."
                  value={msgInput}
                  onChange={(e) => setMsgInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #444",
                    background: "#1a1a1a",
                    color: "#fff",
                    resize: "none",
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !msgInput.trim()}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "none",
                    background: sending ? "#666" : "#E8845A",
                    color: "#fff",
                    cursor: sending ? "not-allowed" : "pointer",
                  }}
                >
                  {sending ? "..." : "→"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
