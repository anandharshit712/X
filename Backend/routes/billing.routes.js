const { Router } = require("express");
const { authenticateToken } = require("../auth");
const { asyncHandler } = require("../middleware/asyncHandler");

const controller = require("../controllers/billing.controller");
const r = Router();

r.get("/billing-details", authenticateToken, asyncHandler(controller.getBillingDetails));
r.put("/billing-details", authenticateToken, asyncHandler(controller.upsertBillingDetails));

module.exports = r;
