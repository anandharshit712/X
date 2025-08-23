const svc = require("../services/admin.advertiser.advertisers.service");

exports.list = async (req, res, next) => {
  try {
    const { q = "", page = 1, limit = 20 } = req.query;
    const data = await svc.list({
      q: String(q || ""),
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
    res.json({ ok: true, ...data });
  } catch (e) {
    next(e);
  }
};

exports.detail = async (req, res, next) => {
  try {
    const { advertiserName } = req.params;
    const data = await svc.detail({ advertiserName });
    if (!data)
      return res
        .status(404)
        .json({ ok: false, message: "Advertiser not found" });
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};
