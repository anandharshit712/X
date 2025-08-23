const svc = require("../services/admin.advertiser.offerRewards.service");

// GET /offers/:offerId/rewards
exports.list = async (req, res, next) => {
  try {
    const { offerId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const data = await svc.list({
      offerId,
      page: Number(page),
      limit: Number(limit),
    });
    res.json({ ok: true, ...data });
  } catch (e) {
    next(e);
  }
};

// POST /offers/:offerId/rewards
exports.create = async (req, res, next) => {
  try {
    const { offerId } = req.params;
    const payload = { ...req.body, offer_id: offerId };
    const created = await svc.create(payload);
    res.status(201).json({ ok: true, data: created });
  } catch (e) {
    next(e);
  }
};

// PUT /rewards/:rewardId
exports.update = async (req, res, next) => {
  try {
    const { rewardId } = req.params;
    const updated = await svc.update(rewardId, req.body || {});
    if (!updated)
      return res.status(404).json({ ok: false, message: "Reward not found" });
    res.json({ ok: true, data: updated });
  } catch (e) {
    next(e);
  }
};

// DELETE /rewards/:rewardId
exports.remove = async (req, res, next) => {
  try {
    const { rewardId } = req.params;
    await svc.remove(rewardId);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
};
