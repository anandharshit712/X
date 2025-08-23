const svc = require("../services/admin.advertiser.offers.service");

// GET /api/admin/advertiser/offers?status=ACTIVE|PAUSED|pending|approved|rejected|all&q=&page=&limit=
exports.list = async (req, res, next) => {
  try {
    const { status = "all", q = "", page = 1, limit = 20 } = req.query;
    const data = await svc.list({
      status: String(status),
      q: String(q || ""),
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
    res.json({ ok: true, ...data });
  } catch (e) {
    next(e);
  }
};

// POST /api/admin/advertiser/offers
exports.create = async (req, res, next) => {
  try {
    const created = await svc.create(req.body || {});
    res.status(201).json({ ok: true, data: created });
  } catch (e) {
    next(e);
  }
};

// GET /api/admin/advertiser/offers/:offerId
exports.get = async (req, res, next) => {
  try {
    const { offerId } = req.params;
    const data = await svc.get(offerId);
    if (!data)
      return res.status(404).json({ ok: false, message: "Offer not found" });
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};

// PUT /api/admin/advertiser/offers/:offerId
exports.update = async (req, res, next) => {
  try {
    const { offerId } = req.params;
    const data = await svc.update(offerId, req.body || {});
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};

// PATCH /api/admin/advertiser/offers/:offerId/status { status: 'ACTIVE'|'PAUSED' }
exports.setStatus = async (req, res, next) => {
  try {
    const { offerId } = req.params;
    const { status } = req.body || {};
    const data = await svc.setStatus(offerId, status);
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};
