import React, {
  useEffect,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";
import { apiUrl, imageUrl } from "../config/api";

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
  const text =
    getSearchText(product);

  if (text.includes("mouse")) return "Mouse";
  if (text.includes("keyboard")) return "Keyboard";
  if (text.includes("headset")) return "Headset";
  if (text.includes("monitor")) return "Monitor";
  if (text.includes("controller")) return "Controller";
  if (text.includes("chair")) return "Chair";

  return "Other";
};

const getSearchText = (product) =>
  [
    product.name,
    product.description,
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

  if (value.includes("mouse")) return "Mouse";
  if (value.includes("keyboard")) return "Keyboard";
  if (value.includes("headset")) return "Headset";
  if (value.includes("monitor")) return "Monitor";
  if (value.includes("controller")) return "Controller";
  if (value.includes("chair")) return "Chair";

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
    ...Array.from(
      new Set(products.map(getProductCategory))
    ),
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

          <h1>
            Welcome, Player.
          </h1>

          <p>
            Mission Ready.
          </p>

        </div>

      </div>

      {/* FEATURED */}

      <h2 className="section-title">
        Featured Loadouts
      </h2>

      <div className="featured">

        <div className="card">

          <img
            src={setup1}
            alt=""
          />

          <h3>
            Elite Gamer Loadout
          </h3>

          <p>
            Ultimate RGB setup
          </p>

          <span>
            ₱349.99
          </span>

        </div>

        <div className="card">

          <img
            src={setup2}
            alt=""
          />

          <h3>
            Stealth Warrior
          </h3>

          <p>
            Minimal + deadly
          </p>

          <span>
            ₱319.99
          </span>

        </div>

      </div>

      {/* PRODUCTS */}

      <h2 className="section-title">
        Gaming Accessories
      </h2>

      <div className="product-controls">

        <div className="search-group">
          <input
            className="product-search"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            placeholder="Search accessories"
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

          <div
            className="card"
            key={p.id}
            onClick={() =>
              navigate(`/product/${p.id}`)
            }
            style={{
              cursor: "pointer",
            }}
          >

            <img
              src={getImageSrc(p.image)}
              alt={p.name}
            />

            <h4>
              {p.name}
            </h4>

            <p>
              {p.description}
            </p>

            <span>
              ₱{p.price}
            </span>

          </div>

        ))}

      </div>

      {filteredProducts.length === 0 && (
        <div className="empty-products">
          No products match your filters.
        </div>
      )}

      <style>{`

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

      `}</style>

    </div>
  );
}

export default Dashboard;
