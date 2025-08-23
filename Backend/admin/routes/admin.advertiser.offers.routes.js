const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/admin.advertiser.offers.controller");

// LIST (search/filter/pagination)
router.get("/", ctrl.list);

// CREATE
router.post("/", ctrl.create);

// READ one
router.get("/:offerId", ctrl.get);

// UPDATE
router.put("/:offerId", ctrl.update);

// STATUS toggle (ACTIVE/PAUSED)
router.patch("/:offerId/status", ctrl.setStatus);

module.exports = router;
