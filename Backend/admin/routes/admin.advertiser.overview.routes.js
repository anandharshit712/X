const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/admin.advertiser.overview.controller");

// Global dashboard summary (cards) + date range
// GET /api/admin/advertiser/overview/summary?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get("/summary", ctrl.getSummary);

// Top offers by margins or volume (date range)
// GET /api/admin/advertiser/overview/top-offers?metric=margins|volume&start=&end=&limit=10
router.get("/top-offers", ctrl.getTopOffers);

module.exports = router;
