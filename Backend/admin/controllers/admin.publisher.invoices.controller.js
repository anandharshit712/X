// controllers/admin/publisher.invoices.controller.js
const svc = require("../../services/admin/publisher.invoices.service");

exports.list = async (req, res, next) => {
  try {
    const {
      status,
      publisher,
      month,
      year,
      search,
      limit,
      offset,
      sort = "submitted_at",
      order = "desc",
    } = req.query;
    const data = await svc.list({
      status,
      publisher,
      month: month ? Number(month) : undefined,
      year: year ? Number(year) : undefined,
      search,
      limit: limit ? Number(limit) : 100,
      offset: offset ? Number(offset) : 0,
      sort,
      order: String(order).toLowerCase() === "asc" ? "asc" : "desc",
    });
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    const created = await svc.create(req.body);
    res.status(201).json({ ok: true, data: created });
  } catch (e) {
    next(e);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { invoiceNumber } = req.params;
    const updated = await svc.update(invoiceNumber, req.body);
    res.json({ ok: true, data: updated });
  } catch (e) {
    next(e);
  }
};

exports.get = async (req, res, next) => {
  try {
    const { invoiceNumber } = req.params;
    const data = await svc.get(invoiceNumber);
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};
