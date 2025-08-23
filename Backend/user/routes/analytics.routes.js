// routes/analytics.routes.js
const { Router } = require("express");
const { authenticateToken } = require("../../middleware/auth"); // your existing JWT middleware
const { validateQuery } = require("../../middleware/validateRequest");
const { asyncHandler } = require("../../middleware/asyncHandler");

let AnalyticsQuerySchema;
try {
  // Will exist after we add validations/analytics.validation.js
  ({ AnalyticsQuerySchema } = require("../validations/analytics.validation"));
} catch {
  AnalyticsQuerySchema = null; // no-op until schema is created
}

const controller = require("../controllers/analytics.controller"); // next file

const r = Router();

/**
 * GET /api/analytics
 * Query:
 *  - from?: ISO date (default: today-30d)
 *  - to?:   ISO date (default: today)
 *  - app_id?: string (use app_id everywhere)
 *  - country?: string
 *  - metric?: 'conversions' | 'clicks' | 'revenue' (default: 'conversions')
 */
r.get(
  "/",
  authenticateToken,
  validateQuery(AnalyticsQuerySchema),
  asyncHandler(controller.getAnalytics)
);

module.exports = r;
