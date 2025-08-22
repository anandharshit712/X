// controllers/payments.controller.js
const paymentsService = require("../services/payments.service");

async function listPayments(req, res) {
  const advertiserId = req.user?.advertiser_id;
  if (!advertiserId) {
    return res.status(401).json({ ok: false, error: { code: "UNAUTHORIZED", message: "Missing advertiser context" } });
  }
  const { from, to, app_id } = req.query;

  const data = await paymentsService.listPayments({
    advertiserId,
    from: from || null,
    to: to || null,
    appId: app_id || null,
  });

  return res.json({ ok: true, data });
}

async function getPaymentStatus(req, res) {
  const advertiserId = req.user?.advertiser_id;
  if (!advertiserId) {
    return res.status(401).json({ ok: false, error: { code: "UNAUTHORIZED", message: "Missing advertiser context" } });
  }
  const { month, app_id } = req.query; // month = 'YYYY-MM'

  const data = await paymentsService.getPaymentStatus({
    advertiserId,
    month: month || null,
    appId: app_id || null,
  });

  return res.json({ ok: true, data });
}

module.exports = { listPayments, getPaymentStatus };
