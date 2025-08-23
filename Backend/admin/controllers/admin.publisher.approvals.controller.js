const svc = require("../services/admin.publisher.approvals.service");

exports.list = async (req, res, next) => {
  try {
    const { status = "pending", q = "", page = 1, size = 20 } = req.query;
    const data = await svc.list({
      status,
      q,
      page: Number(page),
      size: Number(size),
    });
    res.json({ ok: true, ...data });
  } catch (e) {
    next(e);
  }
};

exports.setStatus = async (req, res, next) => {
  try {
    const { employee_emailid, publisher_name, status } = req.body || {};
    if (!["pending", "approved", "rejected"].includes(String(status))) {
      return res.status(400).json({ ok: false, message: "Invalid status" });
    }
    const data = await svc.setStatus({
      employee_emailid,
      publisher_name,
      status,
    });
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};

exports.setSectionStatus = async (req, res, next) => {
  try {
    const { publisher_name, section, status } = req.body || {};
    const data = await svc.setSectionStatus({
      publisher_name,
      section,
      status,
    });
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};
