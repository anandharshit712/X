// services/settings.service.js
const settingsRepo = require("../repositories/settings.repo");

/** Compose account view from dashboard_login + dashboard_details */
async function getAccount({ advertiserId }) {
  const [login, details] = await Promise.all([
    settingsRepo.getLogin({ advertiserId }),
    settingsRepo.getDetails({ advertiserId }),
  ]);

  // stable shape for the UI
  return {
    advertiser_id: advertiserId,
    name: login?.name ?? null,
    email: login?.email ?? null,
    account_type: login?.account_type ?? null,
    company_name: login?.company_name ?? null,
    address: login?.address ?? null,
    city: login?.city ?? null,
    pincode: login?.pincode ?? null,
    country: login?.country ?? null,

    personal_email: details?.personal_email ?? null,
    whatsapp_number: details?.whatsapp_number ?? null,
    skype_id: details?.skype_id ?? null,

    created_at: login?.created_at ?? null, // if you later add it
  };
}

/** Upsert both tables: update dashboard_login fields & upsert dashboard_details */
async function updateAccount({ advertiserId, payload }) {
  const updatedLogin = await settingsRepo.updateLogin({
    advertiserId,
    fields: {
      name: payload.name,
      email: payload.email,
      account_type: payload.account_type,
      company_name: payload.company_name,
      address: payload.address,
      city: payload.city,
      pincode: payload.pincode,
      country: payload.country,
    },
  });

  const updatedDetails = await settingsRepo.upsertDetails({
    advertiserId,
    fields: {
      personal_email: payload.personal_email,
      whatsapp_number: payload.whatsapp_number,
      skype_id: payload.skype_id,
    },
  });

  // return composited view
  return {
    advertiser_id: advertiserId,
    name: updatedLogin?.name ?? null,
    email: updatedLogin?.email ?? null,
    account_type: updatedLogin?.account_type ?? null,
    company_name: updatedLogin?.company_name ?? null,
    address: updatedLogin?.address ?? null,
    city: updatedLogin?.city ?? null,
    pincode: updatedLogin?.pincode ?? null,
    country: updatedLogin?.country ?? null,

    personal_email: updatedDetails?.personal_email ?? null,
    whatsapp_number: updatedDetails?.whatsapp_number ?? null,
    skype_id: updatedDetails?.skype_id ?? null,
  };
}

module.exports = { getAccount, updateAccount };
