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
  const [reviewData, setReviewData] = useState({
    summary: {
      average_rating: 0,
      review_count: 0,
    },
    reviews: [],
  });
  const [eligibility, setEligibility] = useState({
    canReview: false,
    myReview: null,
  });
  const [reviewForm, setReviewForm] = useState({
    rating: "5",
    comment: "",
  });
  const [reviewMessage, setReviewMessage] = useState("");
  const [savingReview, setSavingReview] = useState(false);

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

        const reviewRes = await fetch(
          apiUrl(`/api/reviews/products/${id}`)
        );

        const reviews = await reviewRes.json();

        if (reviewRes.ok) {
          setReviewData(reviews);
        }

        const token = localStorage.getItem("token");

        if (token) {
          const eligibilityRes = await fetch(
            apiUrl(`/api/reviews/products/${id}/my`),
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const eligibilityData = await eligibilityRes.json();

          if (eligibilityRes.ok) {
            setEligibility(eligibilityData);

            if (eligibilityData.myReview) {
              setReviewForm({
                rating: String(eligibilityData.myReview.rating),
                comment: eligibilityData.myReview.comment,
              });
            }
          }
        }

      } catch (err) {

        console.error(err);
        setError("Unable to load product.");
      } finally {

        setLoading(false);
      }
    };

    fetchProduct();

  }, [id]);

  const refreshReviews = async () => {
    const reviewRes = await fetch(
      apiUrl(`/api/reviews/products/${id}`)
    );

    const reviews = await reviewRes.json();

    if (reviewRes.ok) {
      setReviewData(reviews);
    }

    const eligibilityRes = await fetch(
      apiUrl(`/api/reviews/products/${id}/my`),
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const eligibilityData = await eligibilityRes.json();

    if (eligibilityRes.ok) {
      setEligibility(eligibilityData);
    }
  };

  // ✅ FIXED IMAGE HANDLER
  const getImageSrc = (image) => {

    if (!image) {
      return "";
    }

    // 🔥 uploaded image
    if (
      image.startsWith("data:") ||
      image.startsWith("http://") ||
      image.startsWith("https://") ||
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

  const submitReview = async (e) => {
    e.preventDefault();

    const comment = reviewForm.comment.trim();

    if (!comment) {
      setReviewMessage("Please add a review comment.");
      return;
    }

    try {
      setSavingReview(true);
      setReviewMessage("");

      const res = await fetch(
        apiUrl(`/api/reviews/products/${id}`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            rating: reviewForm.rating,
            comment,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setReviewMessage(data.message || "Unable to save review.");
        return;
      }

      setReviewMessage(data.message || "Review saved.");
      await refreshReviews();
    } catch (err) {
      console.error(err);
      setReviewMessage("Unable to save review.");
    } finally {
      setSavingReview(false);
    }
  };

  const averageRating =
    Number(reviewData.summary?.average_rating || 0);

  const reviewCount =
    Number(reviewData.summary?.review_count || 0);

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

          <div
            style={{
              marginBottom: "20px",
              color: "#00ffaa",
              fontWeight: "bold",
            }}
          >
            Rating: {averageRating.toFixed(1)} / 5 ({reviewCount} reviews)
          </div>

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

      <div className="reviews-section">
        <div className="reviews-heading">
          <h2>Customer Reviews</h2>
          <span>
            {averageRating.toFixed(1)} / 5 from {reviewCount} reviews
          </span>
        </div>

        {reviewMessage && (
          <div className="review-message">
            {reviewMessage}
          </div>
        )}

        {eligibility.canReview ? (
          <form className="review-form" onSubmit={submitReview}>
            <div>
              <label>Rating</label>
              <select
                value={reviewForm.rating}
                onChange={(e) =>
                  setReviewForm({
                    ...reviewForm,
                    rating: e.target.value,
                  })
                }
              >
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Good</option>
                <option value="3">3 - Okay</option>
                <option value="2">2 - Poor</option>
                <option value="1">1 - Bad</option>
              </select>
            </div>

            <div>
              <label>
                {eligibility.myReview
                  ? "Edit your review"
                  : "Write a review"}
              </label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) =>
                  setReviewForm({
                    ...reviewForm,
                    comment: e.target.value,
                  })
                }
                maxLength="1000"
                placeholder="Share your experience with this product"
              />
            </div>

            <button type="submit" disabled={savingReview}>
              {savingReview
                ? "Saving..."
                : eligibility.myReview
                  ? "Update Review"
                  : "Submit Review"}
            </button>
          </form>
        ) : (
          <div className="review-note">
            Reviews open after a delivered purchase of this product.
          </div>
        )}

        <div className="review-list">
          {reviewData.reviews.length === 0 ? (
            <div className="review-note">
              No reviews yet.
            </div>
          ) : (
            reviewData.reviews.map((review) => (
              <div className="review-card" key={review.id}>
                <div className="review-top">
                  <strong>{review.customer_name}</strong>
                  <span>{review.rating} / 5</span>
                </div>
                <p>{review.comment}</p>
                <small>
                  {new Date(review.updated_at).toLocaleString()}
                </small>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        .reviews-section {
          max-width: 1200px;
          margin: 60px auto 0;
          padding: 24px;
          background: #0c0c14;
          border: 1px solid rgba(0,255,255,0.18);
          border-radius: 14px;
        }

        .reviews-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 22px;
        }

        .reviews-heading h2 {
          margin: 0;
          color: #00e5ff;
        }

        .reviews-heading span {
          color: #00ffaa;
          font-weight: bold;
        }

        .review-form {
          display: grid;
          grid-template-columns: 180px 1fr auto;
          gap: 14px;
          align-items: end;
          margin-bottom: 24px;
        }

        .review-form label {
          display: block;
          margin-bottom: 8px;
          color: #888;
          font-size: 12px;
          text-transform: uppercase;
        }

        .review-form select,
        .review-form textarea {
          width: 100%;
          background: #151824;
          border: 1px solid rgba(0,255,255,0.16);
          border-radius: 8px;
          color: white;
          outline: none;
          padding: 12px;
        }

        .review-form textarea {
          min-height: 82px;
          resize: vertical;
        }

        .review-form button {
          min-height: 44px;
          border: none;
          border-radius: 8px;
          background: #00c2d4;
          color: black;
          cursor: pointer;
          font-weight: bold;
          padding: 0 16px;
        }

        .review-form button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .review-message,
        .review-note {
          padding: 14px;
          border-radius: 10px;
          margin-bottom: 18px;
          background: #10131d;
          border: 1px solid rgba(255,255,255,0.08);
          color: #aaa;
        }

        .review-list {
          display: grid;
          gap: 14px;
        }

        .review-card {
          padding: 16px;
          border-radius: 12px;
          background: #10131d;
          border: 1px solid rgba(255,255,255,0.08);
        }

        .review-top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
        }

        .review-top span {
          color: #ff00aa;
          font-weight: bold;
        }

        .review-card p {
          margin: 0 0 10px;
          color: #ddd;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        .review-card small {
          color: #777;
        }

        @media (max-width: 900px) {
          .review-form {
            grid-template-columns: 1fr;
          }

          .reviews-heading {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>

    </div>
  );
};

export default ProductDetails;
