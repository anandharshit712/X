const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/admin.advertiser.notificationApprovals.controller");

// LIST queue with status + search + pagination
// GET /api/admin/advertiser/notification-approvals?status=pending|approved|rejected|all&q=&page=&limit=
router.get("/notification-approvals", ctrl.list);

// READ one by approvalId (or by notificationId via fallback)
// GET /api/admin/advertiser/notification-approvals/:id
router.get("/notification-approvals/:id", ctrl.get);

// APPROVE / REJECT / PENDING (set status + optional note)
// PATCH /api/admin/advertiser/notification-approvals/:id/status  { status: 'approved'|'rejected'|'pending', note?: string }
router.patch("/notification-approvals/:id/status", ctrl.setStatus);

module.exports = router;
