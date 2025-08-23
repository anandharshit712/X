const { pools } = require("../../config/database");
const db = pools.employeePublisher;

// list by status + search
exports.list = async ({ status, q, page, size }) => {
  const offset = (page - 1) * size;
  const params = [];
  const where = [];

  if (status) {
    params.push(status);
    where.push(`COALESCE(approval_status, 'pending') = $${params.length}`);
  }
  if (q) {
    params.push(`%${q.toLowerCase()}%`);
    where.push(`LOWER(employee_emailid) LIKE $${params.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const totalSql = `SELECT COUNT(*)::int AS c FROM public.dashboard_pub_approval ${whereSql}`;
  const listSql = `
    SELECT employee_emailid, publisher_name, approval_status, approved_at
    FROM public.dashboard_pub_approval
    ${whereSql}
    ORDER BY approved_at DESC NULLS LAST, employee_emailid ASC
    LIMIT ${size} OFFSET ${offset}
  `;

  const [t, l] = await Promise.all([
    db.query(totalSql, params),
    db.query(listSql, params),
  ]);
  return { total: t.rows[0]?.c || 0, page, size, data: l.rows };
};

// approve/reject overall
exports.setStatus = async ({ employee_emailid, publisher_name, status }) => {
  if (!employee_emailid && !publisher_name) {
    throw new Error("Provide employee_emailid or publisher_name");
  }
  // Try update by employee first; if none affected and publisher provided, update by publisher name.
  const updByEmail = employee_emailid
    ? await db.query(
        `UPDATE public.dashboard_pub_approval
            SET approval_status = $2, approved_at = CASE WHEN $2='approved' THEN NOW() ELSE NULL END
          WHERE employee_emailid = $1
        RETURNING employee_emailid, publisher_name, approval_status, approved_at`,
        [employee_emailid, status]
      )
    : { rowCount: 0, rows: [] };

  if (updByEmail.rowCount > 0) return updByEmail.rows[0];

  if (publisher_name) {
    const updByPub = await db.query(
      `UPDATE public.dashboard_pub_approval
          SET approval_status = $2, approved_at = CASE WHEN $2='approved' THEN NOW() ELSE NULL END
        WHERE publisher_name = $1
      RETURNING employee_emailid, publisher_name, approval_status, approved_at`,
      [publisher_name, status]
    );
    if (updByPub.rowCount > 0) return updByPub.rows[0];

    // If no row exists, insert a new approval row
    const ins = await db.query(
      `INSERT INTO public.dashboard_pub_approval (employee_emailid, publisher_name, approval_status, approved_at)
       VALUES ($1, $2, $3, CASE WHEN $3='approved' THEN NOW() ELSE NULL END)
       RETURNING employee_emailid, publisher_name, approval_status, approved_at`,
      [employee_emailid || `${publisher_name}@unknown`, publisher_name, status]
    );
    return ins.rows[0];
  }

  // If only employee_emailid provided and no row existed, insert
  const insByEmail = await db.query(
    `INSERT INTO public.dashboard_pub_approval (employee_emailid, approval_status, approved_at)
     VALUES ($1, $2, CASE WHEN $2='approved' THEN NOW() ELSE NULL END)
     ON CONFLICT (employee_emailid) DO UPDATE
       SET approval_status = EXCLUDED.approval_status,
           approved_at     = CASE WHEN EXCLUDED.approval_status='approved' THEN NOW() ELSE NULL END
     RETURNING employee_emailid, publisher_name, approval_status, approved_at`,
    [employee_emailid, status]
  );
  return insByEmail.rows[0];
};

// per‑section status (requires columns; if missing, returns a clear message)
exports.setSectionStatus = async ({ publisher_name, section, status }) => {
  if (!publisher_name || !section || !status)
    throw new Error("publisher_name, section, status required");

  const col =
    section === "bank"
      ? "bank_details_status"
      : section === "company"
      ? "company_details_status"
      : section === "billing"
      ? "billing_address_status"
      : null;

  if (!col) throw new Error("section must be one of bank|company|billing");

  // Check column existence; if missing, respond with guidance (no hard error)
  const check = await db.query(
    `SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='dashboard_pub_approval' AND column_name=$1`,
    [col]
  );
  if (check.rowCount === 0) {
    return {
      message: `Column ${col} not found on dashboard_pub_approval. Add the column to enable per-section approvals.`,
    };
  }

  const upd = await db.query(
    `UPDATE public.dashboard_pub_approval
        SET ${col} = $2
      WHERE publisher_name = $1
    RETURNING employee_emailid, publisher_name, approval_status, ${col} AS section_status`,
    [publisher_name, status]
  );
  if (upd.rowCount > 0) return upd.rows[0];

  const ins = await db.query(
    `INSERT INTO public.dashboard_pub_approval (employee_emailid, publisher_name, approval_status, ${col})
     VALUES ($1, $2, 'pending', $3)
     RETURNING employee_emailid, publisher_name, approval_status, ${col} AS section_status`,
    [`${publisher_name}@unknown`, publisher_name, status]
  );
  return ins.rows[0];
};
