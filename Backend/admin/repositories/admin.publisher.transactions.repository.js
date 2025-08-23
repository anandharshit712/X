// Uses the same pool style as your user backend config
// config/database.js should expose pools.employeePublisher -> service_employee_publisher
const { pools } = require("../../config/database");

// Shape returned to match the frontend transaction table
const mapRow = (r) => ({
  id: r.id,
  transactionId: r.transaction_id, // e.g. "TXN-000123"
  date: r.txn_date?.toISOString().slice(0, 10),
  description: r.description || "",
  amount: Number(r.amount || 0),
  company: r.publisher_name,
  paidFully: !!r.paid_in_full,
});

// Filters: from/to (date), status=paid|unpaid, q (search), limit/offset
exports.findTransactions = async ({
  publisherName,
  from,
  to,
  status,
  q,
  limit = 25,
  offset = 0,
}) => {
  const client = await pools.employeePublisher.connect();
  try {
    const where = [];
    const vals = [];
    let i = 1;

    if (publisherName) {
      where.push(`publisher_name = $${i++}`);
      vals.push(publisherName);
    }
    if (from) {
      where.push(`txn_date >= $${i++}`);
      vals.push(from);
    }
    if (to) {
      where.push(`txn_date <= $${i++}`);
      vals.push(to);
    }
    if (status === "paid") {
      where.push(`paid_in_full = true`);
    }
    if (status === "unpaid") {
      where.push(`paid_in_full = false`);
    }
    if (q) {
      where.push(`(transaction_id ILIKE $${i} OR description ILIKE $${i})`);
      vals.push(`%${q}%`);
      i++;
    }

    const sql = `
      SELECT id, transaction_id, txn_date, description, amount, publisher_name, paid_in_full
      FROM public.admin_publisher_transactions
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY txn_date DESC, id DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const { rows } = await client.query(sql, vals);
    return rows.map(mapRow);
  } finally {
    client.release();
  }
};

exports.getTotals = async (publisherName) => {
  const client = await pools.employeePublisher.connect();
  try {
    // If you created the view v_admin_txn_totals_by_publisher we can use it,
    // otherwise compute inline.
    if (publisherName) {
      const { rows } = await client.query(
        `SELECT
            COALESCE(SUM(amount),0) AS total_amount,
            COALESCE(SUM(CASE WHEN paid_in_full THEN amount ELSE 0 END),0) AS paid_amount,
            COALESCE(SUM(CASE WHEN NOT paid_in_full THEN amount ELSE 0 END),0) AS unpaid_amount,
            COUNT(*) AS total_rows
         FROM public.admin_publisher_transactions
         WHERE publisher_name = $1`,
        [publisherName]
      );
      return rows[0];
    } else {
      const { rows } = await client.query(
        `SELECT
            COALESCE(SUM(amount),0) AS total_amount,
            COALESCE(SUM(CASE WHEN paid_in_full THEN amount ELSE 0 END),0) AS paid_amount,
            COALESCE(SUM(CASE WHEN NOT paid_in_full THEN amount ELSE 0 END),0) AS unpaid_amount,
            COUNT(*) AS total_rows
         FROM public.admin_publisher_transactions`
      );
      return rows[0];
    }
  } finally {
    client.release();
  }
};

exports.insertTransaction = async ({
  publisherName,
  txnDate,
  description,
  amount,
  paidInFull,
}) => {
  const client = await pools.employeePublisher.connect();
  try {
    const { rows } = await client.query(
      `INSERT INTO public.admin_publisher_transactions
        (txn_date, description, amount, publisher_name, paid_in_full)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, transaction_id, txn_date, description, amount, publisher_name, paid_in_full`,
      [txnDate, description, amount, publisherName, paidInFull]
    );
    return mapRow(rows[0]);
  } finally {
    client.release();
  }
};

exports.updateTransaction = async (id, changes) => {
  const client = await pools.employeePublisher.connect();
  try {
    const sets = [];
    const vals = [];
    let i = 1;

    if (changes.txnDate !== undefined) {
      sets.push(`txn_date = $${i++}`);
      vals.push(changes.txnDate);
    }
    if (changes.description !== undefined) {
      sets.push(`description = $${i++}`);
      vals.push(changes.description);
    }
    if (changes.amount !== undefined) {
      sets.push(`amount = $${i++}`);
      vals.push(changes.amount);
    }
    if (changes.publisherName !== undefined) {
      sets.push(`publisher_name = $${i++}`);
      vals.push(changes.publisherName);
    }
    if (changes.paidInFull !== undefined) {
      sets.push(`paid_in_full = $${i++}`);
      vals.push(!!changes.paidInFull);
    }

    if (!sets.length) {
      const { rows } = await client.query(
        `SELECT id, transaction_id, txn_date, description, amount, publisher_name, paid_in_full
         FROM public.admin_publisher_transactions WHERE id = $1`,
        [id]
      );
      return rows[0] ? mapRow(rows[0]) : null;
    }

    vals.push(id);
    const { rows } = await client.query(
      `UPDATE public.admin_publisher_transactions
         SET ${sets.join(", ")}, updated_at = NOW()
       WHERE id = $${vals.length}
       RETURNING id, transaction_id, txn_date, description, amount, publisher_name, paid_in_full`,
      vals
    );
    return rows[0] ? mapRow(rows[0]) : null;
  } finally {
    client.release();
  }
};

exports.deleteTransaction = async (id) => {
  const client = await pools.employeePublisher.connect();
  try {
    await client.query(
      `DELETE FROM public.admin_publisher_transactions WHERE id = $1`,
      [id]
    );
  } finally {
    client.release();
  }
};
