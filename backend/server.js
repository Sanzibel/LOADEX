const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config({ quiet: true });

const { initDB } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ extended: true, limit: "4mb" }));

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

app.get("/", (req, res) => {
  res.send("Loadex API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reviews", reviewRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err.stack);

  if (
    err.name === "MulterError" ||
    err.message === "Only image uploads are allowed"
  ) {
    return res.status(400).json({
      message: err.message,
    });
  }

  res.status(500).json({
    message: "Something went wrong",
  });
});

const startServer = async () => {
  try {
    await initDB();

    const PORT =
      process.env.PORT || 5050;

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("Server failed to start:", err);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
