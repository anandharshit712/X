// repositories/analytics.repo.js
const { pools } = require("../../config/database");

/**
 * TIMESERIES (by day)
 * Source: offerwall_revenue (aggregated metrics)
 * Join: offerwall_app to enforce advertiser_id and translate app_package -> app_id
 *
 * @param {object} args
 * @param {number} args.advertiserId
 * @param {string} args.startISO  YYYY-MM-DD
 * @param {string} args.endISO    YYYY-MM-DD
 * @param {string|null} args.appId
 * @param {string} args.metricCol  one of: revenue_in_dollars | clicks | conversions
 */
async function fetchTimeseries({
  advertiserId,
  startISO,
  endISO,
  appId,
  metricCol,
}) {
  const params = [advertiserId, startISO, endISO];
  let appFilter = "";
  if (appId) {
    params.push(appId);
    appFilter = `AND a.app_id = $${params.length}`;
  }

  const sql = `
    SELECT
      r.day::date AS day,
      COALESCE(SUM(r.${metricCol}), 0) AS value
    FROM public.offerwall_revenue r
    JOIN public.offerwall_app a
      ON a.app_package = r.app_package
     AND a.advertiser_id = $1
    WHERE r.day BETWEEN $2 AND $3
      ${appFilter}
    GROUP BY r.day
    ORDER BY r.day ASC;
  `;

  const { rows } = await pools.offerwall.query(sql, params);
  return rows;
}

/**
 * BY COUNTRY
 * Default: compute from CONVERSIONS joined to USERS for geo.
 * Joins:
 *   conversions (c)
 *   -> offers (o) to get app_id
 *   -> offerwall_app (a) to enforce advertiser_id and allow app filter
 *   -> offerwall_users (u) to get country
 *
 * Notes on schema types:
 *  - conversions.offer_id is TEXT, offers.offer_id is BIGSERIAL
 *    We'll CAST conversions.offer_id::BIGINT to join safely.
 */
async function fetchByCountry({ advertiserId, startISO, endISO, appId }) {
  const params = [advertiserId, startISO, endISO];
  let appFilter = "";
  if (appId) {
    params.push(appId);
    appFilter = `AND a.app_id = $${params.length}`;
  }

  const sql = `
    SELECT
      COALESCE(NULLIF(TRIM(u.country), ''), 'UNKNOWN') AS country,
      COUNT(*)::bigint AS value
    FROM public.offerwall_conversions c
    JOIN public.offerwall_offers o
      ON o.offer_id = CAST(c.offer_id AS BIGINT)
    JOIN public.offerwall_app a
      ON a.app_id = o.app_id
     AND a.advertiser_id = $1
    JOIN public.offerwall_users u
      ON u.offerwall_user_id = c.offerwall_user_id
    WHERE c.created_at::date BETWEEN $2 AND $3
      ${appFilter}
    GROUP BY COALESCE(NULLIF(TRIM(u.country), ''), 'UNKNOWN')
    ORDER BY value DESC;
  `;

  const { rows } = await pools.offerwall.query(sql, params);
  return rows;
}

/**
 * BY APP
 * Source: offerwall_revenue (aggregated per app via app_package)
 * Join: offerwall_app to map -> app_id and enforce advertiser_id
 */
async function fetchByApp({
  advertiserId,
  startISO,
  endISO,
  appId,
  metricCol,
}) {
  const params = [advertiserId, startISO, endISO];
  let appFilter = "";
  if (appId) {
    params.push(appId);
    appFilter = `AND a.app_id = $${params.length}`;
  }

  const sql = `
    SELECT
      a.app_id,
      COALESCE(SUM(r.${metricCol}), 0) AS value
    FROM public.offerwall_revenue r
    JOIN public.offerwall_app a
      ON a.app_package = r.app_package
     AND a.advertiser_id = $1
    WHERE r.day BETWEEN $2 AND $3
      ${appFilter}
    GROUP BY a.app_id
    ORDER BY value DESC;
  `;

  const { rows } = await pools.offerwall.query(sql, params);
  return rows;
}

module.exports = {
  fetchTimeseries,
  fetchByCountry,
  fetchByApp,
};
