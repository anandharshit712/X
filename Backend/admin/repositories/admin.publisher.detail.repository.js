const { pools } = require("../../config/database");
const db = pools.employeePublisher; // service_employee_publisher

exports.ensurePublisher = async (publisherName) => {
  // confirm exists; if not, return null
  const { rows } = await db.query(
    `SELECT publisher_name FROM public.publishers WHERE publisher_name = $1`,
    [publisherName]
  );
  return rows[0] ? rows[0].publisher_name : null;
};

exports.getProfile = async (publisherName) => {
  const { rows } = await db.query(
    `SELECT publisher_name, employee_emailid,
            beneficiary_name, bank_name, account_number, ifsc_code,
            gst_no, pan_no,
            billing_country, billing_state, billing_address, billing_locality, billing_pin_code,
            updated_at
       FROM public.dashboard_validation
      WHERE publisher_name = $1
      LIMIT 1`,
    [publisherName]
  );
  return rows[0] || null;
};

exports.getKPIs = async (publisherName) => {
  const [inv, tx] = await Promise.all([
    db.query(
      `SELECT COUNT(*)::int AS count,
              COALESCE(SUM(invoice_amount),0)::numeric(12,2) AS total
         FROM public.dashboard_invoices
        WHERE publisher_name = $1`,
      [publisherName]
    ),
    db.query(
      `SELECT COUNT(*)::int AS count,
              COALESCE(SUM(amount),0)::numeric(12,2) AS total,
              COALESCE(SUM(CASE WHEN paid_in_full THEN amount ELSE 0 END),0)::numeric(12,2) AS paid,
              COALESCE(SUM(CASE WHEN NOT paid_in_full THEN amount ELSE 0 END),0)::numeric(12,2) AS unpaid
         FROM public.admin_publisher_transactions
        WHERE publisher_name = $1`,
      [publisherName]
    ),
  ]);

  return {
    invoices: {
      count: inv.rows[0]?.count || 0,
      total: Number(inv.rows[0]?.total || 0),
    },
    transactions: {
      count: Number(tx.rows[0]?.count || 0),
      total: Number(tx.rows[0]?.total || 0),
      paid: Number(tx.rows[0]?.paid || 0),
      unpaid: Number(tx.rows[0]?.unpaid || 0),
    },
  };
};

exports.getInvoices = async (publisherName, limit = 10) => {
  const { rows } = await db.query(
    `SELECT id, invoice_month::date AS month, invoice_amount::numeric(12,2) AS amount,
            approval_status, notes, created_at
       FROM public.dashboard_invoices
      WHERE publisher_name = $1
      ORDER BY created_at DESC
      LIMIT $2`,
    [publisherName, limit]
  );
  return rows;
};

exports.getTransactions = async (publisherName, limit = 10) => {
  const { rows } = await db.query(
    `SELECT id, transaction_id, txn_date::date AS date, description,
            amount::numeric(12,2) AS amount, paid_in_full AS "paidFully", created_at
       FROM public.admin_publisher_transactions
      WHERE publisher_name = $1
      ORDER BY txn_date DESC, id DESC
      LIMIT $2`,
    [publisherName, limit]
  );
  return rows;
};

exports.getValidations = async (publisherName, limit = 6) => {
  const { rows } = await db.query(
    `SELECT employee_emailid, actual_payout, deduction, billable_payout,
            gst_amount, billable_payout_nongst, month, year, created_at
       FROM public.dashboard_validation
      WHERE publisher_name = $1
      ORDER BY created_at DESC
      LIMIT $2`,
    [publisherName, limit]
  );
  return rows;
};
