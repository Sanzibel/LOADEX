import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { imageUrl } from "../config/api";

// local images
import mouse from "../assets/mouse.webp";
import keyboard from "../assets/keyboard.avif";
import headset from "../assets/headset.webp";
import monitor from "../assets/monitor.jpg";
import controller from "../assets/gaming_controller.jpg";
import chair from "../assets/gaming_chair.jpg";

const imageMap = {
  "mouse.webp": mouse,
  "keyboard.avif": keyboard,
  "headset.webp": headset,
  "monitor.jpg": monitor,
  "gaming_controller.jpg": controller,
  "gaming_chair.jpg": chair,
};

const Cart = () => {

  const [cart, setCart] =
    useState([]);

  const navigate =
    useNavigate();

  useEffect(() => {

    const stored =
      JSON.parse(
        localStorage.getItem("cart")
      ) || [];

    setCart(stored);

  }, []);

  // ✅ SMART IMAGE SYSTEM
  const getImageSrc = (image) => {

    if (!image) {
      return "";
    }

    // uploaded images
    if (
      image.includes("/uploads/")
    ) {

      return imageUrl(image);
    }

    // old local assets
    return imageMap[image];
  };

  const updateCart = (newCart) => {

    setCart(newCart);

    localStorage.setItem(
      "cart",
      JSON.stringify(newCart)
    );

    // 🔥 update navbar
    window.dispatchEvent(
      new Event("cartUpdated")
    );
  };

  const increaseQty = (id) => {

    updateCart(
      cart.map((item) =>
        item.id === id
          ? {
              ...item,
              qty: item.qty + 1,
            }
          : item
      )
    );
  };

  const decreaseQty = (id) => {

    updateCart(
      cart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                qty: item.qty - 1,
              }
            : item
        )
        .filter(
          (item) => item.qty > 0
        )
    );
  };

  const removeItem = (id) => {

    updateCart(
      cart.filter(
        (item) => item.id !== id
      )
    );
  };

  const total =
    cart.reduce(
      (sum, item) =>
        sum +
        item.price * item.qty,
      0
    );

  const isCartEmpty =
    cart.length === 0;

  return (
    <div className="cart-page">

      <div className="cart-container">

        <h1 className="cart-title">
          Shopping Cart
        </h1>

        {isCartEmpty && (
          <div className="empty-cart">
            Your cart is empty.
          </div>
        )}

        {cart.map((item) => (

          <div
            key={item.id}
            className="cart-card"
          >

            <div className="cart-left">

              <img
                src={getImageSrc(item.image)}
                alt={item.name}
                className="cart-img"
              />

              <div>

                <h3 className="cart-name">
                  {item.name}
                </h3>

                <p className="cart-price">
                  ₱{item.price}
                </p>

              </div>

            </div>

            <div className="cart-right">

              <div className="qty-box">

                <button
                  onClick={() =>
                    decreaseQty(item.id)
                  }
                >
                  -
                </button>

                <span>
                  {item.qty}
                </span>

                <button
                  onClick={() =>
                    increaseQty(item.id)
                  }
                >
                  +
                </button>

              </div>

              <h3 className="item-total">
                ₱
                {(
                  item.price *
                  item.qty
                ).toFixed(2)}
              </h3>

              <button
                className="delete-btn"
                onClick={() =>
                  removeItem(item.id)
                }
              >
                🗑
              </button>

            </div>

          </div>

        ))}

        <div className="total-card">

          <div className="total-top">

            <h3>Total</h3>

            <h1>
              ₱{total.toFixed(2)}
            </h1>

          </div>

          <div className="btn-row">

            <button
              className="btn-outline"
              onClick={() =>
                navigate("/dashboard")
              }
            >
              Continue Shopping
            </button>

            <button
              className={`btn-primary ${
                isCartEmpty
                  ? "disabled"
                  : ""
              }`}
              disabled={isCartEmpty}
              onClick={() =>
                !isCartEmpty &&
                navigate("/checkout")
              }
            >
              Proceed to Checkout
            </button>

          </div>

        </div>

      </div>

      <style>{`

        .cart-page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
        }

        .cart-container {
          width: 100%;
          max-width: 1150px;
        }

        .cart-title {
          color: #00e5ff;
          text-shadow: 0 0 14px #00e5ff;
          margin-bottom: 50px;
          font-size: 32px;
        }

        .empty-cart {
          margin-bottom: 30px;
          padding: 30px;
          background: #0c0c14;
          border: 1px solid rgba(0,255,255,0.2);
          border-radius: 14px;
          color: #888;
          text-align: center;
        }

        .cart-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 25px 35px;
          margin-bottom: 35px;
          border-radius: 14px;
          background: #0c0c14;
          border: 1px solid rgba(0,255,255,0.25);
          box-shadow: 0 0 20px rgba(0,255,255,0.12);
        }

        .cart-left {
          display: flex;
          align-items: center;
          gap: 25px;
        }

        .cart-img {
          width: 85px;
          height: 85px;
          border-radius: 10px;
          object-fit: cover;
        }

        .cart-price {
          color: #00e5ff;
        }

        .cart-right {
          display: flex;
          align-items: center;
          gap: 30px;
        }

        .qty-box {
          display: flex;
          align-items: center;
          border: 1px solid #5a3dff;
          border-radius: 8px;
          height: 40px;
        }

        .qty-box button {
          width: 40px;
          background: transparent;
          border: none;
          color: #aaa;
          cursor: pointer;
        }

        .qty-box span {
          width: 35px;
          text-align: center;
        }

        .item-total {
          color: #ff00aa;
        }

        .delete-btn {
          background: transparent;
          border: none;
          color: #ff4d4d;
          cursor: pointer;
        }

        .total-card {
          padding: 35px;
          border-radius: 14px;
          background: #0c0c14;
          border: 1px solid rgba(255,0,170,0.35);
          box-shadow: 0 0 25px rgba(255,0,170,0.18);
        }

        .total-top {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }

        .total-top h1 {
          color: #ff00aa;
          text-shadow: 0 0 12px #ff00aa;
        }

        .btn-row {
          display: flex;
          gap: 25px;
        }

        .btn-outline {
          flex: 1;
          height: 50px;
          background: transparent;
          border: 1px solid #5a3dff;
          color: #a855f7;
          border-radius: 8px;
          cursor: pointer;
        }

        .btn-primary {
          flex: 1;
          height: 50px;
          background: #00c2d4;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
        }

        .btn-primary.disabled {
          opacity: 0.45;
          cursor: not-allowed;
          box-shadow: none;
        }

      `}</style>

    </div>
  );
};

export default Cart;
