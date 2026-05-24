import React, {
  useEffect,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";
import { apiUrl, imageUrl } from "../config/api";
import { formatPeso } from "../utils/formatCurrency";

import "./dashboard.css";

// HERO IMAGES
import banner from "../assets/banner.jpg";
import setup1 from "../assets/featured_layout_1.webp";
import setup2 from "../assets/featured_layout_2.jpg";

// OLD LOCAL PRODUCT IMAGES
import mouse from "../assets/mouse.webp";
import keyboard from "../assets/keyboard.avif";
import headset from "../assets/headset.webp";
import monitor from "../assets/monitor.jpg";
import controller from "../assets/gaming_controller.jpg";
import chair from "../assets/gaming_chair.jpg";

// ✅ SAFE IMAGE MAP
const imageMap = {

  "mouse.webp": mouse,

  "keyboard.avif": keyboard,

  "headset.webp": headset,

  "monitor.jpg": monitor,

  "gaming_controller.jpg": controller,

  "gaming_chair.jpg": chair,

};

const getProductCategory = (product) => {
  if (product.category) {
    return product.category;
  }

  const text =
    getSearchText(product);

  if (text.includes("keyboard")) return "LOADEX Keyboards";
  if (text.includes("headset")) return "LOADEX Audio";
  if (text.includes("monitor")) return "LOADEX Displays";
  if (text.includes("controller")) return "LOADEX Controllers";

  return "LOADEX Accessories";
};

const getSearchText = (product) =>
  [
    product.name,
    product.description,
    product.category,
    product.price,
    product.image,
    getImageCategory(product.image),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .trim();

const getImageCategory = (image = "") => {
  const value =
    image.toLowerCase();

  if (value.includes("keyboard")) return "LOADEX Keyboards";
  if (value.includes("headset")) return "LOADEX Audio";
  if (value.includes("monitor")) return "LOADEX Displays";
  if (value.includes("controller")) return "LOADEX Controllers";

  return "";
};

function Dashboard({ onLogout }) {

  const [user, setUser] =
    useState(null);

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("All");

  const navigate =
    useNavigate();

  useEffect(() => {

    const fetchData = async () => {

      try {

        const token =
          localStorage.getItem("token");

        if (!token) {

          navigate("/login");

          return;
        }

        // 🔐 USER
        const res = await fetch(
          apiUrl("/api/auth/profile"),
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const data =
          await res.json();

        if (res.ok) {

          setUser(data.user);
          localStorage.setItem(
            "verificationStatus",
            data.user.verification_status || "Pending"
          );

        } else {

          onLogout();

          navigate("/login");

          return;
        }

        // 🛒 PRODUCTS
        const productRes =
          await fetch(
            apiUrl("/api/products")
          );

        const productData =
          await productRes.json();

        setProducts(
          Array.isArray(productData)
            ? productData
            : []
        );

      } catch (err) {

        console.error(err);

        navigate("/login");

      } finally {

        setLoading(false);
      }
    };

    fetchData();

  }, [navigate, onLogout]);

  // ✅ SMART IMAGE SYSTEM
  const getImageSrc = (image) => {

    if (!image) {

      return "";
    }

    // ✅ uploaded image
    if (
      image.startsWith("data:") ||
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.includes("uploads")
    ) {

      return imageUrl(image);
    }

    // ✅ local asset image
    return imageMap[image];
  };

  // 🚪 LOGOUT
  const handleLogout = () => {

    onLogout();

    navigate("/login");
  };

  const categories = [
    "All",
    "LOADEX Audio",
    "LOADEX Displays",
    "LOADEX Accessories",
    "LOADEX Keyboards",
    "LOADEX Controllers",
  ];

  const filteredProducts =
    products.filter((product) => {
      const category =
        getProductCategory(product);

      const matchesCategory =
        categoryFilter === "All" ||
        category === categoryFilter;

      const text =
        getSearchText(product);

      const matchesSearch =
        text.includes(searchTerm.toLowerCase().trim());

      return matchesCategory && matchesSearch;
    });

  if (loading) {

    return (

      <div className="dashboard">

        <h1
          style={{
            textAlign: "center",
            marginTop: "100px",
          }}
        >
          Initializing System...
        </h1>

      </div>
    );
  }

  return (
    <div className="dashboard">

      {/* TOP BAR */}

      <div className="topbar">

        <h2 className="logo" data-text="LOADEX">
          LOADEX
        </h2>

        <div className="user-section">

          <span>
            {user?.name || user?.email}
          </span>

          <button
            className="topbar-btn cart-btn"
            onClick={() =>
              navigate("/cart")
            }
          >
            Cart
          </button>

          <button
            className="topbar-btn logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </div>

      {/* HERO */}

      <div className="hero">

        <img
          src={banner}
          alt="banner"
          className="hero-img"
        />

        <div className="hero-text">

          <span className="hero-kicker">
            Official LOADEX Store
          </span>

          <h1>
            Official LOADEX Store
          </h1>

          <p>
            Gaming accessories engineered, stocked, and shipped by LOADEX.
          </p>

        </div>

      </div>

      {/* FEATURED */}

      <h2 className="section-title">
        About LOADEX
      </h2>

      <section className="about-loadex">
        <div>
          <h3>
            Built for focused play.
          </h3>
          <p>
            LOADEX is an official gaming accessories brand and online store. Every item in this catalog is selected, managed, and fulfilled by LOADEX for a single-brand shopping experience.
          </p>
        </div>
        <div className="brand-points">
          <span>Official products only</span>
          <span>Admin-managed inventory</span>
          <span>Direct LOADEX checkout</span>
        </div>
      </section>

      <h2 className="section-title">
        Official LOADEX Setups
      </h2>

      <div className="featured">

        <div className="card">

          <img
            src={setup1}
            alt=""
          />

          <h3>
            LOADEX Elite Setup
          </h3>

          <p>
            Official peripherals for competitive desktop play
          </p>

          <span>
            {formatPeso(349.99)}
          </span>

        </div>

        <div className="card">

          <img
            src={setup2}
            alt=""
          />

          <h3>
            LOADEX Stealth Setup
          </h3>

          <p>
            Clean gear bundle for focused sessions
          </p>

          <span>
            {formatPeso(319.99)}
          </span>

        </div>

      </div>

      {/* PRODUCTS */}

      <h2 className="section-title">
        Official LOADEX Products
      </h2>

      {user?.verification_status !== "Verified" && (
        <div className="verification-lock">
          {user?.verification_status === "Declined"
            ? "Your ID verification was declined. Please contact admin before buying."
            : "Your account is pending ID verification. You can browse products, but checkout is locked until admin approval."}
        </div>
      )}

      <div className="product-controls">

        <div className="search-group">
          <input
            className="product-search"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            placeholder="Search official LOADEX products"
          />

          {searchTerm && (
            <button
              className="clear-search"
              onClick={() =>
                setSearchTerm("")
              }
            >
              Clear
            </button>
          )}
        </div>

        <div className="category-filters">
          {categories.map((category) => (
            <button
              key={category}
              className={
                categoryFilter === category
                  ? "active"
                  : ""
              }
              onClick={() =>
                setCategoryFilter(category)
              }
            >
              {category}
            </button>
          ))}
        </div>

      </div>

      <div className="result-count">
        Showing {filteredProducts.length} of {products.length} products
      </div>

      <div className="products">

        {filteredProducts.map((p) => (

          (() => {
            const stock =
              Number(p.stock_count || 0);

            return (
              <div
                className={`card ${stock <= 0 ? "sold-out-card" : ""}`}
                key={p.id}
                onClick={() =>
                  navigate(`/product/${p.id}`)
                }
                style={{
                  cursor: "pointer",
                }}
              >

                <div className="product-image-wrap">
                  <img
                    src={getImageSrc(p.image)}
                    alt={p.name}
                  />

                  {stock <= 0 && (
                    <span className="sold-out-label">
                      Sold Out
                    </span>
                  )}
                </div>

                <h4>
                  {p.name}
                </h4>

                <p>
                  {p.description}
                </p>

                <div className="product-category">
                  {getProductCategory(p)}
                </div>

                <span>
                  {formatPeso(p.price)}
                </span>

                <div className="stock-line">
                  {stock > 0
                    ? `${stock} in stock`
                    : "Unavailable"}
                  {Number(p.sold_count || 0) > 0 && (
                    <small>
                      {p.sold_count} sold
                    </small>
                  )}
                </div>

              </div>
            );
          })()

        ))}

      </div>

      {filteredProducts.length === 0 && (
        <div className="empty-products">
          No products match your filters.
        </div>
      )}

      <style>{`

        .hero-kicker {
          display: inline-block;
          margin-bottom: 14px;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(0,229,255,0.16);
          border: 1px solid rgba(0,229,255,0.42);
          color: #9ff6ff;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0;
        }

        .about-loadex {
          width: 100%;
          max-width: 1150px;
          margin-bottom: 34px;
          padding: 28px;
          display: grid;
          grid-template-columns: minmax(0, 1.4fr) minmax(260px, 0.6fr);
          gap: 28px;
          align-items: center;
          background: #0c0c14;
          border: 1px solid rgba(0,255,255,0.16);
          border-radius: 12px;
        }

        .about-loadex h3 {
          margin: 0 0 10px;
          color: #00e5ff;
          font-size: 24px;
        }

        .about-loadex p {
          margin: 0;
          color: #c8d0dc;
          line-height: 1.65;
        }

        .brand-points {
          display: grid;
          gap: 10px;
        }

        .brand-points span {
          padding: 12px;
          border-radius: 8px;
          background: #10131d;
          border: 1px solid rgba(255,255,255,0.08);
          color: #ddd;
          font-weight: bold;
        }

        .product-controls {
          width: 100%;
          max-width: 1150px;
          margin-bottom: 25px;

          display: flex;
          gap: 16px;
          align-items: center;
          justify-content: space-between;
        }

        .search-group {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .product-search {
          min-width: 260px;
          height: 42px;
          padding: 0 14px;
          border-radius: 8px;
          border: 1px solid rgba(0,255,255,0.28);
          background: #0c0c14;
          color: white;
          outline: none;
        }

        .clear-search {
          height: 42px;
          padding: 0 12px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: #10131d;
          color: #aaa;
          cursor: pointer;
          font-weight: bold;
        }

        .product-search:focus {
          border-color: #00e5ff;
          box-shadow: 0 0 12px rgba(0,229,255,0.25);
        }

        .category-filters {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .category-filters button {
          height: 38px;
          padding: 0 13px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.1);
          background: #10131d;
          color: #aaa;
          cursor: pointer;
          font-weight: bold;
        }

        .category-filters button.active {
          color: black;
          background: #00e5ff;
          border-color: #00e5ff;
          box-shadow: 0 0 12px rgba(0,229,255,0.35);
        }

        .result-count {
          width: 100%;
          max-width: 1150px;
          margin: -10px 0 18px;
          color: #888;
          font-size: 13px;
        }

        .empty-products {
          width: 100%;
          max-width: 1150px;
          margin-bottom: 40px;
          padding: 28px;
          border-radius: 12px;
          background: #0c0c14;
          border: 1px solid rgba(0,255,255,0.18);
          color: #888;
          text-align: center;
        }

        .verification-lock {
          width: 100%;
          max-width: 1150px;
          margin: 0 0 22px;
          padding: 14px 16px;
          border-radius: 10px;
          background: rgba(255, 193, 7, 0.12);
          border: 1px solid rgba(255, 193, 7, 0.45);
          color: #ffd37a;
          font-weight: bold;
        }

        .product-image-wrap {
          position: relative;
        }

        .sold-out-label {
          position: absolute;
          top: 10px;
          left: 10px;
          padding: 6px 10px;
          border-radius: 6px;
          background: rgba(255, 0, 110, 0.92);
          color: white;
          font-size: 12px;
          font-weight: bold;
        }

        .sold-out-card {
          opacity: 0.68;
        }

        .stock-line {
          margin-top: 10px;
          color: #00ffaa;
          font-size: 13px;
          font-weight: bold;
        }

        .product-category {
          display: inline-block;
          margin: 0 0 10px;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(168,85,247,0.14);
          border: 1px solid rgba(168,85,247,0.42);
          color: #c084fc;
          font-size: 12px;
          font-weight: bold;
        }

        .stock-line small {
          display: block;
          margin-top: 4px;
          color: #888;
          font-weight: normal;
        }

        @media (max-width: 820px) {
          .about-loadex {
            grid-template-columns: 1fr;
          }
        }

      `}</style>

    </div>
  );
}

export default Dashboard;
