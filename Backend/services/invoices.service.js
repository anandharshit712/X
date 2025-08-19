// services/invoices.service.js
const invoicesRepo = require("../repositories/invoices.repo");
const { computePayout } = require("../utils/comission");

function resolveDateRange(from, to) {
  const end = to ? new Date(to) : new Date();
  const start = from
    ? new Date(from)
    : new Date(end.getTime() - 29 * 24 * 60 * 60 * 1000);
  const startISO = start.toISOString().slice(0, 10);
  const endISO = end.toISOString().slice(0, 10);
  return { startISO, endISO };
}

async function listInvoices({ advertiserId, from, to, appId }) {
  const { startISO, endISO } = resolveDateRange(from, to);

  // Monthly totals from offerwall_payments (by month/app_id), scoped via offerwall_app
  const monthly = await invoicesRepo.fetchMonthlyTotals({
    advertiserId,
    startISO,
    endISO,
    appId,
  });

  // Uploaded PDFs from offerwall_invoice_upload (no month/app_id columns)
  const uploads = await invoicesRepo.fetchUploads({
    advertiserId,
    startISO,
    endISO,
  });

  // Build response rows: monthly totals + computed payout; uploads listed separately
  const items = monthly.map((row) => {
    const payout = computePayout(Number(row.gross_revenue || 0));
    return {
      month: row.month, // 'YYYY-MM'
      app_id: row.app_id, // may be null if not present in payments
      gross_revenue: +payout.grossRevenue,
      commission_ex_gst: +payout.commission_ex_gst,
      gst_on_commission: +payout.gst_on_commission,
      net_payout: +payout.net_payout,
      // no direct file association possible with current schema
      invoice_file: null,
    };
  });

  // Totals
  const totals = items.reduce(
    (acc, r) => {
      acc.gross_revenue += r.gross_revenue;
      acc.commission_ex_gst += r.commission_ex_gst;
      acc.gst_on_commission += r.gst_on_commission;
      acc.net_payout += r.net_payout;
      return acc;
    },
    {
      gross_revenue: 0,
      commission_ex_gst: 0,
      gst_on_commission: 0,
      net_payout: 0,
    }
  );
  for (const k of Object.keys(totals)) totals[k] = +totals[k].toFixed(6);

  return {
    window: { from: startISO, to: endISO },
    filters: { app_id: appId || null },
    totals,
    items,
    uploads: uploads.map((u) => ({
      id: u.id,
      invoice_number: u.invoice_number,
      uploaded_at: u.uploaded_at,
    })),
  };
}

async function saveInvoiceFile({ advertiserId, invoiceNumber, file }) {
  const saved = await invoicesRepo.insertUpload({
    advertiserId,
    invoiceNumber,
    buffer: file.buffer,
  });
  return saved;
}

async function getInvoiceFile({ advertiserId, id }) {
  const file = await invoicesRepo.getUploadById({ advertiserId, id });
  return file || null;
}

module.exports = {
  listInvoices,
  saveInvoiceFile,
  getInvoiceFile,
};
