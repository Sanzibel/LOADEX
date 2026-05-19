import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config/api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({
    type: "",
    text: "",
  });
  const navigate = useNavigate();

  const passwordRules = [
    {
      label: "At least 8 characters",
      met: password.length >= 8,
    },
    {
      label: "One uppercase letter",
      met: /[A-Z]/.test(password),
    },
    {
      label: "One lowercase letter",
      met: /[a-z]/.test(password),
    },
    {
      label: "One number",
      met: /[0-9]/.test(password),
    },
  ];

  const passwordsMatch =
    password &&
    confirmPassword &&
    password === confirmPassword;

  const handleRegister = async () => {
    const cleanName =
      name.trim();

    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password || !confirmPassword) {
      setMessage({
        type: "error",
        text: "Please fill in all fields.",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setMessage({
        type: "error",
        text: "Please enter a valid email address.",
      });
      return;
    }

    if (!passwordRules.every((rule) => rule.met)) {
      setMessage({
        type: "error",
        text: "Password must meet all requirements.",
      });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({
        type: "error",
        text: "Passwords do not match.",
      });
      return;
    }

    try {
      setSubmitting(true);

      const res = await axios.post(apiUrl("/api/auth/register"), {
        name: cleanName,
        email: cleanEmail,
        password,
      });

      console.log("REGISTER SUCCESS:", res.data);

      setMessage({
        type: "success",
        text: "Registered successfully. Redirecting to login...",
      });

      setTimeout(() => {
        navigate("/login");
      }, 700);

    } catch (err) {
      console.error("REGISTER ERROR:", err);

      setMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          err.response?.data ||
          err.message ||
          "Register failed.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className="title">REGISTER</h2>

        {message.text && (
          <div className={`register-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <input
          className="input"
          placeholder="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="input"
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="input"
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          className="input"
          type="password"
          placeholder="confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <div className="password-panel">
          <p className="password-help">
            Password must include:
          </p>

          <div className="password-rules">
            {passwordRules.map((rule) => (
              <span
                key={rule.label}
                className={rule.met ? "met" : ""}
              >
                {rule.label}
              </span>
            ))}
          </div>

          {confirmPassword && (
            <p className={passwordsMatch ? "match-ok" : "match-bad"}>
              {passwordsMatch
                ? "Passwords match."
                : "Passwords do not match."}
            </p>
          )}
        </div>

        <button
          className="button"
          onClick={handleRegister}
          disabled={submitting}
        >
          {submitting ? "Creating..." : "Create Account"}
        </button>

        <style>{`
          .register-message {
            margin-bottom: 15px;
            padding: 12px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: bold;
          }

          .register-message.error {
            background: rgba(255, 0, 110, 0.14);
            border: 1px solid rgba(255, 0, 110, 0.5);
            color: #ff8fbf;
          }

          .register-message.success {
            background: rgba(0, 255, 170, 0.12);
            border: 1px solid rgba(0, 255, 170, 0.5);
            color: #00ffaa;
          }

          .password-panel {
            margin: 8px 0 4px;
            padding: 12px;
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 8px;
            background: rgba(255,255,255,0.025);
          }

          .password-help {
            margin: 0 0 8px;
            color: #9aa4b2;
            font-size: 12px;
          }

          .password-rules {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 6px 10px;
          }

          .password-rules span {
            color: #7d8796;
            font-size: 12px;
            font-weight: 500;
          }

          .password-rules span.met {
            color: #c8d0dc;
          }

          .match-ok,
          .match-bad {
            margin: 10px 0 0;
            font-size: 12px;
            font-weight: bold;
          }

          .match-ok {
            color: #9fd6bd;
          }

          .match-bad {
            color: #d9a0ad;
          }

          .button:disabled {
            opacity: 0.55;
            cursor: not-allowed;
            box-shadow: none;
          }
        `}</style>
      </div>
    </div>
  );
}

export default Register;
