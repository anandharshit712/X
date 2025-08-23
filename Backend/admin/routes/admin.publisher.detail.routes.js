const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/admin.publisher.detail.controller");

// GET /api/admin/publisher/publishers/:publisherName
router.get("/publishers/:publisherName", ctrl.getOne);

module.exports = router;
