const billingRepo = require("../repositories/billing.repo");

async function getBillingDetails({ advertiserId }) {
  const row = await billingRepo.findByAdvertiserId({ advertiserId });
  // Return a stable shape (nulls if not set)
  return row || {
    advertiser_id: advertiserId,
    beneficiary_name: null,
    account_number: null,
    ifsc_code: null,
    pan: null,
    gstin: null,
    bank_name: null,
    swift_code: null,
    id: null,
    created_at: null,
  };
}

async function upsertBillingDetails({ advertiserId, payload }) {
  // If row exists, update; else insert
  const existing = await billingRepo.findByAdvertiserId({ advertiserId });
  if (existing?.id) {
    const updated = await billingRepo.updateById({ id: existing.id, payload });
    return updated;
  } else {
    const created = await billingRepo.insertOne({ advertiserId, payload });
    return created;
  }
}

module.exports = { getBillingDetails, upsertBillingDetails };
