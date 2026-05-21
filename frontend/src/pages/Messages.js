import React, { useCallback, useEffect, useState } from "react";
import { apiUrl } from "../config/api";

const getToken = () =>
  localStorage.getItem("token");

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch(apiUrl("/api/messages/my"), {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Unable to load messages.");
        return;
      }

      setError("");
      setMessages(Array.isArray(data) ? data : []);
      window.dispatchEvent(new Event("messagesUpdated"));
    } catch (err) {
      console.error(err);
      setError("Unable to load messages.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const sendMessage = async (e) => {
    e.preventDefault();

    const message = draft.trim();

    if (!message) {
      setError("Message cannot be empty.");
      return;
    }

    try {
      setSending(true);

      const res = await fetch(apiUrl("/api/messages/my"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Unable to send message.");
        return;
      }

      setError("");
      setDraft("");
      setMessages((current) => [...current, data]);
    } catch (err) {
      console.error(err);
      setError("Unable to send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="messages-page">
      <div className="messages-container">
        <h1 className="messages-title">Contact Admin</h1>

        {error && <div className="error-box">{error}</div>}

        <div className="chat-panel">
          <div className="message-list">
            {loading ? (
              <div className="empty-box">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="empty-box">
                Send your first inquiry to the LOADEX admin.
              </div>
            ) : (
              messages.map((item) => (
                <div
                  className={`message-row ${
                    item.sender_role === "user" ? "mine" : "admin"
                  }`}
                  key={item.id}
                >
                  <div className="message-bubble">
                    <span>
                      {item.sender_role === "user" ? "You" : "Admin"}
                    </span>
                    <p>{item.message}</p>
                    <small>{new Date(item.created_at).toLocaleString()}</small>
                  </div>
                </div>
              ))
            )}
          </div>

          <form className="message-form" onSubmit={sendMessage}>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type your inquiry"
              maxLength="1000"
            />
            <button type="submit" disabled={sending}>
              {sending ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>

      <style>{messageStyles}</style>
    </div>
  );
};

export const messageStyles = `
  .messages-page {
    width: 100%;
    min-height: 100vh;
    display: flex;
    justify-content: center;
  }

  .messages-container {
    width: 100%;
    max-width: 950px;
  }

  .messages-title {
    color: #00e5ff;
    font-size: 40px;
    margin-bottom: 30px;
    text-shadow: 0 0 15px #00e5ff;
  }

  .chat-panel,
  .thread-panel {
    background: #0c0c14;
    border: 1px solid rgba(0,255,255,0.18);
    border-radius: 14px;
    padding: 22px;
  }

  .message-list {
    min-height: 360px;
    max-height: 560px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding-right: 6px;
  }

  .message-row {
    display: flex;
  }

  .message-row.mine {
    justify-content: flex-end;
  }

  .message-row.admin {
    justify-content: flex-start;
  }

  .message-bubble {
    max-width: min(680px, 88%);
    padding: 14px 16px;
    border-radius: 12px;
    background: #10131d;
    border: 1px solid rgba(255,255,255,0.08);
  }

  .message-row.mine .message-bubble {
    border-color: rgba(0,229,255,0.35);
    box-shadow: 0 0 16px rgba(0,229,255,0.1);
  }

  .message-row.admin .message-bubble {
    border-color: rgba(255,0,170,0.35);
    box-shadow: 0 0 16px rgba(255,0,170,0.1);
  }

  .message-bubble span {
    display: block;
    margin-bottom: 8px;
    color: #00e5ff;
    font-size: 12px;
    font-weight: bold;
    text-transform: uppercase;
  }

  .message-row.admin .message-bubble span {
    color: #ff8fbf;
  }

  .message-bubble p {
    margin: 0;
    color: #eee;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }

  .message-bubble small {
    display: block;
    margin-top: 10px;
    color: #777;
  }

  .message-form {
    margin-top: 20px;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 12px;
  }

  .message-form textarea {
    min-height: 80px;
    resize: vertical;
    background: #151824;
    border: 1px solid rgba(0,255,255,0.16);
    border-radius: 8px;
    color: white;
    outline: none;
    padding: 13px;
  }

  .message-form button,
  .thread-btn {
    border: none;
    border-radius: 8px;
    background: #00c2d4;
    color: black;
    cursor: pointer;
    font-weight: bold;
    padding: 0 18px;
  }

  .message-form button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .error-box,
  .empty-box {
    margin-bottom: 18px;
    padding: 16px;
    border-radius: 10px;
  }

  .error-box {
    background: rgba(255, 0, 110, 0.14);
    border: 1px solid rgba(255, 0, 110, 0.5);
    color: #ff8fbf;
  }

  .empty-box {
    background: #10131d;
    border: 1px solid rgba(255,255,255,0.06);
    color: #888;
    text-align: center;
  }

  @media (max-width: 720px) {
    .messages-title {
      font-size: 32px;
    }

    .chat-panel,
    .thread-panel {
      padding: 16px;
    }

    .message-form {
      grid-template-columns: 1fr;
    }

    .message-form button {
      height: 44px;
    }
  }
`;

export default Messages;
