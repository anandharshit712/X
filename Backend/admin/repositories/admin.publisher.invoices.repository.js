const { createPool } = require("../config/database");
const pool = createPool("service_employee_publisher"); // uses your existing pool helper

exports.list = async ({
  publisher_name,
  month,
  year,
  invoice_status,
  page = 1,
  limit = 20,
}) => {
  const params = [];
  const where = [];

  if (publisher_name) {
    params.push(`%${publisher_name}%`);
    where.push(`publisher_name ILIKE $${params.length}`);
  }
  if (month) {
    params.push(Number(month));
    where.push(`month_invoice = $${params.length}`);
  }
  if (year) {
    params.push(Number(year));
    where.push(`year_invoice = $${params.length}`);
  }
  if (invoice_status) {
    params.push(invoice_status);
    where.push(`invoice_status = $${params.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const safeLimit = Math.max(1, Number(limit) || 20);
  const safePage = Math.max(1, Number(page) || 1);
  const offset = (safePage - 1) * safeLimit;

  const listSql = `
    SELECT
      invoice_number,
      publisher_name,
      month_invoice,
      year_invoice,
      invoice_status,
      amount,
      created_at
    FROM public.dashboard_invoices
    ${whereSql}
    ORDER BY created_at DESC
    LIMIT ${safeLimit} OFFSET ${offset};
  `;

  const countSql = `
    SELECT COUNT(*)::int AS cnt
    FROM public.dashboard_invoices
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
