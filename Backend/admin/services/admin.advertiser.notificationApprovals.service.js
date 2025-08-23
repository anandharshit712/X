const repo = require("../repositories/admin.advertiser.notificationApprovals.repository");

exports.list = ({ status, q, page, limit }) =>
  repo.list({ status, q, page, limit });

exports.get = (id) => repo.get(id);

exports.setStatus = async (id, status, note) => {
  const S = String(status || "").toLowerCase();
  if (!["pending", "approved", "rejected"].includes(S)) {
    const err = new Error("status must be one of pending|approved|rejected");
    err.status = 400;
    throw err;
  }
  return repo.setStatus(id, S, note);
};
