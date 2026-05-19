import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate
} from "react-router-dom";

import { useState, useEffect, useCallback } from "react";

// pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Success from "./pages/Success";
import MyOrders from "./pages/MyOrders";
import AdminOrders from "./pages/AdminOrders";
import AdminProducts from "./pages/AdminProducts";
import Account from "./pages/Account";

// components
import Navbar from "./components/Navbar";

// 🔥 LAYOUT
function Layout({ children }) {

  const location = useLocation();
  const navigate = useNavigate();

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <div className="app-container">

      {/* NAVBAR */}
      {!isAuthPage && <Navbar />}

      {isAuthPage ? (
        <>
          {/* AUTH UI */}
          <div className="header">

            <h1 className="logo glitch">
              LOADEX
            </h1>

            <p className="tagline">
              Initialize Access Protocol
            </p>

          </div>

          {/* TOGGLE */}
          <div className="toggle-wrapper">

            <div
              className={`toggle-slider ${
                location.pathname === "/register"
                  ? "right"
                  : ""
              }`}
            ></div>

            <button
              className={`toggle-btn ${
                location.pathname === "/login"
                  ? "active"
                  : ""
              }`}
              onClick={() => navigate("/login")}
            >
              LOGIN
            </button>

            <button
              className={`toggle-btn ${
                location.pathname === "/register"
                  ? "active"
                  : ""
              }`}
              onClick={() => navigate("/register")}
            >
              REGISTER
            </button>

          </div>

          {/* PAGE */}
          {children}

        </>
      ) : (
        <div className="page-with-navbar">
          {children}
        </div>
      )}

      {/* GLOBAL STYLE */}
      <style>{`

        .page-with-navbar {
          width: 100%;
          min-height: 100vh;

          padding-top: 90px;

          display: flex;
          justify-content: center;
        }

      `}</style>

    </div>
  );
}

// 🔐 NORMAL PROTECTED ROUTE
function ProtectedRoute({ token, children }) {

  return token
    ? children
    : <Navigate to="/login" />;
}

function CustomerRoute({ token, children }) {

  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (role === "admin") {
    return <Navigate to="/admin/orders" />;
  }

  return children;
}

// 🔥 ADMIN ROUTE
function AdminRoute({ token, children }) {

  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

function App() {

  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 CHECK TOKEN ON LOAD
  useEffect(() => {

    const storedToken =
      localStorage.getItem("token");

    setToken(storedToken);

    setLoading(false);

  }, []);

  const handleLogin = useCallback((nextToken) => {

    setToken(nextToken);
  }, []);

  const handleLogout = useCallback(() => {

    localStorage.removeItem("token");

    localStorage.removeItem("role");

    setToken(null);
  }, []);

  const homePath =
    localStorage.getItem("role") === "admin"
      ? "/admin/orders"
      : "/dashboard";

  // 🔥 PREVENT FLICKER
  if (loading) {

    return (
      <div
        style={{
          textAlign: "center",
          marginTop: "150px",
          color: "#00e5ff",
        }}
      >
        <h1>Initializing System...</h1>
      </div>
    );
  }

  return (
    <Router>

      <Layout>

        <Routes>

          {/* PUBLIC ROUTES */}

          <Route
            path="/login"
            element={
              !token
                ? <Login onLogin={handleLogin} />
                : <Navigate to={homePath} />
            }
          />

          <Route
            path="/register"
            element={
              !token
                ? <Register />
                : <Navigate to={homePath} />
            }
          />

          {/* PROTECTED ROUTES */}

          <Route
            path="/dashboard"
            element={
              <CustomerRoute token={token}>
                <Dashboard onLogout={handleLogout} />
              </CustomerRoute>
            }
          />

          <Route
            path="/product/:id"
            element={
              <CustomerRoute token={token}>
                <ProductDetails />
              </CustomerRoute>
            }
          />

          <Route
            path="/cart"
            element={
              <CustomerRoute token={token}>
                <Cart />
              </CustomerRoute>
            }
          />

          <Route
            path="/checkout"
            element={
              <CustomerRoute token={token}>
                <Checkout />
              </CustomerRoute>
            }
          />

          <Route
            path="/success"
            element={
              <CustomerRoute token={token}>
                <Success />
              </CustomerRoute>
            }
          />

          {/* ✅ ACCOUNT */}
          <Route
            path="/account"
            element={
              <ProtectedRoute token={token}>
                <Account onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          {/* ✅ MY ORDERS */}
          <Route
            path="/my-orders"
            element={
              <CustomerRoute token={token}>
                <MyOrders />
              </CustomerRoute>
            }
          />

          {/* ✅ ADMIN ORDERS */}
          <Route
            path="/admin/orders"
            element={
              <AdminRoute token={token}>
                <AdminOrders />
              </AdminRoute>
            }
          />

          {/* ✅ ADMIN PRODUCTS */}
          <Route
            path="/admin/products"
            element={
              <AdminRoute token={token}>
                <AdminProducts />
              </AdminRoute>
            }
          />

          {/* DEFAULT */}
          <Route
            path="*"
            element={<Navigate to={token ? homePath : "/login"} />}
          />

        </Routes>

      </Layout>

    </Router>
  );
}

export default App;
