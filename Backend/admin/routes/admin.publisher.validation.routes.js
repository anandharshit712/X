const router = require("express").Router();
const controller = require("../controllers/admin.publisher.validation.controller");
const { requireAuth, requireAdmin } = require("../middleware/adminAuthAdapter");

// GET /api/admin/publisher/validation?publisher_name=&month=&year=&page=&limit=
router.get("/", requireAuth, requireAdmin, controller.list);

module.exports = router;
