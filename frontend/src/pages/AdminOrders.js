import React, { useCallback, useEffect, useState } from "react";
import { apiUrl } from "../config/api";

const statusOptions = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const getToken = () =>
  localStorage.getItem("token");

const AdminOrders = () => {

  const [orders, setOrders] = useState([]);
  const [details, setDetails] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalUsers: 0,
  });

  const fetchOrders = useCallback(async () => {

    try {

      setLoading(true);

      const res = await fetch(
        apiUrl("/api/orders"),
        {
          headers: {
            Authorization:
              `Bearer ${getToken()}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Unable to load orders");
        return;
      }

      setError("");
      setOrders(data);

    } catch (err) {

      console.error(err);
      setError("Unable to load orders");
    } finally {

      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {

    try {

      const res = await fetch(
        apiUrl("/api/orders/stats/summary"),
        {
          headers: {
            Authorization:
              `Bearer ${getToken()}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setStats(data);
      }

    } catch (err) {

      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [fetchOrders, fetchStats]);

  const fetchOrderDetails = async (orderId) => {

    if (details[orderId]) {
      return;
    }

    try {

      const res = await fetch(
        apiUrl(`/api/orders/${orderId}`),
        {
          headers: {
            Authorization:
              `Bearer ${getToken()}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Unable to load order details");
        return;
      }

      setDetails((current) => ({
        ...current,
        [orderId]: data,
      }));

    } catch (err) {

      console.error(err);
      setError("Unable to load order details");
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

  const updateStatus = async (
    orderId,
    status
  ) => {

    try {

      const res = await fetch(
        apiUrl(`/api/orders/${orderId}/status`),
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",

            Authorization:
              `Bearer ${getToken()}`,
          },

          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Unable to update status");
        return;
      }

      setError("");
      fetchOrders();
      fetchStats();

    } catch (err) {

      console.error(err);
      setError("Unable to update status");
    }
  };

  return (
    <div className="admin-page">

      <div className="admin-container">

        <h1 className="admin-title">
          Admin Orders
        </h1>

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        <div className="stats-grid">
          <div className="stat-card">
            <span>Products</span>
            <strong>{stats.totalProducts}</strong>
          </div>
          <div className="stat-card">
            <span>Orders</span>
            <strong>{stats.totalOrders}</strong>
          </div>
          <div className="stat-card">
            <span>Pending</span>
            <strong>{stats.pendingOrders}</strong>
          </div>
          <div className="stat-card">
            <span>Users</span>
            <strong>{stats.totalUsers}</strong>
          </div>
        </div>

        {loading ? (
          <div className="empty-box">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-box">
            No orders yet.
          </div>
        ) : orders.map((order) => {

          const orderDetails =
            details[order.id];

          return (
            <div
              className="order-card"
              key={order.id}
            >

              <div className="top-row">

                <div>

                  <h3>
                    Order #{order.id}
                  </h3>

                  <p>
                    {order.name}
                  </p>

                  <small>
                    {new Date(
                      order.created_at
                    ).toLocaleString()}
                  </small>

                </div>

                <div className="order-actions">

                  <button
                    className="details-btn"
                    onClick={() =>
                      toggleDetails(order.id)
                    }
                  >
                    {expandedId === order.id
                      ? "Hide Details"
                      : "View Details"}
                  </button>

                  <select
                    className="status-select"
                    value={order.status}
                    onChange={(e) =>
                      updateStatus(
                        order.id,
                        e.target.value
                      )
                    }
                  >

                    {statusOptions.map((status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    ))}

                  </select>

                </div>

              </div>

              <div className="divider"></div>

              <div className="bottom-row">

                <span>
                  Total
                </span>

                <strong>
                  ₱{Number(order.total).toFixed(2)}
                </strong>

              </div>

              {expandedId === order.id && (
                <div className="details-panel">

                  {!orderDetails ? (
                    <p className="muted">
                      Loading details...
                    </p>
                  ) : (
                    <>
                      <div className="shipping-grid">
                        <div>
                          <span>Customer</span>
                          <strong>{orderDetails.order.name}</strong>
                        </div>
                        <div>
                          <span>Phone</span>
                          <strong>{orderDetails.order.phone}</strong>
                        </div>
                        <div>
                          <span>Address</span>
                          <strong>{orderDetails.order.address}</strong>
                        </div>
                        <div>
                          <span>City / Postal</span>
                          <strong>
                            {orderDetails.order.city || "N/A"}{" "}
                            {orderDetails.order.postal || ""}
                          </strong>
                        </div>
                      </div>

                      <div className="items-table">
                        {orderDetails.items.map((item) => (
                          <div
                            className="item-row"
                            key={item.id}
                          >
                            <span>{item.name}</span>
                            <span>x{item.qty}</span>
                            <span>
                              ₱{Number(item.price).toFixed(2)}
                            </span>
                            <strong>
                              ₱{(Number(item.price) * item.qty).toFixed(2)}
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
        })}

      </div>

      <style>{`

        .admin-page {
          width: 100%;

          display: flex;
          justify-content: center;

          min-height: 100vh;
        }

        .admin-container {
          width: 100%;
          max-width: 1000px;
        }

        .admin-title {
          color: #ff00aa;

          margin-bottom: 35px;

          font-size: 40px;

          text-shadow:
            0 0 15px #ff00aa;
        }

        .error-box {
          margin-bottom: 20px;
          padding: 14px 18px;
          background: rgba(255, 0, 110, 0.14);
          border: 1px solid rgba(255, 0, 110, 0.5);
          border-radius: 10px;
          color: #ff8fbf;
        }

        .empty-box {
          margin-bottom: 20px;
          padding: 30px;
          background: #0c0c14;
          border: 1px solid rgba(0,255,255,0.18);
          border-radius: 14px;
          color: #888;
          text-align: center;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 28px;
        }

        .stat-card {
          background: #0c0c14;
          border: 1px solid rgba(0,255,255,0.18);
          border-radius: 14px;
          padding: 18px;
        }

        .stat-card span {
          display: block;
          margin-bottom: 10px;
          color: #888;
          font-size: 12px;
          text-transform: uppercase;
        }

        .stat-card strong {
          color: #00e5ff;
          font-size: 30px;
          text-shadow: 0 0 12px rgba(0,229,255,0.55);
        }

        .order-card {
          background: #0c0c14;

          border-radius: 14px;

          padding: 25px;

          margin-bottom: 25px;

          border:
            1px solid rgba(0,255,255,0.2);
        }

        .top-row {
          display: flex;

          justify-content: space-between;

          align-items: center;
          gap: 20px;
        }

        .top-row h3 {
          margin: 0;
        }

        .top-row p {
          margin: 8px 0;

          color: #ccc;
        }

        .top-row small {
          color: #777;
        }

        .order-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .details-btn {
          background: transparent;
          color: #00e5ff;
          border: 1px solid rgba(0, 229, 255, 0.55);
          border-radius: 999px;
          padding: 8px 14px;
          cursor: pointer;
          font-weight: bold;
        }

        .status-select {

          background: #10131d;

          color: #00ffaa;

          border:
            1px solid #00ffaa;

          border-radius: 999px;

          padding: 8px 14px;

          outline: none;

          font-weight: bold;

          cursor: pointer;
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

        .bottom-row strong {
          font-size: 24px;

          color: #00e5ff;

          text-shadow:
            0 0 12px #00e5ff;
        }

        .details-panel {
          margin-top: 22px;
          padding-top: 22px;
          border-top: 1px solid #222;
        }

        .shipping-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 20px;
        }

        .shipping-grid div {
          background: #10131d;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          padding: 14px;
        }

        .shipping-grid span {
          display: block;
          margin-bottom: 7px;
          color: #777;
          font-size: 12px;
          text-transform: uppercase;
        }

        .shipping-grid strong {
          color: #fff;
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

export default AdminOrders;
