const { pools } = require("../../config/database");
const db = pools.employeeAdvertisers; // service_employee_advertisers

// Totals for overview cards
exports.selectTotals = async ({ start, end }) => {
  const [adv, offers, rewards] = await Promise.all([
    db.query(`SELECT COUNT(*)::int AS c FROM public.advertisers`),
    db.query(
      `SELECT COUNT(*)::int AS c FROM public.dashboard_offers WHERE created_at BETWEEN $1 AND $2`,
      [start, end]
    ),
    db.query(
      `SELECT COUNT(*)::int AS c FROM public.dashboard_offer_reward WHERE created_at BETWEEN $1 AND $2`,
      [start, end]
    ),
  ]);

  return {
    advertisers: adv.rows[0]?.c || 0,
    offers: offers.rows[0]?.c || 0,
    rewards: rewards.rows[0]?.c || 0,
  };
};

// Pending strips (approvals/notifications)
exports.selectPending = async ({ start, end }) => {
  const q = (table, col = "status") =>
    db.query(
      `SELECT COUNT(*)::int AS c
         FROM public.${table}
        WHERE COALESCE(${col}, 'pending') = 'pending'
          AND (created_at BETWEEN $1 AND $2 OR created_at IS NULL)`,
      [start, end]
    );

  const [offerAppr, notifAppr] = await Promise.all([
    q("dashboard_offer_approval"),
    q("dashboard_notification_approval"),
  ]);

  return {
    offerApprovals: offerAppr.rows[0]?.c || 0,
    notificationApprovals: notifAppr.rows[0]?.c || 0,
  };
};

// Top offers — approximations from rewards table
exports.selectTopOffers = async ({
  metric,
  range: { start, end },
  limit = 10,
}) => {
  // If you store true margin/volume metrics elsewhere, point to those columns here.
  const orderCol = metric === "volume" ? "approx_volume" : "approx_margin";

  const { rows } = await db.query(
    `
    SELECT
      o.offer_id::text       AS id,
      o.offer_name           AS name,
      COALESCE(SUM(r.your_revenue), 0)::numeric(12,2) AS approx_margin,
      COALESCE(COUNT(r.reward_id), 0)::int            AS approx_volume
    FROM public.dashboard_offers o
    LEFT JOIN public.dashboard_offer_reward r
      ON r.offer_id = o.offer_id
    WHERE (o.created_at BETWEEN $1 AND $2)
    GROUP BY o.offer_id, o.offer_name
    ORDER BY ${orderCol} DESC
    LIMIT $3
    `,
    [start, end, limit]
  );

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    [metric === "volume" ? "volume" : "margins"]: Number(
      metric === "volume" ? r.approx_volume : r.approx_margin
    ),
  }));
};
