const { pools } = require("../../config/database");
const db = pools.employeeAdvertisers; // service_employee_advertisers

// Map row into a frontend-friendly shape
const mapRow = (r) => ({
  rewardId: r.reward_id,
  offerId: String(r.offer_id),
  yourRevenue: Number(r.your_revenue || 0),
  createdAt: r.created_at,
  // add fields here later if you add columns (e.g., reward_name, is_active, etc.)
});

exports.list = async ({ offerId, page = 1, limit = 50 }) => {
  const offset = (page - 1) * limit;
  const params = [offerId];

  const totalSql = `SELECT COUNT(*)::int AS c FROM public.dashboard_offer_reward WHERE offer_id = $1`;
  const listSql = `
    SELECT reward_id, offer_id, your_revenue, created_at
    FROM public.dashboard_offer_reward
    WHERE offer_id = $1
    ORDER BY created_at DESC, reward_id DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  const [t, l] = await Promise.all([
    db.query(totalSql, params),
    db.query(listSql, params),
  ]);
  return { total: t.rows[0]?.c || 0, page, limit, data: l.rows.map(mapRow) };
};

exports.create = async (p) => {
  // Only pass known columns. If you later add columns, extend this INSERT.
  const { rows } = await db.query(
    `INSERT INTO public.dashboard_offer_reward (offer_id, your_revenue, created_at)
     VALUES ($1, $2, NOW())
     RETURNING reward_id, offer_id, your_revenue, created_at`,
    [p.offer_id, p.your_revenue]
  );
  return mapRow(rows[0]);
};

exports.update = async (rewardId, patch) => {
  const sets = [];
  const vals = [];
  let i = 1;

  if (patch.your_revenue != null) {
    sets.push(`your_revenue = $${i++}`);
    vals.push(patch.your_revenue);
  }
  // If you later add columns (e.g., reward_name, is_active), whitelist them here.

  if (!sets.length) {
    const { rows } = await db.query(
      `SELECT reward_id, offer_id, your_revenue, created_at
       FROM public.dashboard_offer_reward WHERE reward_id = $1`,
      [rewardId]
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  vals.push(rewardId);
  const { rows } = await db.query(
    `UPDATE public.dashboard_offer_reward
        SET ${sets.join(", ")}
      WHERE reward_id = $${vals.length}
      RETURNING reward_id, offer_id, your_revenue, created_at`,
    vals
  );
  return rows[0] ? mapRow(rows[0]) : null;
};

exports.remove = async (rewardId) => {
  await db.query(
    `DELETE FROM public.dashboard_offer_reward WHERE reward_id = $1`,
    [rewardId]
  );
};
