const repo = require("../repositories/admin.advertiser.offerRewards.repository");

exports.list = ({ offerId, page, limit }) =>
  repo.list({ offerId, page, limit });

exports.create = async (payload) => {
  // minimal required field is your_revenue (numeric) for now
  if (!payload || !payload.offer_id) {
    const err = new Error("offer_id is required");
    err.status = 400;
    throw err;
  }
  if (payload.your_revenue == null) {
    const err = new Error("your_revenue is required");
    err.status = 400;
    throw err;
  }
  return repo.create(payload);
};

exports.update = (rewardId, patch) => repo.update(rewardId, patch);

exports.remove = (rewardId) => repo.remove(rewardId);
