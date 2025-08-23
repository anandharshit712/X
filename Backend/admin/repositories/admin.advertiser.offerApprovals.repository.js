const { pools } = require("../../config/database");
const db = pools.employeeAdvertisers; // service_employee_advertisers

const mapRow = (r) => ({
  approvalId: r.approval_id ?? null,
  offerId: String(r.offer_id),
  status: r.status || "pending",
  note: r.note || null,
  employeeEmail: r.employee_emailid || null,
  approvedAt: r.approved_at || null,
  createdAt: r.created_at || null,
  updatedAt: r.updated_at || null,
  // helpful denorm fields if present from join:
  offerName: r.offer_name || null,
  advertiserName: r.advertiser_name || null,
});

exports.list = async ({ status = "pending", q = "", page = 1, limit = 20 }) => {
  const offset = (page - 1) * limit;
  const params = [];
  const where = [];

  if (status && status !== "all") {
    params.push(status.toLowerCase());
    where.push(`COALESCE(a.status, 'pending') = $${params.length}`);
  }
  if (q) {
    params.push(`%${q.toLowerCase()}%`);
    where.push(
      `(LOWER(o.offer_name) LIKE $${params.length} OR LOWER(o.advertiser_name) LIKE $${params.length})`
    );
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const countSql = `
    SELECT COUNT(*)::int AS cnt
    FROM public.dashboard_offer_approval a
    LEFT JOIN public.dashboard_offers o ON o.offer_id = a.offer_id
    ${whereSql}
  `;
  const listSql = `
    SELECT
      a.approval_id, a.offer_id, a.status, a.note, a.employee_emailid, a.approved_at, a.created_at, a.updated_at,
      o.offer_name, o.advertiser_name
    FROM public.dashboard_offer_approval a
    LEFT JOIN public.dashboard_offers o ON o.offer_id = a.offer_id
    ${whereSql}
    ORDER BY a.updated_at DESC NULLS LAST, a.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  const [c, l] = await Promise.all([
    db.query(countSql, params),
    db.query(listSql, params),
  ]);
  return { total: c.rows[0]?.cnt || 0, page, limit, data: l.rows.map(mapRow) };
};

// Get by approvalId; if not found and id looks like an offer id, try by offer_id
exports.get = async (id) => {
  // Try approval_id numeric
  if (/^\d+$/.test(String(id))) {
    const { rows } = await db.query(
      `SELECT a.*, o.offer_name, o.advertiser_name
         FROM public.dashboard_offer_approval a
    LEFT JOIN public.dashboard_offers o ON o.offer_id = a.offer_id
        WHERE a.approval_id = $1 LIMIT 1`,
      [Number(id)]
    );
    if (rows[0]) return mapRow(rows[0]);
  }
  // Fallback: treat as offer_id
  const { rows } = await db.query(
    `SELECT a.*, o.offer_name, o.advertiser_name
       FROM public.dashboard_offer_approval a
  LEFT JOIN public.dashboard_offers o ON o.offer_id = a.offer_id
      WHERE a.offer_id = $1
      ORDER BY a.updated_at DESC NULLS LAST, a.created_at DESC
      LIMIT 1`,
    [id]
  );
  return rows[0] ? mapRow(rows[0]) : null;
};

// Approve/Reject/Pending with optional note. Accepts approval_id or offer_id in :id
exports.setStatus = async (id, status, note) => {
  let target;
  // First try by approval_id (numeric)
  if (/^\d+$/.test(String(id))) {
    const { rows } = await db.query(
      `UPDATE public.dashboard_offer_approval
          SET status = $2,
              note = COALESCE($3, note),
              approved_at = CASE WHEN $2 = 'approved' THEN NOW() ELSE NULL END,
              updated_at = NOW()
        WHERE approval_id = $1
      RETURNING approval_id, offer_id, status, note, employee_emailid, approved_at, created_at, updated_at`,
      [Number(id), status, note ?? null]
    );
    if (rows[0]) {
      target = rows[0];
    }
  }

  if (!target) {
    // fallback by offer_id; upsert if missing
    const upd = await db.query(
      `UPDATE public.dashboard_offer_approval
          SET status = $2,
              note = COALESCE($3, note),
              approved_at = CASE WHEN $2 = 'approved' THEN NOW() ELSE NULL END,
              updated_at = NOW()
        WHERE offer_id = $1
      RETURNING approval_id, offer_id, status, note, employee_emailid, approved_at, created_at, updated_at`,
      [id, status, note ?? null]
    );
    if (upd.rowCount) {
      target = upd.rows[0];
    } else {
      const ins = await db.query(
        `INSERT INTO public.dashboard_offer_approval (offer_id, status, note, approved_at, created_at, updated_at)
         VALUES ($1, $2, $3, CASE WHEN $2='approved' THEN NOW() ELSE NULL END, NOW(), NOW())
         RETURNING approval_id, offer_id, status, note, employee_emailid, approved_at, created_at, updated_at`,
        [id, status, note ?? null]
      );
      target = ins.rows[0];
    }
  }

  // enrich with offer fields for convenience
  const {
    rows: [offer],
  } = await db.query(
    `SELECT offer_name, advertiser_name FROM public.dashboard_offers WHERE offer_id = $1`,
    [target.offer_id]
  );
  return mapRow({ ...target, ...offer });
};
