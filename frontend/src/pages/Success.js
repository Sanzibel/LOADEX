import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Success = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // get total passed from checkout
  const total = location.state?.total || 0;

  // 🧹 CLEAR CART AFTER SUCCESS
  useEffect(() => {
    localStorage.removeItem("cart");

    // 🔥 update navbar instantly
    window.dispatchEvent(new Event("cartUpdated"));
  }, []);

  return (
    <div className="success-page">
      <div className="success-card">

        <h1>🎉 Order Placed!</h1>
        <p>Your order was successfully processed.</p>

        <h2>₱{total.toFixed(2)}</h2>

        <p className="sub">
          Your items will be delivered soon 🚚
        </p>

        <button onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>

      </div>

      <style>{`
        .success-page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .success-card {
          background: #0c0c14;
          padding: 40px;
          border-radius: 16px;
          border: 1px solid rgba(0,255,255,0.25);
          box-shadow: 0 0 25px rgba(0,255,255,0.15);
          text-align: center;
          width: 400px;
        }

        h1 {
          color: #00e5ff;
          text-shadow: 0 0 10px #00e5ff;
        }

        h2 {
          color: #ff00aa;
          margin: 20px 0;
          text-shadow: 0 0 12px #ff00aa;
        }

        .sub {
          color: #aaa;
          margin-bottom: 25px;
        }

        button {
          width: 100%;
          height: 50px;
          background: #00c2d4;
          border: none;
          border-radius: 10px;
          font-weight: bold;
          cursor: pointer;
        }

        button:hover {
          background: #00e5ff;
          box-shadow: 0 0 15px #00e5ff;
        }
      `}</style>
    </div>
  );
};

export default Success;