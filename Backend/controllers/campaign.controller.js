// controllers/campaigns.controller.js
const svc = require("../services/campaign.service");

async function listCampaigns(req, res) {
  const advertiserId = req.user?.advertiser_id;
  if (!advertiserId) return res.status(401).json({ ok: false, error: { code: "UNAUTHORIZED", message: "Missing advertiser context" } });

  const { q, status, from, to, page = 1, size = 20 } = req.query;

  const data = await svc.listCampaigns({
    advertiserId,
    q: q || null,
    status: status || null,
    from: from || null,
    to: to || null,
    page: Math.max(1, Number(page) || 1),
    size: Math.min(200, Number(size) || 20),
  });

  return res.json({ ok: true, ...data });
}

async function getCampaign(req, res) {
  const advertiserId = req.user?.advertiser_id;
  if (!advertiserId) return res.status(401).json({ ok: false, error: { code: "UNAUTHORIZED", message: "Missing advertiser context" } });

  const id = Number(req.params.id);
  const row = await svc.getCampaign({ advertiserId, id });
  if (!row) return res.status(404).json({ ok: false, error: { code: "NOT_FOUND", message: "Campaign not found" } });
  return res.json({ ok: true, data: row });
}

async function createCampaign(req, res) {
  const advertiserId = req.user?.advertiser_id;
  if (!advertiserId) return res.status(401).json({ ok: false, error: { code: "UNAUTHORIZED", message: "Missing advertiser context" } });

  const body = req.body || {};
  const created = await svc.createCampaign({
    advertiserId,
    payload: {
      campaign_name: body.campaign_name ?? null,
      app: body.app ?? null,
      app_category: body.app_category ?? null,
      description: body.description ?? null,
      bid_requested: body.bid_requested ?? null,
      tracking_type: body.tracking_type ?? null,
      capping: body.capping ?? null,
      tracking_url: body.tracking_url ?? null,
      offer_type: body.offer_type ?? null,
    },
  });

  return res.status(201).json({ ok: true, data: created });
}

async function updateCampaign(req, res) {
  const advertiserId = req.user?.advertiser_id;
  if (!advertiserId) return res.status(401).json({ ok: false, error: { code: "UNAUTHORIZED", message: "Missing advertiser context" } });

  const id = Number(req.params.id);
  const body = req.body || {};
  const updated = await svc.updateCampaign({
    advertiserId,
    id,
    fields: {
      campaign_name: body.campaign_name,
      app: body.app,
      app_category: body.app_category,
      description: body.description,
      bid_requested: body.bid_requested,
      bid_accepted: body.bid_accepted,        // optional
      tracking_type: body.tracking_type,
      capping: body.capping,
      tracking_url: body.tracking_url,
      offer_type: body.offer_type,
      offer_status: body.offer_status,        // optional: e.g., 'PENDING' | 'ACTIVE' | 'PAUSED' | 'ENDED'
    },
  });

  if (!updated) return res.status(404).json({ ok: false, error: { code: "NOT_FOUND", message: "Campaign not found" } });
  return res.json({ ok: true, data: updated });
}

module.exports = {
  listCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
};
