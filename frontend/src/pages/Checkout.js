import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config/api";

const Checkout = () => {
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState({
    type: "",
    text: "",
  });
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
            <button className="place-order" onClick={handlePlaceOrder}>
              Place Order
            </button>

          </div>

          {/* RIGHT SIDE */}
          <div className="checkout-right">
            <div className="summary-card">
              <h2>Order Summary</h2>

              {cart.map(item => (
                <div key={item.id} className="summary-item">
                  <span>{item.name} x{item.qty}</span>
                  <span>₱{(item.price * item.qty).toFixed(2)}</span>
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
                <span>₱{total.toFixed(2)}</span>
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
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
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
          display: flex;
          justify-content: space-between;
          color: #ff00aa;
        }
      `}</style>
    </div>
  );
};

export default Checkout;
