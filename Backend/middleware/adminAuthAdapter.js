// middleware/adminAuthAdapter.js
// Tiny adapter that reuses your existing JWT auth and adds an admin-only gate.

const jwt = require("jsonwebtoken");

/**
 * Extract a Bearer token from Authorization header.
 */
function getBearerToken(req) {
  const hdr = req.headers.authorization || "";
  if (!hdr.startsWith("Bearer ")) return null;
  return hdr.slice(7);
}

/**
 * Authenticate the request via JWT.
 * - Expects process.env.JWT_SECRET to be set.
 * - On success, attaches decoded payload to req.user.
 */
function requireAuth(req, res, next) {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "unauthorized",
        message: "Access token required",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded typically contains: { sub: <userId>, email, role, iat, exp }
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: "unauthorized",
      message: "Invalid or expired token",
    });
  }
}

/**
 * Simple helper — true if email is @mobtions.com (case-insensitive).
 */
function isAdminEmail(email = "") {
  return /@mobtions\.com$/i.test((email || "").trim());
}

/**
 * Require an admin.
 * - Allows if req.user.role === 'admin' (preferred).
 * - Also allows if req.user.email ends with @mobtions.com (safety net).
 */
function requireAdmin(req, res, next) {
  const role = String(req.user?.role || "").toLowerCase();
  const email = req.user?.email || "";

  if (role === "admin" || isAdminEmail(email)) {
    return next();
  }
  return res.status(403).json({
    success: false,
    error: "forbidden",
    message: "Admin access required",
  });
}

module.exports = { requireAuth, requireAdmin };
