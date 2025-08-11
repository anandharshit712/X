// repositories/campaigns.repo.js
const { pools } = require("../config/database");
const pool = pools.dashboard;

/** List with search, status, date, and pagination */
async function fetchCampaigns({
  advertiserId,
  q,
  status,
  startISO,
  endISO,
  page = 1,
  size = 20,
}) {
  const offset = (page - 1) * size;
  const params = [advertiserId, startISO, endISO];
  let where = `
    WHERE advertiser_id = $1
      AND created_at::date BETWEEN $2 AND $3
  `;

  if (q) {
    params.push(`%${q}%`, `%${q}%`);
    where += ` AND (campaign_name ILIKE $${params.length - 1} OR app ILIKE $${
      params.length
    })`;
  }
  if (status) {
    params.push(status);
    where += ` AND offer_status = $${params.length}`;
  }

  const sqlItems = `
    SELECT
      id, advertiser_id, employee_id,
      campaign_name, app, app_category, description,
      bid_requested, bid_accepted, tracking_type, capping,
      tracking_url, offer_type, offer_status, created_at
    FROM public.dashboard_offers
    ${where}
    ORDER BY created_at DESC, id DESC
    LIMIT ${size} OFFSET ${offset};
  `;
  const sqlCount = `
    SELECT COUNT(*)::bigint AS total
    FROM public.dashboard_offers
    ${where};
  `;

  const [itemsRes, countRes] = await Promise.all([
    pool.query(sqlItems, params),
    pool.query(sqlCount, params),
  ]);

  return {
    items: itemsRes.rows,
    total: Number(countRes.rows?.[0]?.total || 0),
  };
}

async function findById({ advertiserId, id }) {
  const sql = `
    SELECT
      id, advertiser_id, employee_id,
      campaign_name, app, app_category, description,
      bid_requested, bid_accepted, tracking_type, capping,
      tracking_url, offer_type, offer_status, created_at
    FROM public.dashboard_offers
    WHERE advertiser_id = $1 AND id = $2
    LIMIT 1;
  `;
  const { rows } = await pool.query(sql, [advertiserId, id]);
  return rows[0] || null;
}

async function insertOne({ advertiserId, fields }) {
  const sql = `
    INSERT INTO public.dashboard_offers
      (advertiser_id, employee_id, campaign_name, app, app_category, description,
       bid_requested, bid_accepted, tracking_type, capping, tracking_url, offer_type, offer_status)
    VALUES
      ($1, $2, $3, $4, $5, $6,
       $7, $8, $9, $10, $11, $12, $13)
    RETURNING
      id, advertiser_id, employee_id,
      campaign_name, app, app_category, description,
      bid_requested, bid_accepted, tracking_type, capping,
      tracking_url, offer_type, offer_status, created_at;
  `;
  const params = [
    advertiserId,
    fields.employee_id ?? null,
    fields.campaign_name ?? null,
    fields.app ?? null,
    fields.app_category ?? null,
    fields.description ?? null,
    fields.bid_requested ?? null,
    fields.bid_accepted ?? null, // usually NULL on create
    fields.tracking_type ?? null,
    fields.capping ?? null,
    fields.tracking_url ?? null,
    fields.offer_type ?? null,
    fields.offer_status ?? "PENDING",
  ];
  const { rows } = await pool.query(sql, params);
  return rows[0];
}

async function updateById({ advertiserId, id, fields }) {
  // Build dynamic SET based on provided fields
  const sets = [];
  const params = [advertiserId, id];
  const push = (col, val) => {
    if (typeof val !== "undefined") {
      params.push(val);
      sets.push(`${col} = $${params.length}`);
    }
  };

  push("employee_id", fields.employee_id);
  push("campaign_name", fields.campaign_name);
  push("app", fields.app);
  push("app_category", fields.app_category);
  push("description", fields.description);
  push("bid_requested", fields.bid_requested);
  push("bid_accepted", fields.bid_accepted);
  push("tracking_type", fields.tracking_type);
  push("capping", fields.capping);
  push("tracking_url", fields.tracking_url);
  push("offer_type", fields.offer_type);
  push("offer_status", fields.offer_status);

  if (sets.length === 0) {
    // nothing to update; return current
    return findById({ advertiserId, id });
  }

  const sql = `
    UPDATE public.dashboard_offers
       SET ${sets.join(", ")}
     WHERE advertiser_id = $1 AND id = $2
     RETURNING
       id, advertiser_id, employee_id,
       campaign_name, app, app_category, description,
       bid_requested, bid_accepted, tracking_type, capping,
       tracking_url, offer_type, offer_status, created_at;
  `;
  const { rows } = await pool.query(sql, params);
  return rows[0] || null;
}

module.exports = {
  fetchCampaigns,
  findById,
  insertOne,
  updateById,
};
