const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");
const requireCustomer = require("../middleware/customerMiddleware");

const {
  createOrder,
  getMyOrders,
  getMyOrderDetails,
  cancelMyOrder,
  getAllOrders,
  getAdminStats,
  getOrderDetails,
  updateOrderStatus,
} = require("../controllers/orderController");

// ✅ CREATE ORDER
router.post("/", verifyToken, requireCustomer, createOrder);

// ✅ USER — MY ORDERS
router.get("/my", verifyToken, requireCustomer, getMyOrders);

router.get("/my/:id", verifyToken, requireCustomer, getMyOrderDetails);

router.put("/my/:id/cancel", verifyToken, requireCustomer, cancelMyOrder);

router.get("/stats/summary", verifyToken, requireAdmin, getAdminStats);

// ✅ ADMIN — GET ALL ORDERS
router.get("/", verifyToken, requireAdmin, getAllOrders);

router.get("/:id", verifyToken, requireAdmin, getOrderDetails);

// ✅ ADMIN — UPDATE ORDER STATUS
router.put("/:id/status", verifyToken, requireAdmin, updateOrderStatus);

module.exports = router;
