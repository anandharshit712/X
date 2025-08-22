const { createPool } = require("../config/database");
const pool = createPool("service_employee_publisher");

/**
 * Returns KPI cards for the Publisher dashboard.
 * All queries are read-only and scoped to the current month where applicable.
 */
exports.getOverview = async () => {
  // Using date_trunc for current-month windows
  const sql = `
    WITH
    -- total publishers from lookup table if present; else distinct by activity
    total_publishers AS (
      SELECT COUNT(*)::int AS cnt
      FROM public.publishers
    ),
    pending_approvals AS (
      SELECT COUNT(*)::int AS cnt
      FROM public.dashboard_pub_approval
      WHERE LOWER(COALESCE(approval_status, 'pending')) = 'pending'
    ),
    invoices_this_month AS (
      SELECT COUNT(*)::int AS cnt
      FROM public.dashboard_invoices
      WHERE created_at >= date_trunc('month', now())
    ),
    pending_invoices AS (
      SELECT COUNT(*)::int AS cnt
      FROM public.dashboard_invoices
      WHERE LOWER(COALESCE(invoice_status, 'pending')) = 'pending'
    ),
    payouts_this_month AS (
      SELECT COALESCE(SUM(amount), 0)::numeric(18,2) AS amt
      FROM public.dashboard_payout_transactions
      WHERE created_at >= date_trunc('month', now())
    ),
    validations_this_month AS (
      SELECT COUNT(*)::int AS cnt
      FROM public.dashboard_validation
      WHERE COALESCE(created_at, now()) >= date_trunc('month', now())
    )
    SELECT
      (SELECT cnt FROM total_publishers)              AS total_publishers,
      (SELECT cnt FROM pending_approvals)            AS pending_approvals,
      (SELECT cnt FROM invoices_this_month)          AS invoices_this_month,
      (SELECT cnt FROM pending_invoices)             AS pending_invoices,
      (SELECT amt FROM payouts_this_month)           AS payouts_this_month,
      (SELECT cnt FROM validations_this_month)       AS validations_this_month
  `;

  const client = await pool.connect();
  try {
    const { rows } = await client.query(sql);
    // rows[0] contains our KPI set
    return (
      rows[0] || {
        total_publishers: 0,
        pending_approvals: 0,
        invoices_this_month: 0,
        pending_invoices: 0,
        payouts_this_month: 0,
        validations_this_month: 0,
      }
    );
  } finally {
    client.release();
  }
};
