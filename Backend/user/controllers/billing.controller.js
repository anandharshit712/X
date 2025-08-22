const billingService = require("../services/billing.service");

async function getBillingDetails(req, res) {
  const advertiserId = req.user?.advertiser_id;
  if (!advertiserId) {
    return res
      .status(401)
      .json({
        ok: false,
        error: { code: "UNAUTHORIZED", message: "Missing advertiser context" },
      });
  }
  const data = await billingService.getBillingDetails({ advertiserId });
  return res.json({ ok: true, data });
}

async function upsertBillingDetails(req, res) {
  const advertiserId = req.user?.advertiser_id;
  if (!advertiserId) {
    return res
      .status(401)
      .json({
        ok: false,
        error: { code: "UNAUTHORIZED", message: "Missing advertiser context" },
      });
  }

  const payload = {
    beneficiary_name: req.body?.beneficiary_name ?? null,
    account_number: req.body?.account_number ?? null,
    ifsc_code: req.body?.ifsc_code ?? null,
    pan: req.body?.pan ?? null,
    gstin: req.body?.gstin ?? null,
    bank_name: req.body?.bank_name ?? null,
    swift_code: req.body?.swift_code ?? null,
  };

  const data = await billingService.upsertBillingDetails({
    advertiserId,
    payload,
  });
  return res.json({ ok: true, data });
}

module.exports = { getBillingDetails, upsertBillingDetails };
