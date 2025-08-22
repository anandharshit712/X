// services/dashboard.service.js
const dashboardRepo = require("../repositories/dashboard.repo");

/**
 * Normalize and default the date range to last 30 days (inclusive).
 */
function resolveDateRange(from, to) {
  const end = to ? new Date(to) : new Date(); // today
  // start = end - 29 days to make a 30-day window inclusive
  const start = from
    ? new Date(from)
    : new Date(end.getTime() - 29 * 24 * 60 * 60 * 1000);

  // normalize to ISO (yyyy-mm-dd) for SQL DATE filtering
  const startISO = start.toISOString().slice(0, 10);
  const endISO = end.toISOString().slice(0, 10);
  return { startISO, endISO };
}

/**
 * Build a consistent response shape for the dashboard overview.
 */
async function getOverview({ advertiserId, from, to, appId, country }) {
  const { startISO, endISO } = resolveDateRange(from, to);

  // Parallelize all queries
  const [kpis, trend, topApps, recentActivity] = await Promise.all([
    dashboardRepo.fetchToplineKPIs({
      advertiserId,
      startISO,
      endISO,
      appId,
      country,
    }),
    dashboardRepo.fetchDailyTrend({
      advertiserId,
      startISO,
      endISO,
      appId,
      country,
    }),
    dashboardRepo.fetchTopApps({
      advertiserId,
      startISO,
      endISO,
      appId,
      country,
    }),
    dashboardRepo.fetchRecentActivity({ advertiserId, limit: 10 }),
  ]);

  // Ensure stable shape
  return {
    window: { from: startISO, to: endISO },
    filters: {
      app_id: appId || null,
      country: country || null,
    },
    kpis: {
      revenue: Number(kpis?.revenue || 0),
      clicks: Number(kpis?.clicks || 0),
      conversions: Number(kpis?.conversions || 0),
      ctr:
        kpis?.clicks > 0
          ? Number((kpis.conversions / kpis.clicks) * 100).toFixed(2)
          : "0.00",
    },
    trend: trend.map((row) => ({
      day: row.day, // 'YYYY-MM-DD'
      revenue: Number(row.revenue || 0),
      clicks: Number(row.clicks || 0),
      conversions: Number(row.conversions || 0),
    })),
    top_apps: topApps.map((row) => ({
      app_id: row.app_id,
      app_name: row.app_name || null,
      revenue: Number(row.revenue || 0),
      clicks: Number(row.clicks || 0),
      conversions: Number(row.conversions || 0),
    })),
    recent_activity: recentActivity.map((item) => ({
      id: item.id,
      title: item.title || item.offer_title || null,
      status: item.status || null,
      updated_at: item.updated_at || item.created_at,
    })),
  };
}

module.exports = {
  getOverview,
};
