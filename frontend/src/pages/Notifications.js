import React, { useCallback, useEffect, useState } from "react";
import { apiUrl } from "../config/api";

const getToken = () =>
  localStorage.getItem("token");

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch(apiUrl("/api/notifications"), {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Unable to load notifications.");
        return;
      }

      setError("");
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markRead = async (id) => {
    try {
      const res = await fetch(apiUrl(`/api/notifications/${id}/read`), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Unable to update notification.");
        return;
      }

      setNotifications((current) =>
        current.map((item) =>
          item.id === id ? { ...item, is_read: true } : item
        )
      );
      window.dispatchEvent(new Event("notificationsUpdated"));
    } catch (err) {
      console.error(err);
      setError("Unable to update notification.");
    }
  };

  const markAllRead = async () => {
    try {
      const res = await fetch(apiUrl("/api/notifications/read-all"), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Unable to update notifications.");
        return;
      }

      setNotifications((current) =>
        current.map((item) => ({ ...item, is_read: true }))
      );
      window.dispatchEvent(new Event("notificationsUpdated"));
    } catch (err) {
      console.error(err);
      setError("Unable to update notifications.");
    }
  };

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        <div className="notifications-heading">
          <h1>Notifications</h1>
          {unreadCount > 0 && (
            <button onClick={markAllRead}>Mark all read</button>
          )}
        </div>

        {error && <div className="error-box">{error}</div>}

        {loading ? (
          <div className="empty-box">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="empty-box">No order notifications yet.</div>
        ) : (
          <div className="notification-list">
            {notifications.map((item) => (
              <div
                className={`notification-card ${
                  item.is_read ? "" : "unread"
                }`}
                key={item.id}
              >
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.message}</p>
                  <small>{new Date(item.created_at).toLocaleString()}</small>
                </div>

                {!item.is_read && (
                  <button onClick={() => markRead(item.id)}>
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .notifications-page {
          width: 100%;
          min-height: 100vh;
          display: flex;
          justify-content: center;
        }

        .notifications-container {
          width: 100%;
          max-width: 900px;
        }

        .notifications-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 28px;
        }

        .notifications-heading h1 {
          margin: 0;
          color: #00e5ff;
          font-size: 40px;
          text-shadow: 0 0 15px #00e5ff;
        }

        .notifications-heading button,
        .notification-card button {
          border: none;
          border-radius: 8px;
          background: #00c2d4;
          color: black;
          cursor: pointer;
          font-weight: bold;
          padding: 12px 16px;
        }

        .notification-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .notification-card {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: center;
          padding: 20px;
          border-radius: 14px;
          background: #0c0c14;
          border: 1px solid rgba(255,255,255,0.08);
        }

        .notification-card.unread {
          border-color: rgba(0,229,255,0.38);
          box-shadow: 0 0 18px rgba(0,229,255,0.12);
        }

        .notification-card h3 {
          margin: 0 0 8px;
          color: white;
        }

        .notification-card p {
          margin: 0 0 10px;
          color: #bbb;
          line-height: 1.5;
        }

        .notification-card small {
          color: #777;
        }

        .error-box,
        .empty-box {
          padding: 16px;
          border-radius: 10px;
          margin-bottom: 18px;
        }

        .error-box {
          background: rgba(255, 0, 110, 0.14);
          border: 1px solid rgba(255, 0, 110, 0.5);
          color: #ff8fbf;
        }

        .empty-box {
          background: #0c0c14;
          border: 1px solid rgba(0,255,255,0.18);
          color: #888;
          text-align: center;
        }

        @media (max-width: 680px) {
          .notifications-heading {
            align-items: flex-start;
            flex-direction: column;
          }

          .notification-card {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default Notifications;
