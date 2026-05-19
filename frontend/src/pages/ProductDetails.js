import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiUrl, imageUrl } from "../config/api";

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

const ProductDetails = () => {

  const { id } = useParams();

  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    const fetchProduct = async () => {

      try {
        setLoading(true);

        const res = await fetch(
          apiUrl(`/api/products/${id}`)
        );

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Product not found.");
          return;
        }

        setError("");
        setProduct(data);

      } catch (err) {

        console.error(err);
        setError("Unable to load product.");
      } finally {

        setLoading(false);
      }
    };

    fetchProduct();

  }, [id]);

  // ✅ FIXED IMAGE HANDLER
  const getImageSrc = (image) => {

    if (!image) {
      return "";
    }

    // 🔥 uploaded image
    if (
      image.includes("/uploads/")
    ) {

      return imageUrl(image);
    }

    // 🔥 old asset image
    return imageMap[image];
  };

  const handleAddToCart = () => {

    const cart =
      JSON.parse(
        localStorage.getItem("cart")
      ) || [];

    const index =
      cart.findIndex(
        (p) => p.id === product.id
      );

    if (index !== -1) {

      cart[index].qty += 1;

    } else {

      cart.push({
        ...product,
        qty: 1,
      });
    }

    localStorage.setItem(
      "cart",
      JSON.stringify(cart)
    );

    // 🔥 update navbar count
    window.dispatchEvent(
      new Event("cartUpdated")
    );

    navigate("/cart");
  };

  if (loading) {
    return (
      <div style={{ color: "white", padding: "60px" }}>
        Loading product...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ color: "white", padding: "60px" }}>
        {error || "Product not found."}
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        padding: "60px 100px",
        color: "white",
      }}
    >

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: "80px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >

        {/* LEFT IMAGE */}
        <div style={{ flex: 1 }}>

          <img
            src={getImageSrc(product.image)}
            alt={product.name}
            style={{
              width: "100%",
              maxWidth: "750px",
              borderRadius: "10px",
              boxShadow:
                "0 0 40px rgba(0,255,255,0.15)",
              objectFit: "cover",
            }}
          />

        </div>

        {/* RIGHT SIDE */}
        <div
          style={{
            flex: 1,
            maxWidth: "550px",
          }}
        >

          {/* TITLE */}
          <h1
            style={{
              fontSize: "48px",
              marginBottom: "10px",
              color: "#00e5ff",
              textShadow:
                "0 0 8px #00e5ff, 0 0 20px #00e5ff, 0 0 35px #00e5ff",
            }}
          >
            {product.name}
          </h1>

          {/* PRICE */}
          <h2
            style={{
              color: "#ff00aa",
              fontSize: "26px",
              marginBottom: "20px",
            }}
          >
            ₱{product.price}
          </h2>

          <hr
            style={{
              borderColor: "#222",
              marginBottom: "25px",
            }}
          />

          {/* DESCRIPTION */}
          <h3
            style={{
              marginBottom: "10px",
            }}
          >
            Description
          </h3>

          <p
            style={{
              opacity: 0.8,
              lineHeight: "1.6",
            }}
          >
            {product.description}
          </p>

          <hr
            style={{
              borderColor: "#222",
              margin: "25px 0",
            }}
          />

          {/* FEATURES */}
          <h3
            style={{
              marginBottom: "10px",
            }}
          >
            Features
          </h3>

          <ul
            style={{
              lineHeight: "1.8",
              opacity: 0.9,
            }}
          >
            <li>Premium build quality</li>
            <li>RGB customization</li>
            <li>Optimized for competitive gaming</li>
            <li>1-year warranty included</li>
          </ul>

          {/* BUTTON */}
          <button
            onClick={handleAddToCart}
            style={{
              marginTop: "30px",
              width: "100%",
              padding: "18px",
              background: "#00c2d4",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            🛒 Add to Cart
          </button>

        </div>

      </div>

    </div>
  );
};

export default ProductDetails;
