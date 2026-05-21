import React, { useCallback, useEffect, useState } from "react";
import { apiUrl } from "../config/api";
import { messageStyles } from "./Messages";

const getToken = () =>
  localStorage.getItem("token");

const AdminMessages = () => {
  const [threads, setThreads] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [thread, setThread] = useState(null);
  const [draft, setDraft] = useState("");
  const [imageData, setImageData] = useState("");
  const [imageName, setImageName] = useState("");
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const fetchThreads = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch(apiUrl("/api/messages/admin/threads"), {
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
      setThreads(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Unable to load messages.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchThread = useCallback(async (userId) => {
    try {
      setThreadLoading(true);

      const res = await fetch(apiUrl(`/api/messages/admin/threads/${userId}`), {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Unable to load conversation.");
        return;
      }

      setError("");
      setThread(data);
      window.dispatchEvent(new Event("messagesUpdated"));
    } catch (err) {
      console.error(err);
      setError("Unable to load conversation.");
    } finally {
      setThreadLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  useEffect(() => {
    if (selectedUserId) {
      fetchThread(selectedUserId);
    }
  }, [selectedUserId, fetchThread]);

  const sendReply = async (e) => {
    e.preventDefault();

    const message = draft.trim();

    if (!selectedUserId || (!message && !imageData)) {
      setError("Reply or image is required.");
      return;
    }

    try {
      setSending(true);

      const res = await fetch(
        apiUrl(`/api/messages/admin/threads/${selectedUserId}`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            message,
            imageUrl: imageData,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Unable to send reply.");
        return;
      }

      setError("");
      setDraft("");
      setImageData("");
      setImageName("");
      setThread((current) => ({
        ...current,
        messages: [...(current?.messages || []), data],
      }));
      fetchThreads();
    } catch (err) {
      console.error(err);
      setError("Unable to send reply.");
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
    <div className="admin-messages-page">
      <div className="admin-messages-container">
        <h1 className="admin-messages-title">Customer Messages</h1>

        {error && <div className="error-box">{error}</div>}

        <div className="admin-message-grid">
          <div className="thread-list">
            {loading ? (
              <div className="empty-box">Loading threads...</div>
            ) : threads.length === 0 ? (
              <div className="empty-box">No customer messages yet.</div>
            ) : (
              threads.map((item) => (
                <button
                  className={`thread-card ${
                    Number(selectedUserId) === Number(item.user_id)
                      ? "active"
                      : ""
                  }`}
                  key={item.user_id}
                  onClick={() => setSelectedUserId(item.user_id)}
                >
                  <strong>{item.name}</strong>
                  <span>{item.email}</span>
                  <p>{item.last_message}</p>
                  <small>
                    {new Date(item.last_message_at).toLocaleString()}
                  </small>
                </button>
              ))
            )}
          </div>

          <div className="thread-panel">
            {!selectedUserId ? (
              <div className="empty-box">Select a customer conversation.</div>
            ) : threadLoading ? (
              <div className="empty-box">Loading conversation...</div>
            ) : (
              <>
                <div className="thread-heading">
                  <h2>{thread?.customer?.name}</h2>
                  <span>{thread?.customer?.email}</span>
                </div>

                <div className="message-list">
                  {(thread?.messages || []).map((item) => (
                    <div
                      className={`message-row ${
                        item.sender_role === "admin" ? "mine" : "admin"
                      }`}
                      key={item.id}
                    >
                      <div className="message-bubble">
                        <span>
                          {item.sender_role === "admin" ? "Admin" : "Customer"}
                        </span>
                        {item.message && <p>{item.message}</p>}
                        {item.image_url && (
                          <img
                            className="message-image"
                            src={item.image_url}
                            alt="Message attachment"
                          />
                        )}
                        <small>
                          {new Date(item.created_at).toLocaleString()}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>

                <form className="message-form" onSubmit={sendReply}>
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type your reply"
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
                    {sending ? "Sending..." : "Reply"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{messageStyles}</style>
      <style>{`
        .admin-messages-page {
          width: 100%;
          min-height: 100vh;
          display: flex;
          justify-content: center;
        }

        .admin-messages-container {
          width: 100%;
          max-width: 1150px;
        }

        .admin-messages-title {
          color: #ff00aa;
          font-size: 40px;
          margin-bottom: 30px;
          text-shadow: 0 0 15px #ff00aa;
        }

        .admin-message-grid {
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 18px;
          align-items: start;
        }

        .thread-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .thread-card {
          text-align: left;
          padding: 16px;
          border-radius: 12px;
          background: #0c0c14;
          border: 1px solid rgba(0,255,255,0.14);
          color: white;
          cursor: pointer;
        }

        .thread-card.active {
          border-color: #00e5ff;
          box-shadow: 0 0 18px rgba(0,229,255,0.16);
        }

        .thread-card strong,
        .thread-card span,
        .thread-card small {
          display: block;
        }

        .thread-card span,
        .thread-card small {
          color: #888;
        }

        .thread-card p {
          margin: 10px 0;
          color: #ccc;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .thread-heading {
          margin-bottom: 18px;
          padding-bottom: 18px;
          border-bottom: 1px solid #222;
        }

        .thread-heading h2 {
          margin: 0 0 6px;
          color: #00e5ff;
        }

        .thread-heading span {
          color: #888;
        }

        @media (max-width: 900px) {
          .admin-message-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminMessages;
