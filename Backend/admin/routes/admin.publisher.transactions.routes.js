const router = require("express").Router();
const controller = require("../controllers/admin.publisher.transactions.controller");
const { requireAuth, requireAdmin } = require("../middleware/adminAuthAdapter");

// GET /api/admin/publisher/transactions?publisher_name=&from=&to=&paid_in_full=&page=&limit=
router.get("/", requireAuth, requireAdmin, controller.list);

module.exports = router;
