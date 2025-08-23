// repositories/apps.repo.js
const { pools } = require("../../config/database");

/** List apps for an advertiser with optional search & pagination */
async function fetchApps({ advertiserId, q, page = 1, size = 20 }) {
  const offset = (page - 1) * size;
  const params = [advertiserId];
  let where = `WHERE advertiser_id = $1`;
  if (q) {
    params.push(`%${q}%`, `%${q}%`);
    where += ` AND (app_id ILIKE $${params.length - 1} OR app_package ILIKE $${
      params.length
    })`;
  }

  const sqlItems = `
    SELECT app_id, app_package, created_at
    FROM public.offerwall_app
    ${where}
    ORDER BY created_at DESC
    LIMIT ${size} OFFSET ${offset};
  `;
  const sqlCount = `
    SELECT COUNT(*)::bigint AS total
    FROM public.offerwall_app
    ${where};
  `;

  const [itemsRes, countRes] = await Promise.all([
    pools.offerwall.query(sqlItems, params),
    pools.offerwall.query(sqlCount, params),
  ]);

  return {
    items: itemsRes.rows,
    total: Number(countRes.rows?.[0]?.total || 0),
  };
}

/** Totals for one app over a date window */
async function fetchAppTotals({ advertiserId, appId, startISO, endISO }) {
  const params = [advertiserId, appId, startISO, endISO];
  const sql = `
    SELECT
      COALESCE(SUM(r.revenue_in_dollars), 0) AS revenue,
      COALESCE(SUM(r.clicks), 0)            AS clicks,
      COALESCE(SUM(r.conversions), 0)       AS conversions
    FROM public.offerwall_revenue r
    JOIN public.offerwall_app a
      ON a.app_package = r.app_package
     AND a.advertiser_id = $1
    WHERE a.app_id = $2
      AND r.day BETWEEN $3 AND $4;
  `;
  const { rows } = await pools.offerwall.query(sql, params);
  return rows[0] || { revenue: 0, clicks: 0, conversions: 0 };
}

/** Daily trend for one app over a date window */
async function fetchAppTrend({ advertiserId, appId, startISO, endISO }) {
  const params = [advertiserId, appId, startISO, endISO];
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
    WHERE a.app_id = $2
      AND r.day BETWEEN $3 AND $4
    GROUP BY r.day
    ORDER BY r.day ASC;
  `;
  const { rows } = await pools.offerwall.query(sql, params);
  return rows;
}

module.exports = {
  fetchApps,
  fetchAppTotals,
  fetchAppTrend,
};
