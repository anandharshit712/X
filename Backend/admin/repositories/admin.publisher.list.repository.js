const { pools } = require("../../config/database");
const db = pools.employeePublisher; // service_employee_publisher

exports.list = async ({ q, page, limit }) => {
  const offset = (page - 1) * limit;
  const params = [];
  let where = "";
  if (q) {
    params.push(`%${q.toLowerCase()}%`);
    where = `WHERE LOWER(publisher_name) LIKE $1`;
  }

  const countSql = `SELECT COUNT(*)::int AS cnt FROM public.publishers ${where}`;
  const listSql = `
    SELECT publisher_name
    FROM public.publishers
    ${where}
    ORDER BY publisher_name ASC
    LIMIT ${limit} OFFSET ${offset}
  `;

  const [c, l] = await Promise.all([
    db.query(countSql, params),
    db.query(listSql, params),
  ]);

  return {
    total: c.rows[0]?.cnt || 0,
    page,
    limit,
    data: l.rows, // [{publisher_name}]
  };
};

exports.attachLightStats = async (rows) => {
  if (!rows.length) return [];
  const names = rows.map((r) => r.publisher_name);
  const [inv, tx] = await Promise.all([
    db.query(
      `SELECT publisher_name,
              COUNT(*)::int AS invoice_count,
              COALESCE(SUM(invoice_amount),0)::numeric(12,2) AS invoice_total
         FROM public.dashboard_invoices
        WHERE publisher_name = ANY($1)
        GROUP BY publisher_name`,
      [names]
    ),
    db.query(
      `SELECT publisher_name,
              COUNT(*)::int AS txn_count,
              COALESCE(SUM(amount),0)::numeric(12,2) AS paid_total
         FROM public.admin_publisher_transactions
        WHERE publisher_name = ANY($1)
        GROUP BY publisher_name`,
      [names]
    ),
  ]);

  const invMap = new Map(inv.rows.map((r) => [r.publisher_name, r]));
  const txMap = new Map(tx.rows.map((r) => [r.publisher_name, r]));

  return rows.map((r) => {
    const i = invMap.get(r.publisher_name) || {};
    const t = txMap.get(r.publisher_name) || {};
    return {
      publisherName: r.publisher_name,
      invoices: {
        count: i.invoice_count || 0,
        total: Number(i.invoice_total || 0),
      },
      transactions: {
        count: t.txn_count || 0,
        paidTotal: Number(t.paid_total || 0),
      },
    };
  });
};
