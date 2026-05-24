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

  const [idImage, setIdImage] =
    useState(null);

  const [idMessage, setIdMessage] =
    useState({
      type: "",
      text: "",
    });

  const [submittingId, setSubmittingId] =
    useState(false);

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
      localStorage.setItem(
        "verificationStatus",
        data.user.verification_status || "Pending"
      );

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

  const handleIdSubmit = async (e) => {
    e.preventDefault();

    if (!idImage) {
      setIdMessage({
        type: "error",
        text: "Please choose an ID image first.",
      });
      return;
    }

    try {
      setSubmittingId(true);
      setIdMessage({
        type: "",
        text: "",
      });

      const token =
        localStorage.getItem("token");

      const formData =
        new FormData();

      formData.append("idImage", idImage);

      const res = await fetch(
        apiUrl("/api/auth/profile/id"),
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        setIdMessage({
          type: "error",
          text: data.message || "Unable to upload ID.",
        });
        return;
      }

      setUser(data.user);
      setIdImage(null);
      localStorage.setItem(
        "verificationStatus",
        data.user.verification_status || "Pending"
      );
      setIdMessage({
        type: "success",
        text: data.message || "ID submitted for verification.",
      });
    } catch (err) {
      console.error(err);
      setIdMessage({
        type: "error",
        text: "Unable to upload ID.",
      });
    } finally {
      setSubmittingId(false);
    }
  };

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

          {user.role !== "admin" && (
            <div className={`verify-badge ${user.verification_status}`}>
              ID Verification: {user.verification_status || "Pending"}
            </div>
          )}

          {user.role !== "admin" && (
            <form
              className="verification-form"
              onSubmit={handleIdSubmit}
            >
              <h3>
                Submit ID Verification
              </h3>

              <p>
                Upload a clear image of your official ID. Admin will review it from the dashboard.
              </p>

              {idMessage.text && (
                <div className={`id-message ${idMessage.type}`}>
                  {idMessage.text}
                </div>
              )}

              <label className="id-picker">
                <span>Official ID image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setIdImage(e.target.files?.[0] || null)
                  }
                />
                <small>
                  {idImage
                    ? idImage.name
                    : user.verification_status === "Verified"
                      ? "Upload again only if admin asks you to resubmit."
                      : "Required before checkout can be approved."}
                </small>
              </label>

              <button
                type="submit"
                disabled={submittingId}
              >
                {submittingId
                  ? "Submitting..."
                  : user.verification_status === "Declined"
                    ? "Resubmit ID"
                    : "Submit ID"}
              </button>
            </form>
          )}

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

  .verify-badge {
    display: inline-block;
    padding: 8px 18px;
    border-radius: 999px;
    margin-left: 10px;
    margin-bottom: 35px;
    font-size: 13px;
    font-weight: bold;
  }

  .verify-badge.Verified {
    background: rgba(0, 255, 170, 0.12);
    border: 1px solid rgba(0, 255, 170, 0.5);
    color: #00ffaa;
  }

  .verify-badge.Pending {
    background: rgba(255, 193, 7, 0.12);
    border: 1px solid rgba(255, 193, 7, 0.45);
    color: #ffd37a;
  }

  .verify-badge.Declined {
    background: rgba(255, 0, 110, 0.14);
    border: 1px solid rgba(255, 0, 110, 0.5);
    color: #ff8fbf;
  }

  .button-group {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
  }

  .verification-form {
    display: grid;
    gap: 12px;
    margin-bottom: 32px;
    padding: 20px;
    border-radius: 12px;
    background: #10131d;
    border: 1px solid rgba(0,255,255,0.16);
  }

  .verification-form h3 {
    margin: 0;
    color: #00e5ff;
  }

  .verification-form p {
    margin: 0;
    color: #aaa;
    line-height: 1.5;
  }

  .id-picker {
    display: grid;
    gap: 8px;
    padding: 12px;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    background: #0c0c14;
    color: #c8d0dc;
  }

  .id-picker input {
    color: #9aa4b2;
  }

  .id-picker small {
    color: #7d8796;
  }

  .id-message {
    padding: 12px;
    border-radius: 8px;
    font-weight: bold;
  }

  .id-message.error {
    background: rgba(255, 0, 110, 0.14);
    border: 1px solid rgba(255, 0, 110, 0.5);
    color: #ff8fbf;
  }

  .id-message.success {
    background: rgba(0, 255, 170, 0.12);
    border: 1px solid rgba(0, 255, 170, 0.5);
    color: #00ffaa;
  }

  .verification-form button {
    width: fit-content;
    padding: 12px 18px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
    background: #00c2d4;
    color: black;
  }

  .verification-form button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
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
