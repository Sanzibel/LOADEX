const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getProfile,
} = require("../controllers/authController");
const verifyToken = require("../middleware/authMiddleware");

// public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// 🔒 protected route
router.get("/profile", verifyToken, getProfile);

module.exports = router;
