// services/admin/publisher.validation.service.js
const repo = require("../repositories/admin.publisher.validation.repository");

exports.list = async (filters) => {
  return repo.list(filters);
};

exports.create = async (payload) => {
  // billable_payout_nongst = billable_payout - gst_amount (if not provided)
  const p = { ...payload };
  if (
    p.billable_payout != null &&
    p.gst_amount != null &&
    p.billable_payout_nongst == null
  ) {
    p.billable_payout_nongst = Number(p.billable_payout) - Number(p.gst_amount);
  }
  return repo.create(p);
};

exports.update = async (employeeEmailId, patch) => {
  return repo.update(employeeEmailId, patch);
};

exports.remove = async (employeeEmailId) => {
  return repo.remove(employeeEmailId);
};
