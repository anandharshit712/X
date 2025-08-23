// services/admin/publisher.invoices.service.js
const repo = require("../repositories/admin.publisher.invoices.repository");

exports.list = (filters) => repo.list(filters);

exports.create = async (payload) => {
  return repo.create(payload);
};

exports.update = async (invoiceNumber, patch) => {
  // Only allow status / notes / payout_amount updates from UI
  const allowed = ["invoice_status", "notes", "payout_amount"];
  const sanitized = Object.fromEntries(
    Object.entries(patch).filter(([k]) => allowed.includes(k))
  );
  return repo.update(invoiceNumber, sanitized);
};

exports.get = (invoiceNumber) => repo.get(invoiceNumber);
