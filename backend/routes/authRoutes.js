const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getProfile,
  uploadMyId,
  getPendingVerifications,
  updateVerificationStatus,
} = require("../controllers/authController");
const verifyToken = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.post("/register", upload.single("idImage"), registerUser);
router.post("/login", loginUser);

router.get("/profile", verifyToken, getProfile);
router.post(
  "/profile/id",
  verifyToken,
  upload.single("idImage"),
  uploadMyId
);
router.get(
  "/verifications/pending",
  verifyToken,
  requireAdmin,
  getPendingVerifications
);
router.put(
  "/verifications/:id",
  verifyToken,
  requireAdmin,
  updateVerificationStatus
);

module.exports = router;
