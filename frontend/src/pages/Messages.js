import React, { useCallback, useEffect, useState } from "react";
import { apiUrl } from "../config/api";

const getToken = () =>
  localStorage.getItem("token");

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [imageData, setImageData] = useState("");
  const [imageName, setImageName] = useState("");
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

    if (!message && !imageData) {
      setError("Message or image is required.");
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
        body: JSON.stringify({
          message,
          imageUrl: imageData,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Unable to send message.");
        return;
      }

      setError("");
      setDraft("");
      setImageData("");
      setImageName("");
      setMessages((current) => [...current, data]);
    } catch (err) {
      console.error(err);
      setError("Unable to send message.");
    } finally {
      setSending(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be under 2MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setImageData(String(reader.result || ""));
      setImageName(file.name);
      setError("");
    };

    reader.onerror = () => {
      setError("Unable to read image.");
    };

    reader.readAsDataURL(file);
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
                    {item.message && <p>{item.message}</p>}
                    {item.image_url && (
                      <img
                        className="message-image"
                        src={item.image_url}
                        alt="Message attachment"
                      />
                    )}
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
            <div className="message-tools">
              <label className="image-picker">
                Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>

              {imageData && (
                <div className="image-preview">
                  <img src={imageData} alt="Selected attachment" />
                  <span>{imageName}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setImageData("");
                      setImageName("");
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
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

  .message-image {
    display: block;
    width: min(320px, 100%);
    max-height: 260px;
    margin-top: 10px;
    border-radius: 10px;
    object-fit: cover;
    border: 1px solid rgba(255,255,255,0.1);
  }

  .message-bubble small {
    display: block;
    margin-top: 10px;
    color: #777;
  }

  .message-form {
    margin-top: 20px;
    display: grid;
    grid-template-columns: 1fr 190px auto;
    gap: 12px;
    align-items: stretch;
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

  .message-tools {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .image-picker {
    height: 44px;
    display: grid;
    place-items: center;
    border-radius: 8px;
    border: 1px solid rgba(255,0,170,0.35);
    color: #ff8fbf;
    cursor: pointer;
    font-weight: bold;
  }

  .image-picker input {
    display: none;
  }

  .image-preview {
    display: grid;
    grid-template-columns: 42px 1fr;
    gap: 8px;
    align-items: center;
    padding: 8px;
    border-radius: 8px;
    background: #10131d;
    border: 1px solid rgba(255,255,255,0.08);
  }

  .image-preview img {
    width: 42px;
    height: 42px;
    border-radius: 6px;
    object-fit: cover;
  }

  .image-preview span {
    min-width: 0;
    color: #aaa;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .image-preview button {
    grid-column: 1 / -1;
    height: 30px;
    padding: 0;
    background: #252b3a;
    color: #ddd;
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
