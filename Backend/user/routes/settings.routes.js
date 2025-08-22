// routes/settings.routes.js
const { Router } = require("express");
const { authenticateToken } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/asyncHandler");

const controller = require("../controllers/settings.controller");
const r = Router();

/** GET /api/settings/account  */
r.get("/account", authenticateToken, asyncHandler(controller.getAccount));

/** PUT /api/settings/account  */
r.put("/account", authenticateToken, asyncHandler(controller.updateAccount));

module.exports = r;
