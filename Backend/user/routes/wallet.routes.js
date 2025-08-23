// routes/wallet.routes.js
const { Router } = require("express");
const { authenticateToken } = require("../../middleware/auth");
const { asyncHandler } = require("../../middleware/asyncHandler");

const controller = require("../controllers/wallet.controller");
const r = Router();

/** GET /api/wallet/balance */
r.get("/balance", authenticateToken, asyncHandler(controller.getBalance));

/**
 * GET /api/wallet/transactions?from&to&page&size&type
 * type (optional): TOP_UP | ADJUSTMENT | SPEND | REFUND
 */
r.get(
  "/transactions",
  authenticateToken,
  asyncHandler(controller.listTransactions)
);

/** GET /api/wallet/invoices?from&to  (receipts for TOP_UP transactions) */
r.get("/invoices", authenticateToken, asyncHandler(controller.listReceipts));

/**
 * POST /api/wallet/add-funds
 * Body: { amount: number, note?: string }
 * Simulates a successful top-up (no payment gateway integration)
 */
r.post("/add-funds", authenticateToken, asyncHandler(controller.addFunds));

module.exports = r;
