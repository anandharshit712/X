const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/admin.advertiser.offerApprovals.controller");

// LIST queue with status + search + pagination
// GET /api/admin/advertiser/offer-approvals?status=pending|approved|rejected|all&q=&page=&limit=
router.get("/offer-approvals", ctrl.list);

// READ one by approvalId (or by offerId via query)
// GET /api/admin/advertiser/offer-approvals/:id
router.get("/offer-approvals/:id", ctrl.get);

// APPROVE / REJECT (set status + optional note)
// PATCH /api/admin/advertiser/offer-approvals/:id/status { status: 'approved'|'rejected'|'pending', note?: string }
router.patch("/offer-approvals/:id/status", ctrl.setStatus);

module.exports = router;
