// repositories/dashboard.repo.js
const { pools } = require("../../config/database");

// Helper to build dynamic WHERE with params
function buildRevenueWhere({ advertiserId, startISO, endISO, appId }) {
  const params = [];
  const clauses = [];

  // constrain by advertiser via the app mapping (offerwall_app)
  clauses.push(`a.advertiser_id = $${params.push(advertiserId)}`);

  // date range on revenue.day
  clauses.push(
    `r.day BETWEEN $${params.push(startISO)} AND $${params.push(endISO)}`
  );

  // optional app_id
  if (appId) {
    clauses.push(`a.app_id = $${params.push(appId)}`);
  }

  return {
    whereSql: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    params,
  };
}

/**
 * Topline KPIs over the window.
 * Tables: service_offerwall.public.offerwall_revenue (r) JOIN offerwall_app (a)
 * Columns used: r.revenue_in_dollars, r.clicks, r.conversions, r.day, a.app_id, a.app_package, a.advertiser_id
 */
async function fetchToplineKPIs({ advertiserId, startISO, endISO, appId }) {
  const { whereSql, params } = buildRevenueWhere({
    advertiserId,
    startISO,
    endISO,
    appId,
  });

  const sql = `
    SELECT
      COALESCE(SUM(r.revenue_in_dollars), 0) AS revenue,
      COALESCE(SUM(r.clicks), 0)            AS clicks,
      COALESCE(SUM(r.conversions), 0)       AS conversions
    FROM public.offerwall_revenue r
    JOIN public.offerwall_app a
      ON a.app_package = r.app_package
     AND a.advertiser_id = $1
    ${whereSql.replace("a.advertiser_id = $1", "a.advertiser_id = $1")}
  `;

  const { rows } = await pools.offerwall.query(sql, params);
  return rows[0] || { revenue: 0, clicks: 0, conversions: 0 };
}

/**
 * Daily trend aggregated by day within the window.
 */
async function fetchDailyTrend({ advertiserId, startISO, endISO, appId }) {
  const { whereSql, params } = buildRevenueWhere({
    advertiserId,
    startISO,
    endISO,
    appId,
  });

  const sql = `
    SELECT
      r.day::date AS day,
      COALESCE(SUM(r.revenue_in_dollars), 0) AS revenue,
      COALESCE(SUM(r.clicks), 0)            AS clicks,
      COALESCE(SUM(r.conversions), 0)       AS conversions
    FROM public.offerwall_revenue r
    JOIN public.offerwall_app a
      ON a.app_package = r.app_package
     AND a.advertiser_id = $1
    ${whereSql.replace("a.advertiser_id = $1", "a.advertiser_id = $1")}
    GROUP BY r.day
    ORDER BY r.day ASC
  `;

  const { rows } = await pools.offerwall.query(sql, params);
  return rows;
}

/**
 * Top apps by revenue within the window (returns up to 5 by default).
 * Note: schema doesn't include app_name; we return app_id and totals.
 */
async function fetchTopApps({
  advertiserId,
  startISO,
  endISO,
  appId,
  limit = 5,
}) {
  const { whereSql, params } = buildRevenueWhere({
    advertiserId,
    startISO,
    endISO,
    appId,
  });
  params.push(limit);

  const sql = `
    SELECT
      a.app_id,
      COALESCE(SUM(r.revenue_in_dollars), 0) AS revenue,
      COALESCE(SUM(r.clicks), 0)            AS clicks,
      COALESCE(SUM(r.conversions), 0)       AS conversions
    FROM public.offerwall_revenue r
    JOIN public.offerwall_app a
      ON a.app_package = r.app_package
     AND a.advertiser_id = $1
    ${whereSql.replace("a.advertiser_id = $1", "a.advertiser_id = $1")}
    GROUP BY a.app_id
    ORDER BY revenue DESC
    LIMIT $${params.length}
  `;

  const { rows } = await pools.offerwall.query(sql, params);
  return rows;
}

/**
 * Recent activity for the advertiser (from service_dashboard DB).
 * Table: public.dashboard_offers (created_at status/title-ish columns)
 */
async function fetchRecentActivity({ advertiserId, limit = 10 }) {
  const sql = `
    SELECT
      id,
      campaign_name AS offer_title,
      offer_status  AS status,
      created_at    AS created_at
    FROM public.dashboard_offers
    WHERE advertiser_id = $1
    ORDER BY created_at DESC
    LIMIT $2
  `;
  const { rows } = await pools.dashboard.query(sql, [advertiserId, limit]);
  return rows;
}

module.exports = {
  fetchToplineKPIs,
  fetchDailyTrend,
  fetchTopApps,
  fetchRecentActivity,
};
