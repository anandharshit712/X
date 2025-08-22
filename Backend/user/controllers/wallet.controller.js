// controllers/wallet.controller.js
const walletService = require("../services/wallet.service");

async function getBalance(req, res) {
  const advertiserId = req.user?.advertiser_id;
  if (!advertiserId) {
    return res.status(401).json({
      ok: false,
      error: { code: "UNAUTHORIZED", message: "Missing advertiser context" },
    });
  }
  const data = await walletService.getBalance({ advertiserId });
  return res.json({ ok: true, data });
}

async function listTransactions(req, res) {
  const advertiserId = req.user?.advertiser_id;
  if (!advertiserId) {
    return res.status(401).json({
      ok: false,
      error: { code: "UNAUTHORIZED", message: "Missing advertiser context" },
    });
  }

  const { from, to, page = 1, size = 20, type } = req.query;

  const data = await walletService.listTransactions({
    advertiserId,
    from: from || null,
    to: to || null,
    page: Number(page) || 1,
    size: Math.min(Number(size) || 20, 200),
    type: (type || "").toUpperCase() || null,
  });
  return res.json({ ok: true, ...data });
}

async function listReceipts(req, res) {
  const advertiserId = req.user?.advertiser_id;
  if (!advertiserId) {
    return res.status(401).json({
      ok: false,
      error: { code: "UNAUTHORIZED", message: "Missing advertiser context" },
    });
  }

  const { from, to } = req.query;
  const data = await walletService.listReceipts({
    advertiserId,
    from: from || null,
    to: to || null,
  });
  return res.json({ ok: true, data });
}

async function addFunds(req, res) {
  const advertiserId = req.user?.advertiser_id;
  if (!advertiserId) {
    return res.status(401).json({
      ok: false,
      error: { code: "UNAUTHORIZED", message: "Missing advertiser context" },
    });
  }

  const { amount, payment_method, note } = req.body;

  if (typeof amount !== "number" || Number.isNaN(amount) || amount <= 0) {
    return res.status(400).json({
      ok: false,
      error: { code: "BAD_REQUEST", message: "Invalid amount" },
    });
  }

  const allowed = ["BANK_TRANSFER", "UPI", "CREDIT_CARD"];
  if (!allowed.includes(payment_method)) {
    return res.status(400).json({
      ok: false,
      error: {
        code: "BAD_REQUEST",
        message:
          "Invalid payment_method. Allowed: BANK_TRANSFER | UPI | CREDIT_CARD",
      },
    });
  }

  const data = await walletService.addFunds({
    advertiserId,
    amount,
    payment_method,
    note,
  });
  return res.status(201).json({ ok: true, data });
}

module.exports = {
  getBalance,
  listTransactions,
  listReceipts,
  addFunds,
};
