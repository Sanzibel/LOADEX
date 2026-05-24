import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { formatPeso } from "../utils/formatCurrency";

const Success = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const total = location.state?.total || 0;

  useEffect(() => {
    localStorage.removeItem("cart");
    window.dispatchEvent(new Event("cartUpdated"));
  }, []);

  return (
    <div className="success-page">
      <div className="success-card">

        <h1>Order Placed</h1>
        <p>Your official LOADEX order has been placed.</p>

        <h2>{formatPeso(total)}</h2>

        <p className="sub">
          Cash on Delivery orders receive an official receipt after the order is marked as delivered.
        </p>

        <button onClick={() => navigate("/my-orders")}>
          View My Orders
        </button>

        <button
          className="secondary-btn"
          onClick={() => navigate("/dashboard")}
        >
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
          width: 420px;
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
          line-height: 1.5;
        }

        button {
          width: 100%;
          height: 50px;
          background: #00c2d4;
          border: none;
          border-radius: 10px;
          font-weight: bold;
          cursor: pointer;
          margin-top: 12px;
        }

        button:hover {
          background: #00e5ff;
          box-shadow: 0 0 15px #00e5ff;
        }

        .secondary-btn {
          background: #252b3a;
          color: #ddd;
        }

        .secondary-btn:hover {
          background: #30384c;
          box-shadow: none;
        }
      `}</style>
    </div>
  );
};

export default Success;
