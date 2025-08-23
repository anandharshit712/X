const { pools } = require("../../config/database");
const db = pools.employeeAdvertisers; // service_employee_advertisers

const mapRow = (r) => ({
  approvalId: r.approval_id ?? null,
  notificationId: String(r.notification_id),
  status: r.status || "pending",
  note: r.note || null,
  employeeEmail: r.employee_emailid || null,
  approvedAt: r.approved_at || null,
  createdAt: r.created_at || null,
  updatedAt: r.updated_at || null,
  // If you have a notifications table and join fields (title/type), add them here:
  notificationTitle: r.notification_title || null,
  notificationType: r.notification_type || null,
});

// LIST with filters
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
    // Search against note and (if joined) notification title/type
    where.push(
      `(LOWER(a.note) LIKE $${params.length} OR LOWER(n.notification_title) LIKE $${params.length} OR LOWER(n.notification_type) LIKE $${params.length})`
    );
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const countSql = `
    SELECT COUNT(*)::int AS cnt
    FROM public.dashboard_notification_approval a
    LEFT JOIN public.dashboard_notifications n ON n.notification_id = a.notification_id
    ${whereSql}
  `;
  const listSql = `
    SELECT
      a.approval_id, a.notification_id, a.status, a.note, a.employee_emailid,
      a.approved_at, a.created_at, a.updated_at,
      n.notification_title, n.notification_type
    FROM public.dashboard_notification_approval a
    LEFT JOIN public.dashboard_notifications n ON n.notification_id = a.notification_id
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

// GET one (approval_id or fallback to notification_id)
exports.get = async (id) => {
  // Try numeric approval_id first
  if (/^\d+$/.test(String(id))) {
    const { rows } = await db.query(
      `SELECT a.*, n.notification_title, n.notification_type
         FROM public.dashboard_notification_approval a
    LEFT JOIN public.dashboard_notifications n ON n.notification_id = a.notification_id
        WHERE a.approval_id = $1 LIMIT 1`,
      [Number(id)]
    );
    if (rows[0]) return mapRow(rows[0]);
  }

  // Fallback by notification_id
  const { rows } = await db.query(
    `SELECT a.*, n.notification_title, n.notification_type
       FROM public.dashboard_notification_approval a
  LEFT JOIN public.dashboard_notifications n ON n.notification_id = a.notification_id
      WHERE a.notification_id = $1
      ORDER BY a.updated_at DESC NULLS LAST, a.created_at DESC
      LIMIT 1`,
    [id]
  );
  return rows[0] ? mapRow(rows[0]) : null;
};

// Approve/Reject/Pending with optional note
exports.setStatus = async (id, status, note) => {
  let target;

  // First try by approval_id (numeric)
  if (/^\d+$/.test(String(id))) {
    const { rows } = await db.query(
      `UPDATE public.dashboard_notification_approval
          SET status = $2,
              note = COALESCE($3, note),
              approved_at = CASE WHEN $2 = 'approved' THEN NOW() ELSE NULL END,
              updated_at = NOW()
        WHERE approval_id = $1
      RETURNING approval_id, notification_id, status, note, employee_emailid, approved_at, created_at, updated_at`,
      [Number(id), status, note ?? null]
    );
    if (rows[0]) {
      target = rows[0];
    }
  }

  if (!target) {
    // Fallback by notification_id; upsert if missing
    const upd = await db.query(
      `UPDATE public.dashboard_notification_approval
          SET status = $2,
              note = COALESCE($3, note),
              approved_at = CASE WHEN $2 = 'approved' THEN NOW() ELSE NULL END,
              updated_at = NOW()
        WHERE notification_id = $1
      RETURNING approval_id, notification_id, status, note, employee_emailid, approved_at, created_at, updated_at`,
      [id, status, note ?? null]
    );
    if (upd.rowCount) {
      target = upd.rows[0];
    } else {
      const ins = await db.query(
        `INSERT INTO public.dashboard_notification_approval
           (notification_id, status, note, approved_at, created_at, updated_at)
         VALUES ($1, $2, $3, CASE WHEN $2='approved' THEN NOW() ELSE NULL END, NOW(), NOW())
         RETURNING approval_id, notification_id, status, note, employee_emailid, approved_at, created_at, updated_at`,
        [id, status, note ?? null]
      );
      target = ins.rows[0];
    }
  }

  // Enrich with notification metadata if available
  const {
    rows: [n],
  } = await db.query(
    `SELECT notification_title, notification_type
       FROM public.dashboard_notifications WHERE notification_id = $1`,
    [target.notification_id]
  );
  return mapRow({ ...target, ...n });
};
