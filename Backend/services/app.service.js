// services/apps.service.js
const appsRepo = require("../repositories/app.repo");

function resolveDateRange(from, to) {
  const end = to ? new Date(to) : new Date();
  const start = from
    ? new Date(from)
    : new Date(end.getTime() - 29 * 24 * 60 * 60 * 1000);
  const startISO = start.toISOString().slice(0, 10);
  const endISO = end.toISOString().slice(0, 10);
  return { startISO, endISO };
}

async function listApps({ advertiserId, q, page, size }) {
  const [{ items, total }] = await Promise.all([
    appsRepo.fetchApps({ advertiserId, q, page, size }),
  ]);

  return {
    page,
    size,
    total,
    items: items.map((a) => ({
      app_id: a.app_id,
      app_package: a.app_package,
      created_at: a.created_at,
      // add more fields when available (e.g., app_name)
    })),
  };
}

async function getAppStats({ advertiserId, appId, from, to }) {
  const { startISO, endISO } = resolveDateRange(from, to);

  const [kpis, trend] = await Promise.all([
    appsRepo.fetchAppTotals({ advertiserId, appId, startISO, endISO }),
    appsRepo.fetchAppTrend({ advertiserId, appId, startISO, endISO }),
  ]);

  return {
    window: { from: startISO, to: endISO },
    app_id: appId,
    kpis: {
      revenue: Number(kpis?.revenue || 0),
      clicks: Number(kpis?.clicks || 0),
      conversions: Number(kpis?.conversions || 0),
    },
    trend: trend.map((r) => ({
      day: r.day,
      revenue: Number(r.revenue || 0),
      clicks: Number(r.clicks || 0),
      conversions: Number(r.conversions || 0),
    })),
  };
}

module.exports = {
  listApps,
  getAppStats,
};
