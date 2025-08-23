const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/admin.advertiser.offerRewards.controller");

// LIST all rewards for an offer
// GET /api/admin/advertiser/offers/:offerId/rewards
router.get("/offers/:offerId/rewards", ctrl.list);

// CREATE a reward for an offer
// POST /api/admin/advertiser/offers/:offerId/rewards
router.post("/offers/:offerId/rewards", ctrl.create);

// UPDATE one reward (by rewardId)
// PUT /api/admin/advertiser/rewards/:rewardId
router.put("/rewards/:rewardId", ctrl.update);

// DELETE one reward (by rewardId)
// DELETE /api/admin/advertiser/rewards/:rewardId
router.delete("/rewards/:rewardId", ctrl.remove);

module.exports = router;
