const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const requireCustomer = require("../middleware/customerMiddleware");
const notificationController = require("../controllers/notificationController");

router.get("/", verifyToken, requireCustomer, notificationController.getMyNotifications);
router.get(
  "/unread-count",
  verifyToken,
  requireCustomer,
  notificationController.getUnreadCount
);
router.put(
  "/read-all",
  verifyToken,
  requireCustomer,
  notificationController.markAllNotificationsRead
);
router.put(
  "/:id/read",
  verifyToken,
  requireCustomer,
  notificationController.markNotificationRead
);

module.exports = router;
