// controllers/apps.controller.js
const appsService = require("../services/app.service");

/** GET /api/apps */
async function listApps(req, res) {
  const advertiserId = req.user?.advertiser_id;
  if (!advertiserId) {
    return res
      .status(401)
      .json({
        ok: false,
        error: { code: "UNAUTHORIZED", message: "Missing advertiser context" },
      });
  }

  const { q, page = 1, size = 20 } = req.query;
  const data = await appsService.listApps({
    advertiserId,
    q: q || null,
    page: Number(page) || 1,
    size: Math.min(Number(size) || 20, 200),
  });

  return res.json({ ok: true, ...data });
}

/** GET /api/apps/:app_id/stats */
async function getAppStats(req, res) {
  const advertiserId = req.user?.advertiser_id;
  if (!advertiserId) {
    return res
      .status(401)
      .json({
        ok: false,
        error: { code: "UNAUTHORIZED", message: "Missing advertiser context" },
      });
  }

  const { app_id } = req.params;
  const { from, to } = req.query;

  const data = await appsService.getAppStats({
    advertiserId,
    appId: app_id,
    from: from || null,
    to: to || null,
  });

  return res.json({ ok: true, data });
}

module.exports = {
  listApps,
  getAppStats,
};
