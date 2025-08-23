// controllers/admin/publisher.validation.controller.js
const svc = require("../../services/admin/publisher.validation.service");

exports.list = async (req, res, next) => {
  try {
    const { publisher, month, year, limit, offset } = req.query;
    const data = await svc.list({
      publisher,
      month: month ? Number(month) : undefined,
      year: year ? Number(year) : undefined,
      limit: limit ? Number(limit) : 100,
      offset: offset ? Number(offset) : 0,
    });
    res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const created = await svc.create(req.body);
    res.status(201).json({ ok: true, data: created });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { employeeEmailId } = req.params;
    const updated = await svc.update(employeeEmailId, req.body);
    res.json({ ok: true, data: updated });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { employeeEmailId } = req.params;
    await svc.remove(employeeEmailId);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
