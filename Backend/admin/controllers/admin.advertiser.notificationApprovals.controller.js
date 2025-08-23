const svc = require("../services/admin.advertiser.notificationApprovals.service");

// LIST
exports.list = async (req, res, next) => {
  try {
    const { status = "pending", q = "", page = 1, limit = 20 } = req.query;
    const data = await svc.list({
      status: String(status || "pending"),
      q: String(q || ""),
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
    res.json({ ok: true, ...data });
  } catch (e) {
    next(e);
  }
};

// GET one
exports.get = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await svc.get(id);
    if (!data)
      return res
        .status(404)
        .json({ ok: false, message: "Notification approval not found" });
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};

// PATCH status
exports.setStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body || {};
    const data = await svc.setStatus(id, status, note);
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};
