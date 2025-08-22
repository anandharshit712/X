// controllers/invoices.controller.js
const invoicesService = require("../services/invoices.service");

async function listInvoices(req, res) {
  const advertiserId = req.user?.advertiser_id;
  if (!advertiserId) {
    return res
      .status(401)
      .json({
        ok: false,
        error: { code: "UNAUTHORIZED", message: "Missing advertiser context" },
      });
  }
  const { from, to, app_id } = req.query;

  const data = await invoicesService.listInvoices({
    advertiserId,
    from: from || null,
    to: to || null,
    appId: app_id || null, // used only to filter monthly totals (from offerwall_payments)
  });

  return res.json({ ok: true, data });
}

async function uploadInvoice(req, res) {
  const advertiserId = req.user?.advertiser_id;
  if (!advertiserId) {
    return res
      .status(401)
      .json({
        ok: false,
        error: { code: "UNAUTHORIZED", message: "Missing advertiser context" },
      });
  }
  if (!req.file) {
    return res
      .status(400)
      .json({
        ok: false,
        error: { code: "VALIDATION_ERROR", message: "PDF file is required" },
      });
  }

  // Your table stores invoice_number + pdf only.
  // Accept invoice_number from body (optional). If missing, derive from filename.
  const provided = (req.body?.invoice_number || "").trim();
  const invoice_number =
    provided ||
    req.file.originalname?.replace(/\.pdf$/i, "") ||
    `invoice_${Date.now()}`;

  const saved = await invoicesService.saveInvoiceFile({
    advertiserId,
    invoiceNumber: invoice_number,
    file: {
      buffer: req.file.buffer,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    },
  });

  return res.status(201).json({ ok: true, file: saved });
}

async function downloadInvoice(req, res) {
  const advertiserId = req.user?.advertiser_id;
  if (!advertiserId) {
    return res
      .status(401)
      .json({
        ok: false,
        error: { code: "UNAUTHORIZED", message: "Missing advertiser context" },
      });
  }
  const { id } = req.params;

  const file = await invoicesService.getInvoiceFile({ advertiserId, id });
  if (!file) {
    return res
      .status(404)
      .json({
        ok: false,
        error: { code: "NOT_FOUND", message: "Invoice not found" },
      });
  }

  // Table has 'pdf' BYTEA and 'invoice_number'
  const buf = file.pdf;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Length", Buffer.isBuffer(buf) ? buf.length : 0);
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${file.invoice_number || `invoice_${file.id}`}.pdf"`
  );

  return res.send(buf);
}

module.exports = { listInvoices, uploadInvoice, downloadInvoice };
