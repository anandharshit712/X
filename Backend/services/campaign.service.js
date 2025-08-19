// services/campaigns.service.js
const repo = require("../repositories/campaign.repo");

function resolveDateRange(from, to) {
  const end = to ? new Date(to) : new Date();
  const start = from
    ? new Date(from)
    : new Date(end.getTime() - 29 * 24 * 60 * 60 * 1000);
  const startISO = start.toISOString().slice(0, 10);
  const endISO = end.toISOString().slice(0, 10);
  return { startISO, endISO };
}

async function listCampaigns({
  advertiserId,
  q,
  status,
  from,
  to,
  page,
  size,
}) {
  const { startISO, endISO } = resolveDateRange(from, to);
  const { items, total } = await repo.fetchCampaigns({
    advertiserId,
    q,
    status,
    startISO,
    endISO,
    page,
    size,
  });

  return {
    page,
    size,
    total,
    items: items.map((r) => ({
      id: r.id,
      campaign_name: r.campaign_name,
      app: r.app,
      app_category: r.app_category,
      description: r.description,
      bid_requested: r.bid_requested ? Number(r.bid_requested) : null,
      bid_accepted: r.bid_accepted ? Number(r.bid_accepted) : null,
      tracking_type: r.tracking_type,
      capping: r.capping !== null ? Number(r.capping) : null,
      tracking_url: r.tracking_url,
      offer_type: r.offer_type,
      offer_status: r.offer_status,
      created_at: r.created_at,
    })),
  };
}

async function getCampaign({ advertiserId, id }) {
  return repo.findById({ advertiserId, id });
}

async function createCampaign({ advertiserId, payload }) {
  // Defaults
  const data = await repo.insertOne({
    advertiserId,
    fields: {
      ...payload,
      offer_status: "PENDING",
      bid_accepted: null,
    },
  });
  return data;
}

async function updateCampaign({ advertiserId, id, fields }) {
  return repo.updateById({ advertiserId, id, fields });
}

module.exports = {
  listCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
};
