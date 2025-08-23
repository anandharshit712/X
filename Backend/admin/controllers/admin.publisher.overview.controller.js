const service = require("../services/admin.publisher.overview.service");

exports.getSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await service.getSummary({ startDate, endDate });
    res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getTopOffers = async (req, res, next) => {
  try {
    const { metric = "margins", startDate, endDate, limit = 10 } = req.query;
    const data = await service.getTopOffers({
      metric,
      startDate,
      endDate,
      limit: Number(limit),
    });
    res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
};
