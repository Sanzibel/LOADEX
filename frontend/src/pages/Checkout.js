import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config/api";
import { formatPeso } from "../utils/formatCurrency";

const Checkout = () => {
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState({
    type: "",
    text: "",
  });
  const [verificationStatus, setVerificationStatus] = useState(
    localStorage.getItem("verificationStatus") || "Pending"
  );
  const navigate = useNavigate();

  const [shipping, setShipping] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    postal: ""
  });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(stored);

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) return;

        const res = await fetch(apiUrl("/api/auth/profile"), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          const nextStatus =
            data.user?.verification_status || "Pending";

          setVerificationStatus(nextStatus);
          localStorage.setItem("verificationStatus", nextStatus);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, []);

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const handleChange = (e) => {
    setShipping({
      ...shipping,
      [e.target.name]: e.target.value
    });
  };

  const handlePlaceOrder = async () => {
    if (!shipping.name || !shipping.phone || !shipping.address) {
      setMessage({
        type: "error",
        text: "Please fill in the required shipping fields.",
      });
      return;
    }

    if (cart.length === 0) {
      setMessage({
        type: "error",
        text: "Your cart is empty.",
      });
      return;
    }

    if (verificationStatus !== "Verified") {
      setMessage({
        type: "error",
        text:
          verificationStatus === "Declined"
            ? "Your ID verification was declined. Please contact admin before checkout."
            : "Your account is pending ID verification. Checkout unlocks after admin approval.",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(apiUrl("/api/orders"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart,
          total: total,
          shipping: shipping
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.message || "Order failed.",
        });
        return;
      }

      // 🚀 REDIRECT TO SUCCESS PAGE (NO RELOAD)
      navigate("/success", {
        state: { total }
      });

    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: "Something went wrong while placing the order.",
      });
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1 className="checkout-title">Checkout</h1>

        {message.text && (
          <div className={`checkout-message ${message.type}`}>
            {message.text}
          </div>
        )}

        {verificationStatus !== "Verified" && (
          <div className="checkout-message warning">
            {verificationStatus === "Declined"
              ? "Your ID verification was declined. Please contact admin before checkout."
              : "Your ID verification is pending. Checkout is disabled until admin approval."}
          </div>
        )}

        <div className="checkout-grid">

          {/* LEFT SIDE */}
          <div className="checkout-left">

            {/* SHIPPING */}
            <div className="checkout-card">
              <h2>Shipping Details</h2>

              <input
                className="checkout-input"
                name="name"
                placeholder="Full Name"
                onChange={handleChange}
              />

              <input
                className="checkout-input"
                name="phone"
                placeholder="Phone Number"
                onChange={handleChange}
              />

              <textarea
                className="checkout-input"
                name="address"
                placeholder="Address"
                onChange={handleChange}
              ></textarea>

              <div className="checkout-row">
                <input
                  className="checkout-input"
                  name="city"
                  placeholder="City"
                  onChange={handleChange}
                />

                <input
                  className="checkout-input"
                  name="postal"
                  placeholder="Postal Code"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* PAYMENT */}
            <div className="checkout-card">
              <h2>Payment Method</h2>

              <div className="payment-box">
                💳 Cash on Delivery
              </div>

              <p className="note">
                Pay when your order arrives.
              </p>
            </div>

            {/* BUTTON */}
            <button
              className="place-order"
              onClick={handlePlaceOrder}
              disabled={verificationStatus !== "Verified"}
            >
              Place Order
            </button>

          </div>

          {/* RIGHT SIDE */}
          <div className="checkout-right">
            <div className="summary-card">
              <h2>Order Summary</h2>

              {cart.map(item => (
                <div key={item.id} className="summary-item">
                  <span className="summary-name">{item.name}</span>
                  <span className="summary-qty">x{item.qty}</span>
                  <span className="summary-price">
                    {formatPeso(item.price * item.qty)}
                  </span>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="empty-summary">
                  Your cart is empty.
                </div>
              )}

              <div className="divider"></div>

              <div className="summary-total">
                <span>Total</span>
                <span>{formatPeso(total)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        .checkout-page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
        }

        .checkout-container {
          width: 100%;
          max-width: 1200px;
        }

        .checkout-title {
          color: #00e5ff;
          text-shadow: 0 0 12px #00e5ff;
          margin-bottom: 40px;
        }

        .checkout-message {
          margin-bottom: 20px;
          padding: 14px 18px;
          border-radius: 10px;
          font-weight: bold;
        }

        .checkout-message.error {
          background: rgba(255, 0, 110, 0.14);
          border: 1px solid rgba(255, 0, 110, 0.5);
          color: #ff8fbf;
        }

        .checkout-message.warning {
          background: rgba(255, 193, 7, 0.12);
          border: 1px solid rgba(255, 193, 7, 0.45);
          color: #ffd37a;
        }

        .checkout-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 40px;
        }

        .checkout-left {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .checkout-card {
          background: #0c0c14;
          padding: 25px;
          border-radius: 14px;
          border: 1px solid rgba(0,255,255,0.25);
          box-shadow: 0 0 20px rgba(0,255,255,0.1);
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .checkout-card h2 {
          color: #a855f7;
        }

        .checkout-input {
          background: transparent;
          border: 1px solid #333;
          padding: 12px;
          border-radius: 8px;
          color: white;
        }

        textarea.checkout-input {
          min-height: 90px;
        }

        .checkout-row {
          display: flex;
          gap: 20px;
        }

        .checkout-row .checkout-input {
          flex: 1;
        }

        .payment-box {
          border: 1px solid #00ff9d;
          padding: 12px;
          border-radius: 8px;
          color: #00ff9d;
        }

        .note {
          color: #aaa;
          font-size: 13px;
        }

        .place-order {
          height: 55px;
          background: #00c2d4;
          border: none;
          border-radius: 10px;
          font-weight: bold;
          cursor: pointer;
        }

        .place-order:hover {
          background: #00e5ff;
          box-shadow: 0 0 15px #00e5ff;
        }

        .place-order:disabled {
          background: #252b3a;
          color: #888;
          cursor: not-allowed;
          box-shadow: none;
        }

        .checkout-right {
          position: sticky;
          top: 100px;
        }

        .summary-card {
          background: #0c0c14;
          padding: 25px;
          border-radius: 14px;
          border: 1px solid rgba(255,0,170,0.3);
          box-shadow: 0 0 20px rgba(255,0,170,0.15);
        }

        .summary-card h2 {
          color: #ff00aa;
        }

        .summary-item {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 42px minmax(112px, auto);
          gap: 12px;
          align-items: start;
          margin-bottom: 14px;
          line-height: 1.35;
        }

        .summary-name {
          min-width: 0;
          overflow-wrap: anywhere;
        }

        .summary-qty {
          color: #aaa;
          text-align: center;
          white-space: nowrap;
        }

        .summary-price,
        .summary-total span:last-child {
          text-align: right;
          white-space: nowrap;
          font-variant-numeric: tabular-nums;
        }

        .empty-summary {
          color: #888;
          padding: 14px 0;
        }

        .divider {
          height: 1px;
          background: #333;
          margin: 15px 0;
        }

        .summary-total {
          display: grid;
          grid-template-columns: 1fr minmax(130px, auto);
          gap: 16px;
          color: #ff00aa;
          align-items: center;
          font-weight: bold;
        }

        @media (max-width: 900px) {
          .checkout-grid {
            grid-template-columns: 1fr;
          }

          .checkout-right {
            position: static;
          }
        }

        @media (max-width: 520px) {
          .checkout-row {
            flex-direction: column;
            gap: 15px;
          }

          .summary-item {
            grid-template-columns: minmax(0, 1fr) 38px minmax(96px, auto);
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default Checkout;
