import React, { useCallback, useEffect, useState } from "react";
import { apiUrl } from "../config/api";
import { formatPeso } from "../utils/formatCurrency";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [details, setDetails] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const getToken = () =>
    localStorage.getItem("token");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(apiUrl("/api/orders/my"), {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Unable to load orders.");
        return;
      }

      setError("");
      setOrders(data);

    } catch (err) {
      console.error(err);
      setError("Unable to load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const fetchOrderDetails = async (orderId) => {
    if (details[orderId]) {
      return;
    }

    try {
      const res = await fetch(apiUrl(`/api/orders/my/${orderId}`), {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Unable to load order details.");
        return;
      }

      setDetails((current) => ({
        ...current,
        [orderId]: data,
      }));

    } catch (err) {
      console.error(err);
      setError("Unable to load order details.");
    }
  };

  const toggleDetails = async (orderId) => {
    if (expandedId === orderId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(orderId);
    await fetchOrderDetails(orderId);
  };

  const cancelOrder = async (orderId) => {
    try {
      setMessage("");

      const res = await fetch(apiUrl(`/api/orders/my/${orderId}/cancel`), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Unable to cancel order.");
        return;
      }

      setError("");
      setMessage(data.message || "Order cancelled.");
      setDetails((current) => {
        const next = { ...current };
        delete next[orderId];
        return next;
      });
      await fetchOrders();

    } catch (err) {
      console.error(err);
      setError("Unable to cancel order.");
    }
  };

  return (
    <div className="orders-page">

      <div className="orders-container">

        <h1 className="orders-title">
          My Orders
        </h1>

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        {message && (
          <div className="success-box">
            {message}
          </div>
        )}

        {loading ? (
          <div className="empty-box">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-box">
            No orders yet.
          </div>
        ) : (
          orders.map((order) => {
            const orderDetails =
              details[order.id];

            return (
              <div className="order-card" key={order.id}>

                <div className="top-row">
                  <div>
                    <h3>Order #{order.id}</h3>
                    <p>
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="order-actions">
                    <div className={`status ${order.status.toLowerCase()}`}>
                      {order.status}
                    </div>

                    <button
                      className="details-btn"
                      onClick={() => toggleDetails(order.id)}
                    >
                      {expandedId === order.id
                        ? "Hide Details"
                        : "View Details"}
                    </button>

                    {order.status === "Pending" && (
                      <button
                        className="cancel-order-btn"
                        onClick={() => cancelOrder(order.id)}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                <div className="divider"></div>

                <div className="bottom-row">
                  <span>Total</span>

                  <h2>
                    {formatPeso(order.total)}
                  </h2>
                </div>

                {expandedId === order.id && (
                  <div className="details-panel">
                    {!orderDetails ? (
                      <p className="muted">
                        Loading details...
                      </p>
                    ) : (
                      <>
                        <div className="shipping-box">
                          <span>Ship to</span>
                          <strong>{orderDetails.order.name}</strong>
                          <p>
                            {orderDetails.order.address}
                            {orderDetails.order.city ? `, ${orderDetails.order.city}` : ""}
                            {orderDetails.order.postal ? ` ${orderDetails.order.postal}` : ""}
                          </p>
                          <p>{orderDetails.order.phone}</p>
                        </div>

                        <div className="items-table">
                          {orderDetails.items.map((item) => (
                            <div className="item-row" key={item.id}>
                              <span>{item.name}</span>
                              <span>x{item.qty}</span>
                              <span>{formatPeso(item.price)}</span>
                              <strong>
                                {formatPeso(Number(item.price) * item.qty)}
                              </strong>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

              </div>
            );
          })
        )}

      </div>

      <style>{`

        .orders-page {
          width: 100%;
          display: flex;
          justify-content: center;
          min-height: 100vh;
        }

        .orders-container {
          width: 100%;
          max-width: 1000px;
        }

        .orders-title {
          color: #00e5ff;
          font-size: 40px;
          margin-bottom: 35px;
          text-shadow: 0 0 15px #00e5ff;
        }

        .empty-box,
        .success-box,
        .error-box {
          padding: 16px;
          border-radius: 14px;
          margin-bottom: 20px;
        }

        .empty-box {
          background: #0c0c14;
          border: 1px solid rgba(0,255,255,0.2);
          padding: 40px;
          text-align: center;
          color: #888;
        }

        .success-box {
          background: rgba(0, 255, 170, 0.12);
          border: 1px solid rgba(0, 255, 170, 0.5);
          color: #00ffaa;
        }

        .error-box {
          background: rgba(255, 0, 110, 0.14);
          border: 1px solid rgba(255, 0, 110, 0.5);
          color: #ff8fbf;
        }

        .order-card {
          background: #0c0c14;
          border-radius: 14px;
          padding: 25px;
          margin-bottom: 25px;
          border: 1px solid rgba(255,0,170,0.25);
          box-shadow: 0 0 20px rgba(255,0,170,0.12);
        }

        .top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .top-row h3 {
          margin: 0;
          color: white;
        }

        .top-row p {
          margin-top: 8px;
          color: #888;
          font-size: 14px;
        }

        .order-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .status {
          padding: 8px 18px;
          border-radius: 999px;
          background: rgba(0,255,170,0.12);
          border: 1px solid #00ffaa;
          color: #00ffaa;
          font-weight: bold;
        }

        .status.cancelled {
          background: rgba(255, 0, 110, 0.12);
          border-color: #ff8fbf;
          color: #ff8fbf;
        }

        .details-btn,
        .cancel-order-btn {
          height: 36px;
          padding: 0 14px;
          border-radius: 999px;
          cursor: pointer;
          font-weight: bold;
        }

        .details-btn {
          background: transparent;
          border: 1px solid rgba(0,229,255,0.55);
          color: #00e5ff;
        }

        .cancel-order-btn {
          background: transparent;
          border: 1px solid rgba(255,0,110,0.55);
          color: #ff8fbf;
        }

        .divider {
          height: 1px;
          background: #222;
          margin: 20px 0;
        }

        .bottom-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .bottom-row span {
          color: #aaa;
        }

        .bottom-row h2 {
          color: #ff00aa;
          text-shadow: 0 0 12px #ff00aa;
        }

        .details-panel {
          margin-top: 22px;
          padding-top: 22px;
          border-top: 1px solid #222;
        }

        .shipping-box {
          margin-bottom: 18px;
          padding: 16px;
          background: #10131d;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.06);
        }

        .shipping-box span {
          display: block;
          margin-bottom: 8px;
          color: #888;
          font-size: 12px;
          text-transform: uppercase;
        }

        .shipping-box p {
          margin: 6px 0 0;
          color: #aaa;
        }

        .items-table {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .item-row {
          display: grid;
          grid-template-columns: 1fr 70px 110px 110px;
          gap: 12px;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #1f2430;
        }

        .item-row strong {
          color: #ff00aa;
          text-align: right;
        }

        .muted {
          color: #888;
        }

      `}</style>
    </div>
  );
};

export default MyOrders;
