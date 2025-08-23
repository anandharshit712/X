const svc = require("../services/admin.publisher.list.service");

exports.list = async (req, res, next) => {
  try {
    const { q = "", page = 1, limit = 20 } = req.query;
    const result = await svc.list({
      q: String(q || ""),
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
    res.json({ ok: true, ...result });
  } catch (err) {
    next(err);
  }
};
