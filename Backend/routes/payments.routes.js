// routes/payments.routes.js
const { Router } = require("express");
const { authenticateToken } = require("../auth");
const { asyncHandler } = require("../middleware/asyncHandler");

const controller = require("../controllers/payments.controller");
const r = Router();

/**
 * GET /api/payments
 * Query: from?, to?, app_id?
 * Returns list of payments within window + totals and computed payout (after commission ex-GST).
 */
r.get("/", authenticateToken, asyncHandler(controller.listPayments));

/**
 * GET /api/payments/status
 * Query: month=YYYY-MM (required), app_id?
 * Returns status rows for that month/app (approval/validation).
 */
r.get("/status", authenticateToken, asyncHandler(controller.getPaymentStatus));

module.exports = r;
