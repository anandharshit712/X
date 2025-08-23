// repositories/invoices.repo.js
const { pools } = require("../../config/database");

/**
 * Monthly totals from offerwall_payments joined via offerwall_app for advertiser scope.
 * Returns rows by month and app_id (if present).
 */
async function fetchMonthlyTotals({ advertiserId, startISO, endISO, appId }) {
  const params = [advertiserId, startISO, endISO];
  let appFilter = "";
  if (appId) {
    params.push(appId);
    appFilter = `AND p.app_id = $${params.length}`;
  }

  const sql = `
    SELECT
      to_char(p.date::date, 'YYYY-MM') AS month,
      p.app_id,
      COALESCE(SUM(p.revenue), 0)      AS gross_revenue
    FROM public.offerwall_payments p
    JOIN public.offerwall_app a
      ON a.app_id = p.app_id
     AND a.advertiser_id = $1
    WHERE p.date BETWEEN $2 AND $3
      ${appFilter}
    GROUP BY to_char(p.date::date, 'YYYY-MM'), p.app_id
    ORDER BY month DESC, p.app_id ASC;
  `;
  const { rows } = await pools.offerwall.query(sql, params);
  return rows;
}

/**
 * Fetch uploaded invoices for this advertiser within a date window (by uploaded_at).
 * NOTE: Table has no app_id or month; we return uploads as-is.
 */
async function fetchUploads({
  advertiserId,
  startISO,
  endISO /*, appId (ignored) */,
}) {
  const sql = `
    SELECT
      id,
      invoice_number,
      uploaded_at
    FROM public.offerwall_invoice_upload
    WHERE advertiser_id = $1
      AND uploaded_at::date BETWEEN $2 AND $3
    ORDER BY uploaded_at DESC;
  `;
  const { rows } = await pools.offerwall.query(sql, [
    advertiserId,
    startISO,
    endISO,
  ]);
  return rows;
}

/** Insert a PDF upload (only invoice_number + pdf are stored per schema) */
async function insertUpload({
  advertiserId,
  month /* unused */,
  appId /* unused */,
  filename /* unused */,
  contentType /* unused */,
  fileSize /* unused */,
  buffer,
}) {
  // We repurpose filename (if provided) as invoice_number; otherwise caller must send invoice_number explicitly
  const invoiceNumber = filename || "invoice_" + Date.now();

  const sql = `
    INSERT INTO public.offerwall_invoice_upload (advertiser_id, invoice_number, pdf)
    VALUES ($1, $2, $3)
    RETURNING id, invoice_number, uploaded_at;
  `;
  const params = [advertiserId, invoiceNumber, buffer];
  const { rows } = await pools.offerwall.query(sql, params);
  return rows[0];
}

/** Get a PDF by id (scoped to advertiser) */
async function getUploadById({ advertiserId, id }) {
  const sql = `
    SELECT id, advertiser_id, invoice_number, pdf, uploaded_at
    FROM public.offerwall_invoice_upload
    WHERE id = $1 AND advertiser_id = $2
    LIMIT 1;
  `;
  const { rows } = await pools.offerwall.query(sql, [id, advertiserId]);
  return rows[0];
}

module.exports = {
  fetchMonthlyTotals,
  fetchUploads,
  insertUpload,
  getUploadById,
};
