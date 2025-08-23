const svc = require("../services/admin.advertiser.overview.service");

exports.getSummary = async (req, res, next) => {
  try {
    const { start, end } = req.query;
    const data = await svc.getSummary({ start, end });
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};

exports.getTopOffers = async (req, res, next) => {
  try {
    const { metric = "margins", start, end, limit = 10 } = req.query;
    const data = await svc.getTopOffers({
      metric,
      start,
      end,
      limit: Number(limit),
    });
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};
