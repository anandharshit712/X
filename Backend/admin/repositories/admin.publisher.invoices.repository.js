// repositories/admin/publisher.invoices.repo.js
const { pools } = require("../../config/database");

const pool =
  (pools &&
    (pools.employeePublisher ||
      pools.service_employee_publisher ||
      pools.publisher)) ||
  pools.dashboard;

const cols = [
  "employee_emailid",
  "publisher_name",
  "invoice_number",
  "payout_amount",
  "invoice_status",
  "notes",
  "submitted_at",
  "updated_at",
  "month_invoice",
  "year_invoice",
];

exports.list = async ({
  status,
  publisher,
  month,
  year,
  search,
  limit = 100,
  offset = 0,
  sort = "submitted_at",
  order = "desc",
}) => {
  const where = [];
  const params = [];

  if (status) {
    params.push(status);
    where.push(`invoice_status = $${params.length}`);
  }
  if (publisher) {
    params.push(publisher);
    where.push(`publisher_name ILIKE '%' || $${params.length} || '%'`);
  }
  if (month) {
    params.push(month);
    where.push(`month_invoice = $${params.length}`);
  }
  if (year) {
    params.push(year);
    where.push(`year_invoice  = $${params.length}`);
  }
  if (search) {
    params.push(search);
    where.push(
      `(invoice_number ILIKE '%' || $${params.length} || '%' OR notes ILIKE '%' || $${params.length} || '%')`
    );
  }

  // Whitelist sort columns
  const sortCol = [
    "submitted_at",
    "updated_at",
    "payout_amount",
    "invoice_number",
  ].includes(sort)
    ? sort
    : "submitted_at";
  const sortOrder = order === "asc" ? "ASC" : "DESC";

  const sql = `
    SELECT ${cols.join(", ")}
    FROM public.dashboard_invoices
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY ${sortCol} ${sortOrder}
    LIMIT $${params.push(limit)} OFFSET $${params.push(offset)}
  `;
  const { rows } = await pool.query(sql, params);
  return rows;
};

exports.create = async (p) => {
  const sql = `
    INSERT INTO public.dashboard_invoices
      (employee_emailid, publisher_name, invoice_number, payout_amount, invoice_status,
       notes, submitted_at, updated_at, month_invoice, year_invoice)
    VALUES ($1,$2,$3,$4,COALESCE($5,'pending'),$6, NOW(), NOW(), $7, $8)
    RETURNING ${cols.join(", ")}
  `;
  const vals = [
    p.employee_emailid,
    p.publisher_name,
    p.invoice_number,
    p.payout_amount,
    p.invoice_status,
    p.notes,
    p.month_invoice,
    p.year_invoice,
  ];
  const { rows } = await pool.query(sql, vals);
  return rows[0];
};

exports.update = async (invoiceNumber, patch) => {
  const set = [];
  const vals = [];
  ["invoice_status", "notes", "payout_amount"].forEach((k) => {
    if (patch[k] !== undefined) {
      vals.push(patch[k]);
      set.push(`${k} = $${vals.length}`);
    }
  });
  if (!set.length) return this.get(invoiceNumber);

  // Always bump updated_at
  set.push(`updated_at = NOW()`);

  vals.push(invoiceNumber);
  const sql = `
    UPDATE public.dashboard_invoices
    SET ${set.join(", ")}
    WHERE invoice_number = $${vals.length}
    RETURNING ${cols.join(", ")}
  `;
  const { rows } = await pool.query(sql, vals);
  return rows[0];
};

exports.get = async (invoiceNumber) => {
  const { rows } = await pool.query(
    `SELECT ${cols.join(
      ", "
    )} FROM public.dashboard_invoices WHERE invoice_number = $1 LIMIT 1`,
    [invoiceNumber]
  );
  return rows[0] || null;
};
