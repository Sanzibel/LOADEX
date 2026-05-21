const db = require("../config/db");

const parseRating = (rating) =>
  Number.parseInt(rating, 10);

exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    if (Number.isNaN(Number(productId))) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const summaryResult = await db.query(
      `
        SELECT
          COALESCE(ROUND(AVG(rating)::numeric, 1), 0) AS average_rating,
          COUNT(*)::int AS review_count
        FROM loadex_product_reviews
        WHERE product_id = $1
      `,
      [productId]
    );

    const reviews = await db.query(
      `
        SELECT
          r.id,
          r.product_id,
          r.order_id,
          r.rating,
          r.comment,
          r.created_at,
          r.updated_at,
          u.id AS user_id,
          u.name AS customer_name
        FROM loadex_product_reviews r
        JOIN loadex_users_v1 u ON u.id = r.user_id
        WHERE r.product_id = $1
        ORDER BY r.updated_at DESC, r.id DESC
      `,
      [productId]
    );

    res.json({
      summary: summaryResult[0],
      reviews,
    });
  } catch (err) {
    console.error("GET PRODUCT REVIEWS ERROR:", err);
    res.status(500).json({ message: "Unable to load reviews" });
  }
};

exports.getMyReviewEligibility = async (req, res) => {
  try {
    const { productId } = req.params;

    const purchaseResult = await db.query(
      `
        SELECT o.id
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        WHERE o.user_id = $1
          AND oi.product_id = $2
          AND o.status = 'Delivered'
        ORDER BY o.created_at DESC
        LIMIT 1
      `,
      [req.user.id, productId]
    );

    const reviewResult = await db.query(
      `
        SELECT
          id,
          product_id,
          order_id,
          rating,
          comment,
          created_at,
          updated_at
        FROM loadex_product_reviews
        WHERE user_id = $1
          AND product_id = $2
      `,
      [req.user.id, productId]
    );

    res.json({
      canReview: purchaseResult.length > 0,
      deliveredOrderId: purchaseResult[0]?.id || null,
      myReview: reviewResult[0] || null,
    });
  } catch (err) {
    console.error("GET REVIEW ELIGIBILITY ERROR:", err);
    res.status(500).json({ message: "Unable to check review status" });
  }
};

exports.upsertProductReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const rating = parseRating(req.body.rating);
    const comment = String(req.body.comment || "").trim();

    if (Number.isNaN(Number(productId))) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be from 1 to 5" });
    }

    if (comment.length < 3) {
      return res.status(400).json({ message: "Review comment is too short" });
    }

    if (comment.length > 1000) {
      return res.status(400).json({ message: "Review comment is too long" });
    }

    const purchaseResult = await db.query(
      `
        SELECT o.id
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        WHERE o.user_id = $1
          AND oi.product_id = $2
          AND o.status = 'Delivered'
        ORDER BY o.created_at DESC
        LIMIT 1
      `,
      [req.user.id, productId]
    );

    const deliveredOrder = purchaseResult[0];

    if (!deliveredOrder) {
      return res.status(403).json({
        message: "Only delivered purchases can be reviewed",
      });
    }

    const result = await db.query(
      `
        INSERT INTO loadex_product_reviews (
          user_id,
          product_id,
          order_id,
          rating,
          comment
        )
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id, product_id)
        DO UPDATE SET
          order_id = EXCLUDED.order_id,
          rating = EXCLUDED.rating,
          comment = EXCLUDED.comment,
          updated_at = CURRENT_TIMESTAMP
        RETURNING
          id,
          product_id,
          order_id,
          rating,
          comment,
          created_at,
          updated_at
      `,
      [
        req.user.id,
        productId,
        deliveredOrder.id,
        rating,
        comment,
      ]
    );

    res.status(201).json({
      message: "Review saved",
      review: result[0],
    });
  } catch (err) {
    console.error("UPSERT REVIEW ERROR:", err);
    res.status(500).json({ message: "Unable to save review" });
  }
};
