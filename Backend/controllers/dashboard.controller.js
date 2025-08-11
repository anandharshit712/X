// controllers/dashboard.controller.js
const dashboardService = require("../services/dashboard.service");

/**
 * GET /api/dashboard/overview
 * Returns top-line KPIs, trends, top apps, and recent activity for the advertiser.
 */
async function getOverview(req, res) {
  // advertiser_id should come from your JWT middleware (auth.js)
  const advertiserId = req.user?.advertiser_id; // <-- your auth.js sets req.user
  if (!advertiserId) {
    return res
      .status(401)
      .json({
        ok: false,
        error: { code: "UNAUTHORIZED", message: "Missing advertiser context" },
      });
  }

  const { from, to, app_id, country } = req.query;

  const data = await dashboardService.getOverview({
    advertiserId,
    from,
    to,
    appId: app_id || null, // standardize on app_id
    country: country || null, // optional
  });

  return res.json({ ok: true, data });
}

module.exports = {
  getOverview,
};
