// routes/admin/publisher.validation.routes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/admin.publisher.validation.controller");

// GET /api/admin/publisher/validations?publisher=&month=&year=
router.get("/", ctrl.list);

// POST /api/admin/publisher/validations   (create)
router.post("/", ctrl.create);

// PATCH /api/admin/publisher/validations/:employeeEmailId  (update a row – optional)
router.patch("/:employeeEmailId", ctrl.update);

// DELETE /api/admin/publisher/validations/:employeeEmailId (optional, for cleanup)
router.delete("/:employeeEmailId", ctrl.remove);

module.exports = router;
