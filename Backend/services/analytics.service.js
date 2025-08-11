// services/analytics.service.js
const analyticsRepo = require("../repositories/analytics.repo");

/** Default window: last 30 days (inclusive) */
function resolveDateRange(from, to) {
  const end = to ? new Date(to) : new Date();
  const start = from ? new Date(from) : new Date(end.getTime() - 29 * 24 * 60 * 60 * 1000);
  const startISO = start.toISOString().slice(0, 10);
  const endISO = end.toISOString().slice(0, 10);
  const days = Math.max(1, Math.ceil((new Date(endISO) - new Date(startISO)) / (24 * 3600 * 1000)) + 1);
  return { startISO, endISO, days };
}

/** Map metric to column/expression names used in SQL */
function metricToSql(metric) {
  // r = offerwall_revenue aggregate source
  // For by-country we use conversions/events joined to users as default
  switch (metric) {
    case "revenue":
      return { col: "revenue_in_dollars", label: "revenue" };
    case "clicks":
      return { col: "clicks", label: "clicks" };
    case "conversions":
    default:
      return { col: "conversions", label: "conversions" };
  }
}

async function getAnalytics({ advertiserId, from, to, appId, country, metric = "conversions" }) {
  const { startISO, endISO, days } = resolveDateRange(from, to);
  const { col, label } = metricToSql(metric);

  // Parallel fetches
  const [timeseries, byCountry, byApp] = await Promise.all([
    analyticsRepo.fetchTimeseries({ advertiserId, startISO, endISO, appId, metricCol: col }),
    analyticsRepo.fetchByCountry({
      advertiserId,
      startISO,
      endISO,
      appId,
      // by-country always computed from conversions joined to users (default you approved)
      // even if metric=revenue/clicks, the by-country tab is usually about user geography
    }),
    analyticsRepo.fetchByApp({ advertiserId, startISO, endISO, appId, metricCol: col }),
  ]);

  // KPIs
  const total = timeseries.reduce((acc, r) => acc + Number(r.value || 0), 0);
  const daily_avg = Number((total / days).toFixed(2));

  return {
    window: { from: startISO, to: endISO, days },
    filters: { app_id: appId || null, country: country || null, metric },
    kpis: { [label]: total, daily_avg },
    timeseries: timeseries.map(r => ({ day: r.day, value: Number(r.value || 0) })),
    by_country: byCountry.map(r => ({ country: r.country, value: Number(r.value || 0) })),
    by_app: byApp.map(r => ({ app_id: r.app_id, value: Number(r.value || 0) })),
  };
}

module.exports = {
  getAnalytics,
};
