// repositories/admin/publisher.validation.repo.js
const { pools } = require("../../config/database");

// Reuse the same pooling method as user-side.
// This tries the obvious keys; adjust the key name in your config once and everything works.
const pool =
  (pools &&
    (pools.employeePublisher ||
      pools.service_employee_publisher ||
      pools.publisher)) ||
  pools.dashboard; // safe fallback

const cols = [
  "employee_emailid",
  "publisher_name",
  "actual_payout",
  "deduction",
  "billable_payout",
  "gst_amount",
  "billable_payout_nongst",
  "created_at",
  "month",
  "year",
];

exports.list = async ({ publisher, month, year, limit = 100, offset = 0 }) => {
  const where = [];
  const params = [];
  if (publisher) {
    params.push(publisher);
    where.push(`publisher_name ILIKE '%' || $${params.length} || '%'`);
  }
  if (month) {
    params.push(month);
    where.push(`month = $${params.length}`);
  }
  if (year) {
    params.push(year);
    where.push(`year  = $${params.length}`);
  }

  const sql = `
    SELECT ${cols.join(", ")}
    FROM public.dashboard_validation
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY created_at DESC
    LIMIT $${params.push(limit)} OFFSET $${params.push(offset)}
  `;
  const { rows } = await pool.query(sql, params);
  return rows;
};

exports.create = async (p) => {
  const sql = `
    INSERT INTO public.dashboard_validation
      (employee_emailid, publisher_name, actual_payout, deduction, billable_payout,
       gst_amount, billable_payout_nongst, created_at, month, year)
    VALUES ($1,$2,$3,$4,$5,$6,$7, NOW(), $8, $9)
    RETURNING ${cols.join(", ")}
  `;
  const vals = [
    p.employee_emailid,
    p.publisher_name,
    p.actual_payout,
    p.deduction,
    p.billable_payout,
    p.gst_amount,
    p.billable_payout_nongst,
    p.month,
    p.year,
  ];
  const { rows } = await pool.query(sql, vals);
  return rows[0];
};

exports.update = async (employeeEmailId, patch) => {
  const set = [];
  const vals = [];
  const updatable = [
    "publisher_name",
    "actual_payout",
    "deduction",
    "billable_payout",
    "gst_amount",
    "billable_payout_nongst",
    "month",
    "year",
  ];
  updatable.forEach((k) => {
    if (patch[k] !== undefined) {
      vals.push(patch[k]);
      set.push(`${k} = $${vals.length}`);
    }
  });
  if (!set.length) return this.get(employeeEmailId);

  vals.push(employeeEmailId);
  const sql = `
    UPDATE public.dashboard_validation SET ${set.join(", ")}
    WHERE employee_emailid = $${vals.length}
    RETURNING ${cols.join(", ")}
  `;
  const { rows } = await pool.query(sql, vals);
  return rows[0];
};

exports.remove = async (employeeEmailId) => {
  await pool.query(
    `DELETE FROM public.dashboard_validation WHERE employee_emailid = $1`,
    [employeeEmailId]
  );
};

exports.get = async (employeeEmailId) => {
  const { rows } = await pool.query(
    `SELECT ${cols.join(
      ", "
    )} FROM public.dashboard_validation WHERE employee_emailid = $1 LIMIT 1`,
    [employeeEmailId]
  );
  return rows[0] || null;
};
