const express = require("express");
const router = express.Router();

const ctrl = require("../controllers/admin.publisher.overview.controller");

// Summary cards + counts (supports date range)
router.get("/summary", ctrl.getSummary);

// “Top Offers” tables (margins/volume) with optional date range
router.get("/top-offers", ctrl.getTopOffers);

module.exports = router;
