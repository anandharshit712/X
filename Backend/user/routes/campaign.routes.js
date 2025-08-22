// routes/campaigns.routes.js
const { Router } = require("express");
const { authenticateToken } = require("../../middleware/auth");
const { asyncHandler } = require("../../middleware/asyncHandler");

const controller = require("../controllers/campaign.controller");
const r = Router();

/**
 * GET /api/campaigns
 * Query: q?, status?, from?, to?, page?, size?
 */
r.get("/", authenticateToken, asyncHandler(controller.listCampaigns));

/**
 * GET /api/campaigns/:id
 */
r.get("/:id", authenticateToken, asyncHandler(controller.getCampaign));

/**
 * POST /api/campaigns
 * Body: { campaign_name, app, app_category, description, bid_requested, tracking_type, capping, tracking_url, offer_type }
 * Sets offer_status = 'PENDING' by default; bid_accepted is NULL initially.
 */
r.post("/", authenticateToken, asyncHandler(controller.createCampaign));

/**
 * PUT /api/campaigns/:id
 * Body: any of the campaign fields. You may also set offer_status and/or bid_accepted.
 */
r.put("/:id", authenticateToken, asyncHandler(controller.updateCampaign));

module.exports = r;
