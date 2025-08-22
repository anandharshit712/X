const service = require("../services/admin.publisher.validation.service");

exports.list = async (req, res, next) => {
  try {
    const { publisher_name, month, year, page = 1, limit = 20 } = req.query;

    const result = await service.list({
      publisher_name,
      month,
      year,
      page: Number(page),
      limit: Number(limit),
    });

    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};
