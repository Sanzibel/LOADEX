const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");
const requireCustomer = require("../middleware/customerMiddleware");
const messageController = require("../controllers/messageController");

router.get("/my", verifyToken, requireCustomer, messageController.getMyMessages);
router.post("/my", verifyToken, requireCustomer, messageController.sendCustomerMessage);

router.get(
  "/admin/threads",
  verifyToken,
  requireAdmin,
  messageController.getAdminThreads
);

router.get(
  "/admin/threads/:userId",
  verifyToken,
  requireAdmin,
  messageController.getAdminThreadMessages
);

router.post(
  "/admin/threads/:userId",
  verifyToken,
  requireAdmin,
  messageController.sendAdminReply
);

module.exports = router;
