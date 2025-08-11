// routes/invoices.routes.js
const { Router } = require("express");
const { authenticateToken } = require("../auth");
const { asyncHandler } = require("../middleware/asyncHandler");
const uploadPdf = require("../middleware/uploadPdf");

const controller = require("../controllers/invoices.controller");
const r = Router();

/**
 * GET /api/invoices
 * Query:
 *  - from?: YYYY-MM-DD (default: last 30d)
 *  - to?:   YYYY-MM-DD
 *  - app_id?: string
 * Returns monthly rollups + computed payout and any uploaded invoice files mapped by month/app.
 */
r.get("/", authenticateToken, asyncHandler(controller.listInvoices));

/**
 * POST /api/invoices/upload
 * Body: multipart/form-data with field name "file" (PDF, max 5 MB)
 * Optional field: invoice_number (string). If not provided, derived from filename.
 */
r.post(
  "/upload",
  authenticateToken,
  uploadPdf.single("file"),
  asyncHandler(controller.uploadInvoice)
);

/**
 * GET /api/invoices/:id/download
 * Streams the stored PDF back to the client.
 */
r.get(
  "/:id/download",
  authenticateToken,
  asyncHandler(controller.downloadInvoice)
);

module.exports = r;
