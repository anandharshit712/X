const router = require("express").Router();
const controller = require("../controllers/admin.publisher.invoices.controller");
const { requireAuth, requireAdmin } = require("../middleware/adminAuthAdapter");

// GET /api/admin/publisher/invoices?publisher_name=&month=&year=&invoice_status=&page=&limit=
router.get("/", requireAuth, requireAdmin, controller.list);

module.exports = router;
