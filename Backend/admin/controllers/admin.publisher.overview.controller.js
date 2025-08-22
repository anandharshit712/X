const service = require("../services/admin.publisher.overview.service");

exports.getOverview = async (req, res, next) => {
  try {
    const data = await service.getOverview();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
