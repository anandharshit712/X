const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/admin.advertiser.advertisers.controller");

// LIST: /api/admin/advertiser/advertisers?q=&page=&limit=
router.get("/advertisers", ctrl.list);

// DETAIL: /api/admin/advertiser/advertisers/:advertiserName
router.get("/advertisers/:advertiserName", ctrl.detail);

module.exports = router;
