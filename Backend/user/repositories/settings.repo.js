// repositories/settings.repo.js
const { pools } = require("../../config/database");
const pool = pools.dashboard;

async function getLogin({ advertiserId }) {
  const sql = `
    SELECT advertiser_id, name, email, account_type, company_name, address, city, pincode, country
    FROM public.dashboard_login
    WHERE advertiser_id = $1
    LIMIT 1;
  `;
  const { rows } = await pool.query(sql, [advertiserId]);
  return rows[0] || null;
}

async function getDetails({ advertiserId }) {
  const sql = `
    SELECT advertiser_id, personal_email, whatsapp_number, skype_id
    FROM public.dashboard_details
    WHERE advertiser_id = $1
    LIMIT 1;
  `;
  const { rows } = await pool.query(sql, [advertiserId]);
  return rows[0] || null;
}

async function updateLogin({ advertiserId, fields }) {
  // Only update provided fields (no-op for null/undefined)
  const sets = [];
  const params = [advertiserId];
  const push = (col, val) => {
    if (typeof val !== "undefined") {
      params.push(val);
      sets.push(`${col} = $${params.length}`);
    }
  };

  push("name", fields.name);
  push("email", fields.email);
  push("account_type", fields.account_type);
  push("company_name", fields.company_name);
  push("address", fields.address);
  push("city", fields.city);
  push("pincode", fields.pincode);
  push("country", fields.country);

  if (sets.length === 0) {
    // nothing to update; return current row
    return getLogin({ advertiserId });
  }

  const sql = `
    UPDATE public.dashboard_login
       SET ${sets.join(", ")}
     WHERE advertiser_id = $1
     RETURNING advertiser_id, name, email, account_type, company_name, address, city, pincode, country;
  `;
  const { rows } = await pool.query(sql, params);
  return rows[0];
}

async function upsertDetails({ advertiserId, fields }) {
  // Try update first
  const updateSql = `
    UPDATE public.dashboard_details
       SET personal_email = COALESCE($2, personal_email),
           whatsapp_number = COALESCE($3, whatsapp_number),
           skype_id = COALESCE($4, skype_id)
     WHERE advertiser_id = $1
     RETURNING advertiser_id, personal_email, whatsapp_number, skype_id;
  `;
  const upRes = await pool.query(updateSql, [
    advertiserId,
    fields.personal_email ?? null,
    fields.whatsapp_number ?? null,
    fields.skype_id ?? null,
  ]);
  if (upRes.rowCount > 0) return upRes.rows[0];

  // Insert if not exists
  const insertSql = `
    INSERT INTO public.dashboard_details (advertiser_id, personal_email, whatsapp_number, skype_id)
    VALUES ($1, $2, $3, $4)
    RETURNING advertiser_id, personal_email, whatsapp_number, skype_id;
  `;
  const insRes = await pool.query(insertSql, [
    advertiserId,
    fields.personal_email ?? null,
    fields.whatsapp_number ?? null,
    fields.skype_id ?? null,
  ]);
  return insRes.rows[0];
}

module.exports = {
  getLogin,
  getDetails,
  updateLogin,
  upsertDetails,
};
