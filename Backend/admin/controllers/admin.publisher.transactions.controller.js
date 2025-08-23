const service = require("../services/admin.publisher.transactions.service");

// GET /admin/publisher/:publisherName/transactions?from=&to=&status=&q=&limit=&offset=
exports.listTransactions = async (req, res, next) => {
  try {
    const { publisherName } = req.params;
    const { from, to, status, q, limit, offset } = req.query;

    const result = await service.listTransactions({
      publisherName,
      from,
      to,
      status,
      q,
      limit: Number(limit) || 25,
      offset: Number(offset) || 0,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

// POST /admin/publisher/:publisherName/transactions
exports.createTransaction = async (req, res, next) => {
  try {
    const { publisherName } = req.params;
    const payload = {
      publisherName,
      txnDate: req.body.date, // "YYYY-MM-DD"
      description: req.body.description || null,
      amount: req.body.amount, // number
      paidInFull: !!req.body.paidFully, // boolean
    };

    const created = await service.createTransaction(payload);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

// PUT /admin/publisher/transactions/:id
exports.updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;

    const changes = {
      txnDate: req.body.date, // optional
      description: req.body.description, // optional
      amount: req.body.amount, // optional
      publisherName: req.body.company, // optional
      paidInFull:
        typeof req.body.paidFully === "boolean"
          ? req.body.paidFully
          : undefined,
    };

    const updated = await service.updateTransaction({ id, changes });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /admin/publisher/transactions/:id
exports.deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    await service.deleteTransaction({ id });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
