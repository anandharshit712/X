const jwt = require("jsonwebtoken");
const { pool } = require("../config/database");

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: "Access token required",
        message: "Please provide a valid authentication token",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify user still exists in database
    const users = await pool.query(
      "SELECT advertiser_id, name, email, account_type FROM dashboard_login WHERE advertiser_id = $1",
      [decoded.advertiser_id]
    );

    if (users.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid token",
        message: "User no longer exists",
      });
    }

    req.user = users.rows[0];
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Invalid token",
        message: "The provided token is invalid",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token expired",
        message: "The authentication token has expired",
      });
    }

    console.error("Auth middleware error:", error);
    res.status(500).json({
      error: "Authentication error",
      message: "An error occurred during authentication",
    });
  }
};

const generateToken = (advertiser_id) => {
  return jwt.sign({ advertiser_id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

module.exports = {
  authenticateToken,
  generateToken,
};
