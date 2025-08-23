// routes/admin/publisher.invoices.routes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../../controllers/admin/publisher.invoices.controller");

// GET /api/admin/publisher/invoices?status=&publisher=&month=&year=&search=
router.get("/", ctrl.list);

// POST /api/admin/publisher/invoices
router.post("/", ctrl.create);

// PATCH /api/admin/publisher/invoices/:invoiceNumber  (status / notes updates)
router.patch("/:invoiceNumber", ctrl.update);

// (Optional) GET one by invoice number
router.get("/:invoiceNumber", ctrl.get);

module.exports = router;
