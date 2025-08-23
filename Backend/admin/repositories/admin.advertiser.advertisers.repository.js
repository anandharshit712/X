const { pools } = require("../../config/database");
const db = pools.employeeAdvertisers; // service_employee_advertisers

// ---------- LIST ----------
exports.list = async ({ q, page, limit }) => {
  const offset = (page - 1) * limit;
  const params = [];
  let where = "";

  if (q) {
    params.push(`%${q.toLowerCase()}%`);
    where = `WHERE LOWER(advertiser_name) LIKE $1`;
  }

  const countSql = `SELECT COUNT(*)::int AS cnt FROM public.advertisers ${where}`;
  const listSql = `
    SELECT advertiser_name
    FROM public.advertisers
    ${where}
    ORDER BY advertiser_name ASC
    LIMIT ${limit} OFFSET ${offset}
  `;

  const [c, l] = await Promise.all([
    db.query(countSql, params),
    db.query(listSql, params),
  ]);
  return {
    total: c.rows[0]?.cnt || 0,
    page,
    limit,
    data: l.rows, // [{ advertiser_name }]
  };
};

exports.attachLightStats = async (rows) => {
  if (!rows.length) return [];
  const names = rows.map((r) => r.advertiser_name);

  const [offers, rewards, appr] = await Promise.all([
    db.query(
      `SELECT advertiser_name,
              COUNT(*)::int AS offer_count
         FROM public.dashboard_offers
        WHERE advertiser_name = ANY($1)
        GROUP BY advertiser_name`,
      [names]
    ),
    db.query(
      `SELECT o.advertiser_name,
              COUNT(r.reward_id)::int AS reward_count
         FROM public.dashboard_offer_reward r
         JOIN public.dashboard_offers o ON o.offer_id = r.offer_id
        WHERE o.advertiser_name = ANY($1)
        GROUP BY o.advertiser_name`,
      [names]
    ),
    db.query(
      `SELECT o.advertiser_name,
              COUNT(*)::int FILTER (WHERE a.status = 'pending')   AS pending,
              COUNT(*)::int FILTER (WHERE a.status = 'approved')  AS approved,
              COUNT(*)::int FILTER (WHERE a.status = 'rejected')  AS rejected
         FROM public.dashboard_offer_approval a
         JOIN public.dashboard_offers o ON o.offer_id = a.offer_id
        WHERE o.advertiser_name = ANY($1)
        GROUP BY o.advertiser_name`,
      [names]
    ),
  ]);

  const offerMap = new Map(offers.rows.map((r) => [r.advertiser_name, r]));
  const rewardMap = new Map(rewards.rows.map((r) => [r.advertiser_name, r]));
  const apprMap = new Map(appr.rows.map((r) => [r.advertiser_name, r]));

  return rows.map((r) => {
    const o = offerMap.get(r.advertiser_name) || {};
    const rw = rewardMap.get(r.advertiser_name) || {};
    const a = apprMap.get(r.advertiser_name) || {};
    return {
      advertiserName: r.advertiser_name,
      offers: { count: o.offer_count || 0 },
      rewards: { count: rw.reward_count || 0 },
      approvals: {
        pending: a.pending || 0,
        approved: a.approved || 0,
        rejected: a.rejected || 0,
      },
    };
  });
};

// ---------- DETAIL ----------
exports.ensureAdvertiser = async (advertiserName) => {
  const { rows } = await db.query(
    `SELECT advertiser_name FROM public.advertisers WHERE advertiser_name = $1`,
    [advertiserName]
  );
  return rows[0]?.advertiser_name || null;
};

// Basic profile (extend columns here if your advertisers table has more fields)
exports.getProfile = async (advertiserName) => {
  const { rows } = await db.query(
    `SELECT advertiser_name, created_at
       FROM public.advertisers
      WHERE advertiser_name = $1
      LIMIT 1`,
    [advertiserName]
  );
  return rows[0] || { advertiser_name: advertiserName };
};

