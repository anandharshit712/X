const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/admin.publisher.list.controller");

// GET /api/admin/publisher/publishers?q=&page=&limit=
router.get("/publishers", ctrl.list);

module.exports = router;
