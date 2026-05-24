import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config/api";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage("Please enter email and password.");
      return;
    }

    try {
      const res = await axios.post(apiUrl("/api/auth/login"), {
        email,
        password,
      });

      if (!res.data.token) {
        setMessage("Login failed. No token received.");
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem(
        "verificationStatus",
        res.data.user.verification_status || "Pending"
      );

      onLogin(res.data.token);
      navigate(
        res.data.user.role === "admin"
          ? "/admin/orders"
          : "/dashboard"
      );

    } catch (err) {
      console.error("LOGIN REQUEST ERROR:", err);

      setMessage(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Login failed."
      );
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">

        <h2 className="login-title">LOGIN</h2>

        {message && (
          <div className="login-message">
            {message}
          </div>
        )}

        <input
          className="login-input"
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="login-input"
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="login-button" onClick={handleLogin}>
          Enter System
        </button>

      </div>

      {/* 🔥 ISOLATED LOGIN STYLES */}
      <style>{`

        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .login-card {
          background: rgba(15, 15, 30, 0.95);
          border: 1px solid rgba(0,255,255,0.3);
          padding: 40px;
          border-radius: 12px;
          width: 320px;

          box-shadow:
            0 0 25px rgba(0,255,255,0.2),
            0 0 60px rgba(0,255,255,0.08);
        }

        .login-title {
          text-align: center;
          margin-bottom: 20px;
          color: #00ffff;
          text-shadow: 0 0 12px #00ffff;
        }

        .login-input {
          width: 100%;
          padding: 12px;
          margin: 10px 0;
          background: #0a0f1c;
          border: 1px solid rgba(0,255,255,0.4);
          color: white;
          border-radius: 6px;
          outline: none;
        }

        .login-message {
          margin-bottom: 15px;
          padding: 12px;
          background: rgba(255, 0, 110, 0.14);
          border: 1px solid rgba(255, 0, 110, 0.5);
          border-radius: 8px;
          color: #ff8fbf;
          font-size: 13px;
          font-weight: bold;
        }

        .login-input:focus {
          border: 1px solid #00ffff;
          box-shadow: 0 0 10px rgba(0,255,255,0.5);
        }

        .login-button {
          width: 100%;
          padding: 12px;
          margin-top: 15px;
          background: #00ffff;
          border: none;
          color: black;
          font-weight: bold;
          cursor: pointer;
          border-radius: 6px;

          box-shadow: 0 0 12px #00ffff;
          transition: 0.3s;
        }

        .login-button:hover {
          background: #00cccc;
          box-shadow: 0 0 20px #00ffff;
        }

      `}</style>
    </div>
  );
}

export default Login;
