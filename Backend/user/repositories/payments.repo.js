// repositories/payments.repo.js
const { pools } = require("../../config/database");

/**
 * Fetch payments-like rows from offerwall side.
 * We don't have a strict schema for payments in your SQL,
 * so we treat "revenue" per day per app as the base, and optionally
 * LEFT JOIN a status table if present.
 *
 * Tables used:
 *  - public.offerwall_revenue  (day, app_package, revenue_in_dollars)
 *  - public.offerwall_app      (app_package -> app_id, advertiser_id)
 *  - public.offerwall_payments_status (optional) keyed by month/app_id
 */
async function fetchPayments({ advertiserId, startISO, endISO, appId }) {
  const params = [advertiserId, startISO, endISO];
  let appFilter = "";
  if (appId) {
    params.push(appId);
    appFilter = `AND a.app_id = $${params.length}`;
  }

  // Aggregate daily gross revenue per app; join a monthly status if exists
  const sql = `
    WITH daily AS (
      SELECT
        r.day::date AS date,
        a.app_id,
        SUM(r.revenue_in_dollars) AS revenue
      FROM public.offerwall_revenue r
      JOIN public.offerwall_app a
        ON a.app_package = r.app_package
       AND a.advertiser_id = $1
      WHERE r.day BETWEEN $2 AND $3
        ${appFilter}
      GROUP BY r.day::date, a.app_id
    )
    SELECT
      d.date,
      d.app_id,
      d.revenue,
      ps.status
    FROM daily d
    LEFT JOIN public.offerwall_payments_status ps
      ON ps.month = to_char(d.date, 'YYYY-MM')
     AND ps.app_id = d.app_id
    ORDER BY d.date ASC, d.app_id ASC;
  `;

  const { rows } = await pools.offerwall.query(sql, params);
  return rows;
}

/**
 * Fetch status rows for a given month/app_id (if table exists).
 * Expects month as 'YYYY-MM'.
 */
async function fetchPaymentStatus({ advertiserId, month, appId }) {
  const params = [advertiserId];
  let where = `WHERE a.advertiser_id = $1`;
  if (month) {
    params.push(month);
    where += ` AND ps.month = $${params.length}`;
  }
  if (appId) {
    params.push(appId);
    where += ` AND ps.app_id = $${params.length}`;
  }

  const sql = `
    SELECT
      ps.month,
      ps.app_id,
      ps.status,
      ps.updated_at
    FROM public.offerwall_payments_status ps
    JOIN public.offerwall_app a
      ON a.app_id = ps.app_id
     AND a.advertiser_id = $1
    ${where.replace("WHERE a.advertiser_id = $1", "WHERE a.advertiser_id = $1")}
    ORDER BY ps.month DESC, ps.app_id ASC;
  `;

  const { rows } = await pools.offerwall.query(sql, params);
  return rows;
}

module.exports = { fetchPayments, fetchPaymentStatus };
