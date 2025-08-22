const { createPool } = require("../config/database");
const pool = createPool("service_employee_publisher"); // admin publisher DB

exports.list = async ({
  publisher_name,
  month,
  year,
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
    where.push(`month = $${params.length}`);
  }
  if (year) {
    params.push(Number(year));
    where.push(`year = $${params.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const safeLimit = Math.max(1, Number(limit) || 20);
  const safePage = Math.max(1, Number(page) || 1);
  const offset = (safePage - 1) * safeLimit;

  // Selecting * keeps us schema-safe; sort by created_at if available, else fallback to 1
  const listSql = `
    SELECT *
    FROM public.dashboard_validation
    ${whereSql}
    ORDER BY COALESCE(created_at, NOW()) DESC
    LIMIT ${safeLimit} OFFSET ${offset};
  `;
  const countSql = `
    SELECT COUNT(*)::int AS cnt
    FROM public.dashboard_validation
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
