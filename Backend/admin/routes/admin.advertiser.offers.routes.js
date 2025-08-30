const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/admin.advertiser.offers.controller");

// LIST (search/filter/pagination)
router.get("/", ctrl.list);

// CREATE
router.post("/", ctrl.create);

// LOOKUPS (dynamic dropdowns)
router.get("/lookups/offerwall-apps", ctrl.listOfferwallApps);

// UPDATE

// READ one
router.get("/:offerId", ctrl.get);

router.put("/:offerId", ctrl.update);

// STATUS toggle (ACTIVE/PAUSED)
router.patch("/:offerId/status", ctrl.setStatus);

module.exports = router;
