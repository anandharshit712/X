// routes/apps.routes.js
const { Router } = require("express");
const { authenticateToken } = require("../middleware/auth"); // your JWT middleware
const {
  validateQuery,
  validateParams,
} = require("../middleware/validateRequest");
const { asyncHandler } = require("../middleware/asyncHandler");

let AppsListQuerySchema, AppStatsQuerySchema, AppIdParamsSchema;
try {
  ({
    AppsListQuerySchema,
    AppStatsQuerySchema,
    AppIdParamsSchema,
  } = require("../validations/apps.validation")); // optional; we can add later
} catch {
  AppsListQuerySchema = null;
  AppStatsQuerySchema = null;
  AppIdParamsSchema = null;
}

const controller = require("../controllers/apps.controller");

const r = Router();

/**
 * GET /api/apps
 * Query:
 *  - q?: string (search by app_id or app_package)
 *  - page?: number (default 1)
 *  - size?: number (default 20, max 200)
 */
r.get(
  "/",
  authenticateToken,
  validateQuery(AppsListQuerySchema),
  asyncHandler(controller.listApps)
);

/**
 * GET /api/apps/:app_id/stats
 * Query:
 *  - from?: ISO date (default: today-30d)
 *  - to?:   ISO date (default: today)
 */
r.get(
  "/:app_id/stats",
  authenticateToken,
  validateParams(AppIdParamsSchema),
  validateQuery(AppStatsQuerySchema),
  asyncHandler(controller.getAppStats)
);

module.exports = r;
