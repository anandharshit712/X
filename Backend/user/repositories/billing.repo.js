const { pools } = require("../../config/database");
const pool = pools.offerwall; // table lives in service_offerwall

async function findByAdvertiserId({ advertiserId }) {
  const sql = `
    SELECT
      id, advertiser_id, beneficiary_name, account_number, ifsc_code,
      pan, gstin, bank_name, swift_code, created_at
    FROM public.offerwall_billing_details
    WHERE advertiser_id = $1
    ORDER BY id DESC
    LIMIT 1;
  `;
  const { rows } = await pool.query(sql, [advertiserId]);
  return rows[0] || null;
}

async function insertOne({ advertiserId, payload }) {
  const sql = `
    INSERT INTO public.offerwall_billing_details
      (advertiser_id, beneficiary_name, account_number, ifsc_code, pan, gstin, bank_name, swift_code)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING
      id, advertiser_id, beneficiary_name, account_number, ifsc_code,
      pan, gstin, bank_name, swift_code, created_at;
  `;
  const params = [
    advertiserId,
    payload.beneficiary_name,
    payload.account_number,
    payload.ifsc_code,
    payload.pan,
    payload.gstin,
    payload.bank_name,
    payload.swift_code,
  ];
  const { rows } = await pool.query(sql, params);
  return rows[0];
}

async function updateById({ id, payload }) {
  const sql = `
    UPDATE public.offerwall_billing_details
       SET beneficiary_name = $2,
           account_number   = $3,
           ifsc_code        = $4,
           pan              = $5,
           gstin            = $6,
           bank_name        = $7,
           swift_code       = $8
     WHERE id = $1
     RETURNING
       id, advertiser_id, beneficiary_name, account_number, ifsc_code,
       pan, gstin, bank_name, swift_code, created_at;
  `;
  const params = [
    id,
    payload.beneficiary_name,
    payload.account_number,
    payload.ifsc_code,
    payload.pan,
    payload.gstin,
    payload.bank_name,
    payload.swift_code,
  ];
  const { rows } = await pool.query(sql, params);
  return rows[0];
}

module.exports = {
  findByAdvertiserId,
  insertOne,
  updateById,
};
