const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/admin.publisher.approvals.controller");

// List by status + search + pagination
// GET /api/admin/publisher/approvals?status=pending|approved|rejected&q=&page=&size=
router.get("/", ctrl.list);

// Approve/Reject overall (per employee email OR publisher name)
/// PATCH /api/admin/publisher/approvals/status
// { employee_emailid?: string, publisher_name?: string, status: 'approved'|'rejected'|'pending' }
router.patch("/status", ctrl.setStatus);

// (Optional) Per‑section statuses if you later add columns (bank/company/billing)
// PATCH /api/admin/publisher/approvals/section
// { publisher_name, section: 'bank'|'company'|'billing', status: 'approved'|'rejected'|'pending' }
router.patch("/section", ctrl.setSectionStatus);

module.exports = router;
