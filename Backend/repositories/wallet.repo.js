// repositories/wallet.repo.js
const { pools } = require("../config/database");
const pool = pools.dashboard;

/** Latest balance snapshot from dashboard_wallet (by created_at) */
async function fetchLatestBalance({ advertiserId }) {
  const sql = `
    SELECT balance::numeric AS balance, created_at AS as_of
    FROM public.dashboard_wallet
    WHERE advertiser_id = $1
    ORDER BY created_at DESC, id DESC
    LIMIT 1;
  `;
  const { rows } = await pool.query(sql, [advertiserId]);
  return rows[0] || null;
}

/** Compute balance from dashboard_transactions if no snapshot exists */
async function computeBalanceFromTransactions({ advertiserId }) {
  const sql = `
    SELECT
      COALESCE(SUM(CASE WHEN transaction_type = 'TOP_UP'     AND transaction_status = 'SUCCESS' THEN amount ELSE 0 END), 0)
    - COALESCE(SUM(CASE WHEN transaction_type = 'SPEND'      AND transaction_status = 'SUCCESS' THEN amount ELSE 0 END), 0)
    + COALESCE(SUM(CASE WHEN transaction_type = 'REFUND'     AND transaction_status = 'SUCCESS' THEN amount ELSE 0 END), 0)
    + COALESCE(SUM(CASE WHEN transaction_type = 'ADJUSTMENT' AND transaction_status = 'SUCCESS' THEN amount ELSE 0 END), 0)
      AS balance
    FROM public.dashboard_transactions
    WHERE advertiser_id = $1;
  `;
  const { rows } = await pool.query(sql, [advertiserId]);
  const balance = Number(rows?.[0]?.balance || 0);
  return { balance, as_of: new Date().toISOString() };
}

/** Paginated transactions list (matches schema column names) */
async function fetchTransactions({
  advertiserId,
  startISO,
  endISO,
  page = 1,
  size = 20,
  type = null,
}) {
  const offset = (page - 1) * size;
  const params = [advertiserId, startISO, endISO];
  let where = `WHERE advertiser_id = $1 AND created_at::date BETWEEN $2 AND $3`;
  if (type) {
    params.push(type);
    where += ` AND transaction_type = $${params.length}`;
  }

  const sqlItems = `
    SELECT
      transaction_id,
      transaction_type,
      amount::numeric,
      transaction_status,
      coupon_code,
      created_at
    FROM public.dashboard_transactions
    ${where}
    ORDER BY created_at DESC, transaction_id DESC
    LIMIT ${size} OFFSET ${offset};
  `;
  const sqlCount = `
    SELECT COUNT(*)::bigint AS total
    FROM public.dashboard_transactions
    ${where};
  `;

  const [itemsRes, countRes] = await Promise.all([
    pool.query(sqlItems, params),
    pool.query(sqlCount, params),
  ]);

  // Normalize field names for the service/controller
  const items = itemsRes.rows.map((r) => ({
    id: r.transaction_id,
    type: r.transaction_type,
    amount: r.amount,
    status: r.transaction_status,
    note: r.coupon_code || null, // schema has no note; reuse coupon_code if you want a comment
    created_at: r.created_at,
  }));

  return { items, total: Number(countRes.rows?.[0]?.total || 0) };
}

/** Top-up “receipts” = successful TOP_UP transactions in window */
async function fetchTopupReceipts({ advertiserId, startISO, endISO }) {
  const sql = `
    SELECT
      transaction_id,
      amount::numeric,
      transaction_status,
      created_at,
      CONCAT('RCPT-', to_char(created_at, 'YYYYMMDD'), '-', transaction_id) AS receipt_number
    FROM public.dashboard_transactions
    WHERE advertiser_id = $1
      AND transaction_type = 'TOP_UP'
      AND transaction_status = 'SUCCESS'
      AND created_at::date BETWEEN $2 AND $3
    ORDER BY created_at DESC, transaction_id DESC;
  `;
  const { rows } = await pool.query(sql, [advertiserId, startISO, endISO]);
  return rows.map((r) => ({
    id: r.transaction_id,
    amount: r.amount,
    status: r.transaction_status,
    created_at: r.created_at,
    receipt_number: r.receipt_number,
  }));
}

/** Insert a successful TOP_UP transaction (simulated gateway success) */
async function insertTopupTransaction({ advertiserId, amount, note }) {
  const sql = `
    INSERT INTO public.dashboard_transactions
      (advertiser_id, amount, transaction_status, transaction_type, coupon_code, created_at)
    VALUES ($1, $2, 'SUCCESS', 'TOP_UP', $3, NOW())
    RETURNING transaction_id, transaction_type, amount::numeric, transaction_status, coupon_code, created_at;
  `;
  // No 'note' column — storing any note in coupon_code if provided
  const { rows } = await pool.query(sql, [advertiserId, amount, note || null]);
  const r = rows[0];
  return {
    id: r.transaction_id,
    type: r.transaction_type,
    amount: r.amount,
    status: r.transaction_status,
    note: r.coupon_code || null,
    created_at: r.created_at,
  };
}

/**
 * Insert a new wallet snapshot row with updated balance.
 * Since dashboard_wallet is not unique-per-advertiser, we INSERT a new row
 * with (advertiser_id, balance, transaction_type, created_at) and return it.
 */
async function incrementBalance({ advertiserId, delta }) {
  // get latest balance
  const latest = await fetchLatestBalance({ advertiserId });
  const newBalance = Number(
    (Number(latest?.balance || 0) + Number(delta)).toFixed(2)
  );

  const sql = `
    INSERT INTO public.dashboard_wallet
      (advertiser_id, balance, amount_in_inr, transaction_type, created_at, updated_at)
    VALUES ($1, $2, NULL, 'TOP_UP', NOW(), NOW())
    RETURNING id AS wallet_id, advertiser_id, balance::numeric, created_at AS as_of;
  `;
  const { rows } = await pool.query(sql, [advertiserId, newBalance]);
  return {
    wallet_id: rows[0].wallet_id,
    advertiser_id: rows[0].advertiser_id,
    balance: rows[0].balance,
    as_of: rows[0].as_of,
  };
}

/** Track balance snapshot in dashboard_wallet_balance_tracking (link to wallet row) */
async function trackBalance({ advertiserId, balance, wallet_id }) {
  const sql = `
    INSERT INTO public.dashboard_wallet_balance_tracking (advertiser_id, wallet_id, current_balance)
    VALUES ($1, $2, $3);
  `;
  await pool.query(sql, [advertiserId, wallet_id || null, balance]);
}

module.exports = {
  fetchLatestBalance,
  computeBalanceFromTransactions,
  fetchTransactions,
  fetchTopupReceipts,
  insertTopupTransaction,
  incrementBalance,
  trackBalance,
};
