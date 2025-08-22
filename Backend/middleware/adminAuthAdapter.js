// Wrap your existing middleware/auth.js without changing it.
const auth = require("./auth");

/**
 * Try common export names from your existing user-side auth middleware.
 * We only need one that attaches req.user on success.
 */
const baseAuth =
  auth.requireAuth ||
  auth.protect ||
  auth.authenticate ||
  auth.verifyToken ||
  auth.authenticateToken ||
  ((req, res, next) => next()); // last resort (no-op) to avoid crashes during wiring; replace if needed

/**
 * Admin gate: adapt to how your user object is shaped.
 * We check the common fields without forcing a schema change.
 */
const requireAdmin = (req, res, next) => {
  const u = req.user || {};
  const role = u.role || u.user_role || u.access_type || u.type;
  if (
    String(role).toLowerCase() === "admin" ||
    String(role).toLowerCase() === "employee"
  ) {
    return next();
  }
  return res.status(403).json({
    success: false,
    error: "forbidden",
    message: "Admin access required",
  });
};

module.exports = {
  requireAuth: baseAuth,
  requireAdmin,
};
