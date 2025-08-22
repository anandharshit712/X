const router = require("express").Router();
const controller = require("../controllers/admin.publisher.overview.controller");
const { requireAuth, requireAdmin } = require("../middleware/adminAuthAdapter");

// GET /api/admin/publisher/overview
router.get("/", requireAuth, requireAdmin, controller.getOverview);

module.exports = router;
