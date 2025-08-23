const express = require("express");
const router = express.Router();
const ctrl = require("../../controllers/admin.publisher.transactions.controller");

// LIST with filters + summary cards
router.get(
  "/admin/publisher/:publisherName/transactions",
  ctrl.listTransactions
);

// CREATE
router.post(
  "/admin/publisher/:publisherName/transactions",
  ctrl.createTransaction
);

// UPDATE (by row id)
router.put("/admin/publisher/transactions/:id", ctrl.updateTransaction);

// DELETE (by row id)
router.delete("/admin/publisher/transactions/:id", ctrl.deleteTransaction);

module.exports = router;
