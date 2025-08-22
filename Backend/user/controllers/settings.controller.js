// controllers/settings.controller.js
const settingsService = require("../services/settings.service");

async function getAccount(req, res) {
  const advertiserId = req.user?.advertiser_id;
  if (!advertiserId) {
    return res
      .status(401)
      .json({
        ok: false,
        error: { code: "UNAUTHORIZED", message: "Missing advertiser context" },
      });
  }

  const data = await settingsService.getAccount({ advertiserId });
  return res.json({ ok: true, data });
}

async function updateAccount(req, res) {
  const advertiserId = req.user?.advertiser_id;
  if (!advertiserId) {
    return res
      .status(401)
      .json({
        ok: false,
        error: { code: "UNAUTHORIZED", message: "Missing advertiser context" },
      });
  }

  // Allow updates for basic profile + contact details
  const body = req.body || {};
  const payload = {
    // dashboard_login
    name: body.name ?? null,
    email: body.email ?? null,
    account_type: body.account_type ?? null,
    company_name: body.company_name ?? null,
    address: body.address ?? null,
    city: body.city ?? null,
    pincode: body.pincode ?? null,
    country: body.country ?? null,
    // dashboard_details
    personal_email: body.personal_email ?? null,
    whatsapp_number: body.whatsapp_number ?? null,
    skype_id: body.skype_id ?? null,
  };

  const data = await settingsService.updateAccount({ advertiserId, payload });
  return res.json({ ok: true, data });
}

module.exports = { getAccount, updateAccount };
