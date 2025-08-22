const service = require("../services/admin.publisher.transactions.service");

exports.list = async (req, res, next) => {
  try {
    const {
      publisher_name,
      from, // ISO date (inclusive)
      to, // ISO date (inclusive)
      paid_in_full, // 'true' | 'false'
      page = 1,
      limit = 20,
    } = req.query;

    const result = await service.list({
      publisher_name,
      from,
      to,
      paid_in_full,
      page: Number(page),
      limit: Number(limit),
    });

    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};
