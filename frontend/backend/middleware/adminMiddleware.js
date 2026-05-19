const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: "authentication required",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "admin access required",
    });
  }

  next();
};

module.exports = requireAdmin;
