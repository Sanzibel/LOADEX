const express = require("express");

const router = express.Router();

const verifyToken =
  require("../middleware/authMiddleware");

const requireAdmin =
  require("../middleware/adminMiddleware");

const upload =
  require("../middleware/uploadMiddleware");

const productController =
  require("../controllers/productController");

// ✅ GET ALL PRODUCTS
router.get(
  "/",
  productController.getProducts
);

// ✅ GET SINGLE PRODUCT
router.get(
  "/:id",
  productController.getProductById
);

// ✅ CREATE PRODUCT
router.post(
  "/",
  verifyToken,
  requireAdmin,
  upload.single("image"),
  productController.createProduct
);

// ✅ UPDATE PRODUCT
router.put(
  "/:id",
  verifyToken,
  requireAdmin,
  upload.single("image"),
  productController.updateProduct
);

// ✅ DELETE PRODUCT
router.delete(
  "/:id",
  verifyToken,
  requireAdmin,
  productController.deleteProduct
);

module.exports = router;
