const { pools } = require("../../config/database");
const db = pools.employeeAdvertisers; // service_employee_advertisers

// Whitelist updatable columns to stay schema-safe
const updatableCols = new Set([
  "offer_name",
  "status",
  "description",
  "start_date",
  "end_date",
  "advertiser_name", // if you keep a name instead of id
  "landing_url",
  "preview_url",
  "tracking_url",
  "payout_currency",
  "payout_amount",
]);

exports.list = async ({ status, q, page, limit }) => {
  const offset = (page - 1) * limit;
  const params = [];
  const where = [];

  if (status && status !== "all") {
    params.push(status.toUpperCase());
    where.push(`status = $${params.length}`);
  }
  if (q) {
    params.push(`%${q.toLowerCase()}%`);
    where.push(
      `(LOWER(offer_name) LIKE $${params.length} OR LOWER(advertiser_name) LIKE $${params.length})`
    );
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const countSql = `SELECT COUNT(*)::int AS cnt FROM public.dashboard_offers ${whereSql}`;
  const listSql = `
    SELECT
      offer_id::text AS id,
      offer_name,
      COALESCE(status, 'ACTIVE') AS status,
      advertiser_name,
      description,
      start_date::date,
      end_date::date,
      payout_currency,
      payout_amount::numeric(12,2),
      created_at,
      updated_at
    FROM public.dashboard_offers
    ${whereSql}
    ORDER BY updated_at DESC NULLS LAST, created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  const [c, l] = await Promise.all([
    db.query(countSql, params),
    db.query(listSql, params),
  ]);
  return { total: c.rows[0]?.cnt || 0, page, limit, data: l.rows };
};

exports.create = async (p) => {
  const cols = [
    "offer_name",
    "status",
    "advertiser_name",
    "description",
    "start_date",
    "end_date",
    "payout_currency",
    "payout_amount",
    "landing_url",
    "preview_url",
    "tracking_url",
  ];
  const vals = [],
    ph = [];
  cols.forEach((k) => {
    if (p[k] !== undefined) {
      vals.push(p[k]);
      ph.push(`$${vals.length}`);
    } else {
      ph.push("DEFAULT");
    }
  });

  const sql = `
    INSERT INTO public.dashboard_offers
      (${cols.join(", ")})
    VALUES (${ph.join(", ")})
    RETURNING
      offer_id::text AS id, offer_name, status, advertiser_name, description,
      start_date::date, end_date::date, payout_currency, payout_amount::numeric(12,2),
      landing_url, preview_url, tracking_url, created_at, updated_at
  `;
  const { rows } = await db.query(sql, vals);
  return rows[0];
};

exports.get = async (offerId) => {
  const { rows } = await db.query(
    `SELECT
        offer_id::text AS id, offer_name, status, advertiser_name, description,
        start_date::date, end_date::date, payout_currency, payout_amount::numeric(12,2),
        landing_url, preview_url, tracking_url, created_at, updated_at
     FROM public.dashboard_offers
     WHERE offer_id = $1`,
    [offerId]
  );
  return rows[0] || null;
};

exports.update = async (offerId, patch) => {
  const sets = [];
  const vals = [];
  Object.entries(patch).forEach(([k, v]) => {
    if (updatableCols.has(k)) {
      vals.push(v);
      sets.push(`${k} = $${vals.length}`);
    }
  });
  if (!sets.length) return this.get(offerId);

  vals.push(offerId);
  const { rows } = await db.query(
    `UPDATE public.dashboard_offers
        SET ${sets.join(", ")}, updated_at = NOW()
      WHERE offer_id = $${vals.length}
      RETURNING
        offer_id::text AS id, offer_name, status, advertiser_name, description,
        start_date::date, end_date::date, payout_currency, payout_amount::numeric(12,2),
        landing_url, preview_url, tracking_url, created_at, updated_at`,
    vals
  );
  return rows[0] || null;
};

exports.setStatus = async (offerId, status) => {
  const { rows } = await db.query(
    `UPDATE public.dashboard_offers
        SET status = $2, updated_at = NOW()
      WHERE offer_id = $1
      RETURNING offer_id::text AS id, offer_name, status, updated_at`,
    [offerId, status]
  );
  return rows[0] || null;
};

// Apps from Offerwall that actually have offers (dynamic Step-4 dropdown)
exports.listOfferwallApps = async () => {
  const client = await pools.offerwall.connect();
  try {
    const q = `
      SELECT DISTINCT a.app_id, a.app_package AS label
      FROM public.offerwall_app a
      JOIN public.offerwall_offers o ON o.app_id = a.app_id
      ORDER BY label
    `;
    const { rows } = await client.query(q);
    return rows;
  } finally {
    client.release();
  }
};
