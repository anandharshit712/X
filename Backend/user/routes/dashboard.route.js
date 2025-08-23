// routes/dashboard.routes.js
const { Router } = require("express");
const { authenticateToken } = require("../../middleware/auth"); // your existing auth middleware
const { validateQuery } = require("../../middleware/validateRequest");
const { asyncHandler } = require("../../middleware/asyncHandler");

let DashboardQuerySchema;
try {
  // Optional: we'll add this later under validations/ if you want strict query checks
  DashboardQuerySchema =
    require("../validations/dashboard.validation").DashboardQuerySchema;
} catch (_) {
  DashboardQuerySchema = null; // no-op until schema exists
}

const controller = require("../controllers/dashboard.controller"); // we'll create next

const r = Router();

/**
 * GET /api/dashboard/overview
 * Query params (all optional):
 *  - from: ISO date (default: today-30d)
 *  - to:   ISO date (default: today)
 *  - app_id: string (filter by app)
 *  - country: string (optional; analytics joins will handle)
 */
r.get(
  "/overview",
  authenticateToken,
  validateQuery(DashboardQuerySchema),
  asyncHandler(controller.getOverview)
);

module.exports = r;
