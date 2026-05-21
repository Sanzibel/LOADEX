import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiUrl } from "../config/api";

const Navbar = () => {

  const navigate = useNavigate();
  const location = useLocation();

  const [cartCount, setCartCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messageUnreadCount, setMessageUnreadCount] = useState(0);
  const [toast, setToast] = useState(null);

  const notificationKeyRef = useRef("");
  const messageKeyRef = useRef("");
  const initializedRef = useRef(false);

  const role =
    localStorage.getItem("role");

  const isAdmin =
    role === "admin";

  const updateCartCount = () => {

    try {

      const cart =
        JSON.parse(
          localStorage.getItem("cart")
        ) || [];

      const count = cart.reduce(
        (sum, item) => sum + item.qty,
        0
      );

      setCartCount(count);

    } catch (err) {

      console.error(
        "Cart parse error:",
        err
      );

      setCartCount(0);
    }
  };

  useEffect(() => {

    updateCartCount();

    const showToast = (nextToast) => {
      setToast(nextToast);

      window.clearTimeout(
        window.loadexToastTimer
      );

      window.loadexToastTimer =
        window.setTimeout(() => {
          setToast(null);
        }, 4500);
    };

    const fetchUnreadCounts = async () => {
      const token =
        localStorage.getItem("token");

      if (!token) {
        setUnreadCount(0);
        setMessageUnreadCount(0);
        return;
      }

      try {
        const messagePath = isAdmin
          ? "/api/messages/admin/unread-count"
          : "/api/messages/my/unread-count";

        const messageRes = await fetch(
          apiUrl(messagePath),
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const messageData =
          await messageRes.json();

        if (messageRes.ok) {
          const count =
            messageData.count || 0;

          const latestAt =
            messageData.latestAt || "";

          const key =
            `${count}:${latestAt}`;

          setMessageUnreadCount(count);

          if (
            initializedRef.current &&
            count > 0 &&
            key !== messageKeyRef.current
          ) {
            showToast({
              type: "message",
              title: isAdmin
                ? "New customer message"
                : "New admin reply",
              body: isAdmin
                ? "A customer sent a message."
                : "The LOADEX admin replied to your inquiry.",
              path: isAdmin
                ? "/admin/messages"
                : "/messages",
            });
          }

          messageKeyRef.current = key;
        }

        if (!isAdmin) {
          const notificationRes = await fetch(
            apiUrl("/api/notifications/unread-count"),
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

          const notificationData =
            await notificationRes.json();

          if (notificationRes.ok) {
            const count =
              notificationData.count || 0;

            const latestAt =
              notificationData.latestAt || "";

            const key =
              `${count}:${latestAt}`;

            setUnreadCount(count);

            if (
              initializedRef.current &&
              count > 0 &&
              key !== notificationKeyRef.current
            ) {
              showToast({
                type: "status",
                title: "Order status update",
                body: "One of your LOADEX orders was updated.",
                path: "/notifications",
              });
            }

            notificationKeyRef.current = key;
          }
        } else {
          setUnreadCount(0);
        }
      } catch (err) {
        console.error(
          "Unread count error:",
          err
        );
      } finally {
        initializedRef.current = true;
      }
    };

    fetchUnreadCounts();

    const pollTimer =
      window.setInterval(
        fetchUnreadCounts,
        20000
      );

    const handleCartUpdate = () => {
      updateCartCount();
    };

    const handleNotificationsUpdate = () => {
      fetchUnreadCounts();
    };

    const handleMessagesUpdate = () => {
      fetchUnreadCounts();
    };

    window.addEventListener(
      "cartUpdated",
      handleCartUpdate
    );

    window.addEventListener(
      "notificationsUpdated",
      handleNotificationsUpdate
    );

    window.addEventListener(
      "messagesUpdated",
      handleMessagesUpdate
    );

    return () => {
      window.clearInterval(pollTimer);

      window.removeEventListener(
        "cartUpdated",
        handleCartUpdate
      );

      window.removeEventListener(
        "notificationsUpdated",
        handleNotificationsUpdate
      );

      window.removeEventListener(
        "messagesUpdated",
        handleMessagesUpdate
      );

    };

  }, [isAdmin]);

  return (
    <div className="navbar">

      <div className="navbar-inner">

        <div
          className="nav-left"
          onClick={() =>
            navigate(
              isAdmin
                ? "/admin/orders"
                : "/dashboard"
            )
          }
        >

          <span className="logo-icon">
            LO
          </span>

          <span className="logo-text">
            LOADEX
          </span>

        </div>

        <div className="nav-right">

          {isAdmin && (
            <>
              <span
                className={`nav-link ${
                  location.pathname === "/admin/orders"
                    ? "active-link"
                    : ""
                }`}
                onClick={() => navigate("/admin/orders")}
              >
                Orders
              </span>

              <span
                className={`nav-link ${
                  location.pathname === "/admin/products"
                    ? "active-link"
                    : ""
                }`}
                onClick={() => navigate("/admin/products")}
              >
                Products
              </span>

              <span
                className={`nav-link nav-badge-link ${
                  location.pathname === "/admin/messages"
                    ? "active-link"
                    : ""
                }`}
                onClick={() => navigate("/admin/messages")}
              >
                Messages
                {messageUnreadCount > 0 && (
                  <span className="cart-badge">
                    {messageUnreadCount}
                  </span>
                )}
              </span>
            </>
          )}

          {!isAdmin && (
            <>
              <span
                className={`nav-link nav-badge-link ${
                  location.pathname === "/messages"
                    ? "active-link"
                    : ""
                }`}
                onClick={() => navigate("/messages")}
              >
                Contact
                {messageUnreadCount > 0 && (
                  <span className="cart-badge">
                    {messageUnreadCount}
                  </span>
                )}
              </span>

              <div
                className={`cart-icon ${
                  location.pathname === "/notifications"
                    ? "active-link"
                    : ""
                }`}
                onClick={() => navigate("/notifications")}
              >
                <span className="cart-text">
                  Alerts
                </span>

                {unreadCount > 0 && (
                  <span className="cart-badge">
                    {unreadCount}
                  </span>
                )}
              </div>
            </>
          )}

          <span
            className={`nav-link ${
              location.pathname === "/account"
                ? "active-link"
                : ""
            }`}
            onClick={() => navigate("/account")}
          >
            Account
          </span>

          {!isAdmin && (

            <div
              className="cart-icon"
              onClick={() => navigate("/cart")}
            >

              <span className="cart-text">
                Cart
              </span>

              {cartCount > 0 && (

                <span className="cart-badge">
                  {cartCount}
                </span>

              )}

            </div>

          )}

        </div>

      </div>

      {toast && (
        <button
          className={`nav-toast ${toast.type}`}
          onClick={() => {
            setToast(null);
            navigate(toast.path);
          }}
        >
          <strong>{toast.title}</strong>
          <span>{toast.body}</span>
        </button>
      )}

      <style>{`

        .navbar {
          position: fixed;
          top: 0;

          width: 100%;
          height: 70px;

          display: flex;
          justify-content: center;

          z-index: 5000;

          background:
            rgba(5,6,13,0.75);

          backdrop-filter:
            blur(12px);

          border-bottom:
            1px solid rgba(0,255,255,0.15);
        }

        .navbar-inner {
          width: 100%;
          max-width: 1150px;

          padding: 0 25px;

          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-left {
          display: flex;
          align-items: center;
          gap: 10px;

          cursor: pointer;

          transition: 0.2s;
        }

        .nav-left:hover {
          transform: scale(1.05);
        }

        .logo-icon {
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: #00e5ff;
          color: #05070f;
          font-size: 11px;
          font-weight: bold;
        }

        .logo-text {
          font-weight: bold;

          background:
            linear-gradient(
              90deg,
              #00e5ff,
              #a855f7,
              #ff00aa
            );

          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 24px;

          color: #aaa;
        }

        .nav-link {
          position: relative;

          cursor: pointer;

          transition: 0.2s;
        }

        .nav-badge-link {
          display: inline-flex;
          align-items: center;
        }

        .nav-link:hover {
          color: #00e5ff;
        }

        .active-link {
          color: #00e5ff;

          text-shadow:
            0 0 10px #00e5ff;
        }

        .cart-icon {
          position: relative;

          display: flex;
          align-items: center;
          gap: 6px;

          cursor: pointer;

          transition: 0.2s;
        }

        .cart-icon:hover {
          color: #00e5ff;
        }

        .cart-badge {
          position: absolute;

          top: -8px;
          right: -12px;

          background: #ff00aa;

          color: white;

          font-size: 10px;

          padding: 3px 7px;

          border-radius: 999px;

          box-shadow:
            0 0 10px #ff00aa;
        }

        .nav-toast {
          position: fixed;
          top: 78px;
          left: 50%;
          z-index: 6000;
          width: min(450px, calc(100vw - 32px));
          min-height: 78px;
          padding: 16px;
          border-radius: 12px;
          border: 1px solid rgba(0,229,255,0.45);
          background: rgba(7, 10, 20, 0.98);
          color: white;
          text-align: left;
          cursor: pointer;
          transform: translateX(-50%);
          box-shadow:
            0 18px 40px rgba(0,0,0,0.55),
            0 0 24px rgba(0,229,255,0.22);
          backdrop-filter: blur(10px);
          transform-origin: top center;
          animation:
            toastDrop 0.42s cubic-bezier(.2,.9,.2,1.05),
            toastGlow 1.8s ease-in-out infinite alternate;
        }

        .nav-toast.message {
          border-color: rgba(255,0,170,0.45);
          box-shadow:
            0 18px 40px rgba(0,0,0,0.55),
            0 0 24px rgba(255,0,170,0.22);
        }

        .nav-toast strong,
        .nav-toast span {
          display: block;
        }

        .nav-toast strong {
          margin-bottom: 6px;
          color: #00e5ff;
        }

        .nav-toast.message strong {
          color: #ff8fbf;
        }

        .nav-toast span {
          color: #bbb;
          line-height: 1.4;
          opacity: 1;
        }

        @keyframes toastDrop {
          from {
            opacity: 0;
            transform: translate(-50%, -34px) scaleY(0.82);
          }

          to {
            opacity: 1;
            transform: translate(-50%, 0) scaleY(1);
          }
        }

        @keyframes toastGlow {
          from {
            filter: drop-shadow(0 0 0 rgba(0,229,255,0));
          }

          to {
            filter: drop-shadow(0 0 10px rgba(0,229,255,0.22));
          }
        }

        @media (max-width: 720px) {
          .navbar {
            height: auto;
          }

          .navbar-inner {
            min-height: 70px;
            padding: 12px 16px;
            align-items: flex-start;
            flex-direction: column;
            gap: 12px;
          }

          .nav-right {
            width: 100%;
            gap: 16px;
            flex-wrap: wrap;
          }

          .nav-toast {
            top: 128px;
          }
        }

      `}</style>

    </div>
  );
};

export default Navbar;
