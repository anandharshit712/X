// controllers/analytics.controller.js
const analyticsService = require("../services/analytics.service");

/**
 * GET /api/analytics
 * Returns analytics over a date window with optional filters.
 *
 * Response shape (example):
 * {
 *   ok: true,
 *   data: {
 *     window: { from: "2025-07-12", to: "2025-08-10" },
 *     filters: { app_id: "app_123", country: "US", metric: "conversions" },
 *     kpis: { total: 1234, daily_avg: 41.13 },
 *     timeseries: [{ day: "2025-08-01", value: 50 }, ...],
 *     by_country: [{ country: "US", value: 900 }, { country: "IN", value: 334 }],
 *     by_app: [{ app_id: "app_123", value: 1200 }, { app_id: "app_456", value: 34 }]
 *   }
 * }
 */
async function getAnalytics(req, res) {
  const advertiserId = req.user?.advertiser_id;
  if (!advertiserId) {
    return res.status(401).json({
      ok: false,
      error: { code: "UNAUTHORIZED", message: "Missing advertiser context" },
    });
  }

  const { from, to, app_id, country } = req.query;

  // Metric defaulting & guard (validation layer will also enforce)
  const allowed = new Set(["conversions", "clicks", "revenue"]);
  const metric = allowed.has((req.query.metric || "").toLowerCase())
    ? req.query.metric.toLowerCase()
    : "conversions";

  const data = await analyticsService.getAnalytics({
    advertiserId,
    from,
    to,
    appId: app_id || null,
    country: country || null,
    metric, // default 'conversions'
  });

  return res.json({ ok: true, data });
}

module.exports = {
  getAnalytics,
};
