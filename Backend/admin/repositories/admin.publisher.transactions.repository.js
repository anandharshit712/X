const { createPool } = require("../config/database");
const pool = createPool("service_employee_publisher"); // admin publisher DB

exports.list = async ({
  publisher_name,
  from,
  to,
  paid_in_full,
  page = 1,
  limit = 20,
}) => {
  const params = [];
  const where = [];

  if (publisher_name) {
    params.push(`%${publisher_name}%`);
    where.push(`publisher_name ILIKE $${params.length}`);
  }
  if (paid_in_full === "true" || paid_in_full === true) {
    params.push(true);
    where.push(`paid_in_full = $${params.length}`);
  } else if (paid_in_full === "false" || paid_in_full === false) {
    params.push(false);
    where.push(`paid_in_full = $${params.length}`);
  }
  if (from) {
    params.push(new Date(from));
    where.push(`created_at >= $${params.length}`);
  }
  if (to) {
    // inclusive upper-bound
    params.push(new Date(to));
    where.push(`created_at <= $${params.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const safeLimit = Math.max(1, Number(limit) || 20);
  const safePage = Math.max(1, Number(page) || 1);
  const offset = (safePage - 1) * safeLimit;

  // Selecting specific useful columns; change to SELECT * if you prefer schema-flex
  const listSql = `
    SELECT
      employee_emailid,
      publisher_name,
      amount,
      description,
      paid_in_full,
      created_at
    FROM public.dashboard_payout_transactions
    ${whereSql}
    ORDER BY created_at DESC
    LIMIT ${safeLimit} OFFSET ${offset};
  `;

  const countSql = `
    SELECT COUNT(*)::int AS cnt
    FROM public.dashboard_payout_transactions
    ${whereSql};
  `;

  const client = await pool.connect();
  try {
    const [listRes, countRes] = await Promise.all([
      client.query(listSql, params),
      client.query(countSql, params),
    ]);

    return {
      rows: listRes.rows,
      total: countRes.rows[0]?.cnt || 0,
      page: safePage,
      limit: safeLimit,
    };
  } finally {
    client.release();
  }
};
