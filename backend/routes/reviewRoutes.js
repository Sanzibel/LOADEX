const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const requireCustomer = require("../middleware/customerMiddleware");
const reviewController = require("../controllers/reviewController");

router.get("/products/:productId", reviewController.getProductReviews);
router.get(
  "/products/:productId/my",
  verifyToken,
  requireCustomer,
  reviewController.getMyReviewEligibility
);
router.post(
  "/products/:productId",
  verifyToken,
  requireCustomer,
  reviewController.upsertProductReview
);

module.exports = router;
