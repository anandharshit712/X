const repo = require("../repositories/admin.advertiser.offers.repository");

exports.list = ({ status, q, page, limit }) =>
  repo.list({ status, q, page, limit });

exports.create = async (payload) => {
  // minimal required fields from offers_A.tsx typical form
  if (!payload.offer_name) {
    const err = new Error("offer_name is required");
    err.status = 400;
    throw err;
  }
  // default status ACTIVE unless UI sets otherwise
  if (!payload.status) payload.status = "ACTIVE";
  return repo.create(payload);
};

exports.get = (offerId) => repo.get(offerId);

exports.update = (offerId, patch) => repo.update(offerId, patch);

exports.setStatus = (offerId, status) => {
  const S = String(status || "").toUpperCase();
  if (!["ACTIVE", "PAUSED"].includes(S)) {
    const err = new Error("status must be ACTIVE or PAUSED");
    err.status = 400;
    throw err;
  }
  return repo.setStatus(offerId, S);
};
