import React, {
  useCallback,
  useEffect,
  useState
} from "react";

import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config/api";

const Account = ({ onLogout }) => {

  const navigate =
    useNavigate();

  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const handleLogout = useCallback(() => {

    onLogout();

    navigate("/login");
  }, [navigate, onLogout]);

  const fetchProfile = useCallback(async () => {

    try {

      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        handleLogout();
        return;
      }

      const res = await fetch(
        apiUrl("/api/auth/profile"),
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await res.json();

      if (!res.ok || !data.user) {
        setError(data.message || "Unable to load account.");
        handleLogout();
        return;
      }

      setUser(data.user);

    } catch (err) {

      console.error(err);
      setError("Unable to load account. Please log in again.");

    } finally {

      setLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {

    fetchProfile();

  }, [fetchProfile]);

  if (loading) {

    return (
      <AccountShell>
        <h2>Loading account...</h2>
        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>
      </AccountShell>
    );
  }

  if (error || !user) {

    return (
      <AccountShell>
        <h2>Account unavailable</h2>
        <p>{error || "Please log in again."}</p>
        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          Back to Login
        </button>
      </AccountShell>
    );
  }

  return (
    <div className="account-page">

      <div className="account-container">

        <h1 className="account-title">
          My Account
        </h1>

        <div className="account-card">

          <h2>
            {user.name}
          </h2>

          <p>
            {user.email}
          </p>

          <div className="role-badge">
            {user.role}
          </div>

          <div className="button-group">

            {user.role !== "admin" && (
              <>
                <button
                  onClick={() =>
                    navigate("/my-orders")
                  }
                >
                  My Orders
                </button>

                <button
                  onClick={() =>
                    navigate("/messages")
                  }
                >
                  Contact Admin
                </button>

                <button
                  onClick={() =>
                    navigate("/notifications")
                  }
                >
                  Notifications
                </button>
              </>
            )}

            {user.role === "admin" && (
              <>

                <button
                  onClick={() =>
                    navigate("/admin/orders")
                  }
                >
                  Admin Orders
                </button>

                <button
                  onClick={() =>
                    navigate("/admin/products")
                  }
                >
                  Manage Products
                </button>

                <button
                  onClick={() =>
                    navigate("/admin/messages")
                  }
                >
                  Customer Messages
                </button>

              </>
            )}

            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>

        </div>

      </div>

      <style>{accountStyles}</style>

    </div>
  );
};

const AccountShell = ({ children }) => (
  <div className="account-page">
    <div className="account-container">
      <div className="account-card">
        {children}
      </div>
    </div>
    <style>{accountStyles}</style>
  </div>
);

const accountStyles = `
  .account-page {
    width: 100%;
    min-height: 100vh;
    display: flex;
    justify-content: center;
  }

  .account-container {
    width: 100%;
    max-width: 850px;
  }

  .account-title {
    font-size: 42px;
    margin-bottom: 35px;
    color: #00e5ff;
    text-shadow: 0 0 15px #00e5ff;
  }

  .account-card {
    background: #0c0c14;
    border: 1px solid rgba(0,255,255,0.2);
    border-radius: 16px;
    padding: 40px;
  }

  .account-card h2 {
    margin-bottom: 10px;
    font-size: 32px;
  }

  .account-card p {
    color: #aaa;
    margin-bottom: 20px;
  }

  .role-badge {
    display: inline-block;
    padding: 8px 18px;
    border-radius: 999px;
    background: rgba(168,85,247,0.15);
    border: 1px solid #a855f7;
    color: #c084fc;
    margin-bottom: 35px;
    text-transform: uppercase;
    font-size: 13px;
    font-weight: bold;
  }

  .button-group {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
  }

  .button-group button,
  .account-card > button {
    padding: 14px 24px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
    background: #00c2d4;
    color: black;
    transition: 0.2s;
  }

  .button-group button:hover,
  .account-card > button:hover {
    transform: scale(1.05);
  }

  .logout-btn {
    background: #ff006e !important;
    color: white !important;
  }
`;

export default Account;