// KPIs for a single advertiser
exports.getKPIs = async (advertiserName) => {
  const [offers, rewards, approvals, notifications] = await Promise.all([
    db.query(
      `SELECT COUNT(*)::int AS count
         FROM public.dashboard_offers
        WHERE advertiser_name = $1`,
      [advertiserName]
    ),
    db.query(
      `SELECT COUNT(*)::int AS count,
              COALESCE(SUM(r.your_revenue),0)::numeric(12,2) AS revenue
         FROM public.dashboard_offer_reward r
         JOIN public.dashboard_offers o ON o.offer_id = r.offer_id
        WHERE o.advertiser_name = $1`,
      [advertiserName]
    ),
    db.query(
      `SELECT COUNT(*)::int AS count,
              COUNT(*) FILTER (WHERE status='pending')::int  AS pending,
              COUNT(*) FILTER (WHERE status='approved')::int AS approved,
              COUNT(*) FILTER (WHERE status='rejected')::int AS rejected
         FROM public.dashboard_offer_approval a
         JOIN public.dashboard_offers o ON o.offer_id = a.offer_id
        WHERE o.advertiser_name = $1`,
      [advertiserName]
    ),
    db
      .query(
        `SELECT COUNT(*)::int AS count,
              COUNT(*) FILTER (WHERE status='pending')::int  AS pending
         FROM public.dashboard_notification_approval a
        WHERE a.notification_id IN (
              SELECT n.notification_id
                FROM public.dashboard_notifications n
               WHERE n.advertiser_name = $1
         )`,
        [advertiserName]
      )
      .catch(() => ({ rows: [{ count: 0, pending: 0 }] })), // if notifications table not present, keep zeroes
  ]);

  return {
    offers: offers.rows[0]?.count || 0,
    rewards: {
      count: rewards.rows[0]?.count || 0,
      revenue: Number(rewards.rows[0]?.revenue || 0),
    },
    approvals: {
      total: approvals.rows[0]?.count || 0,
      pending: approvals.rows[0]?.pending || 0,
      approved: approvals.rows[0]?.approved || 0,
      rejected: approvals.rows[0]?.rejected || 0,
    },
    notifications: {
      total: notifications.rows[0]?.count || 0,
      pending: notifications.rows[0]?.pending || 0,
    },
  };
};

// Latest artifacts for the detail page
exports.getOffers = async (advertiserName, limit = 10) => {
  const { rows } = await db.query(
    `SELECT offer_id::text AS id, offer_name, status, start_date::date, end_date::date, updated_at
       FROM public.dashboard_offers
      WHERE advertiser_name = $1
      ORDER BY updated_at DESC NULLS LAST, created_at DESC
      LIMIT $2`,
    [advertiserName, limit]
  );
  return rows;
};

exports.getRewards = async (advertiserName, limit = 10) => {
  const { rows } = await db.query(
    `SELECT r.reward_id, r.offer_id::text AS offer_id, r.your_revenue, r.created_at
       FROM public.dashboard_offer_reward r
       JOIN public.dashboard_offers o ON o.offer_id = r.offer_id
      WHERE o.advertiser_name = $1
      ORDER BY r.created_at DESC
      LIMIT $2`,
    [advertiserName, limit]
  );
  return rows;
};

exports.getApprovals = async (advertiserName, limit = 10) => {
  const { rows } = await db.query(
    `SELECT a.approval_id, a.offer_id::text AS offer_id, a.status, a.note, a.approved_at, a.updated_at
       FROM public.dashboard_offer_approval a
       JOIN public.dashboard_offers o ON o.offer_id = a.offer_id
      WHERE o.advertiser_name = $1
      ORDER BY a.updated_at DESC NULLS LAST, a.created_at DESC
      LIMIT $2`,
    [advertiserName, limit]
  );
  return rows;
};
