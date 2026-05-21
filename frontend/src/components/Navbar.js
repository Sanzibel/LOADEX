import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {

  const navigate = useNavigate();
  const location = useLocation();

  const [cartCount, setCartCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

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

    const fetchUnreadCount = async () => {
      const token =
        localStorage.getItem("token");

      if (!token || isAdmin) {
        setUnreadCount(0);
        return;
      }

      try {
        const { apiUrl } =
          await import("../config/api");

        const res = await fetch(
          apiUrl("/api/notifications/unread-count"),
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const data =
          await res.json();

        if (res.ok) {
          setUnreadCount(data.count || 0);
        }
      } catch (err) {
        console.error(
          "Notification count error:",
          err
        );
      }
    };

    fetchUnreadCount();

    const handleCartUpdate = () => {
      updateCartCount();
    };

    const handleNotificationsUpdate = () => {
      fetchUnreadCount();
    };

    window.addEventListener(
      "cartUpdated",
      handleCartUpdate
    );

    window.addEventListener(
      "notificationsUpdated",
      handleNotificationsUpdate
    );

    return () => {

      window.removeEventListener(
        "cartUpdated",
        handleCartUpdate
      );

      window.removeEventListener(
        "notificationsUpdated",
        handleNotificationsUpdate
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
                className={`nav-link ${
                  location.pathname === "/admin/messages"
                    ? "active-link"
                    : ""
                }`}
                onClick={() => navigate("/admin/messages")}
              >
                Messages
              </span>
            </>
          )}

          {!isAdmin && (
            <>
              <span
                className={`nav-link ${
                  location.pathname === "/messages"
                    ? "active-link"
                    : ""
                }`}
                onClick={() => navigate("/messages")}
              >
                Contact
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

      <style>{`

        .navbar {
          position: fixed;
          top: 0;

          width: 100%;
          height: 70px;

          display: flex;
          justify-content: center;

          z-index: 100;

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
          cursor: pointer;

          transition: 0.2s;
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
        }

      `}</style>

    </div>
  );
};

export default Navbar;
