// config/jwt.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/** Create a signed JWT for a payload (e.g., { userId, advertiser_id, role }) */
function signToken(payload, options = {}) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    ...options,
  });
}

/** Verify a token string; throws if invalid/expired */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/** Helper to read config elsewhere if needed */
function getJwtConfig() {
  return { secret: JWT_SECRET, expiresIn: JWT_EXPIRES_IN };
}

module.exports = {
  signToken,
  verifyToken,
  getJwtConfig,
};
