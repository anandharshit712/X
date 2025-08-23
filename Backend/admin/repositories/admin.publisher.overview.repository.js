const pool = require("../../config/database");

// Totals for cards on the page. We stick to admin DB objects from your SQL.
exports.countTotals = async ({ start, end }) => {
  const client = await pool.connect();
  try {
    const [{ rows: pub }, { rows: adv }, { rows: off }] = await Promise.all([
      client.query("SELECT COUNT(*)::int AS c FROM public.publishers"),
      client.query("SELECT COUNT(*)::int AS c FROM public.advertisers"),
      client.query(
        "SELECT COUNT(*)::int AS c FROM public.dashboard_offers WHERE created_at BETWEEN $1 AND $2",
        [start, end]
      ),
    ]);

    return {
      publishers: pub[0]?.c ?? 0,
      offers: off[0]?.c ?? 0,
      advertisers: adv[0]?.c ?? 0,
      apps: 0, // not present in admin DB schema; leaving 0 to keep UI stable
    };
  } finally {
    client.release();
  }
};

// Pending counts for the “Pending Approvals” strip
exports.countPending = async ({ start, end }) => {
  const client = await pool.connect();
  try {
    const q = (table, col = "status") =>
      client.query(
        `SELECT COUNT(*)::int AS c FROM public.${table} WHERE (${col} = 'pending' OR ${col} IS NULL) AND (created_at BETWEEN $1 AND $2 OR created_at IS NULL)`,
        [start, end]
      );

    const [invoices, publishers, offers, notifications] = await Promise.all([
      q("dashboard_invoices"),
      q("dashboard_pub_approval"),
      q("dashboard_offer_approval"),
      q("dashboard_notification_approval"),
    ]);

    return {
      invoices: invoices.rows[0]?.c ?? 0,
      publishers: publishers.rows[0]?.c ?? 0,
      offers: offers.rows[0]?.c ?? 0,
      notifications: notifications.rows[0]?.c ?? 0,
    };
  } finally {
    client.release();
  }
};

// “Top offers” table for margins or volume; this is illustrative until you wire real KPIs
exports.selectTopOffers = async ({ metric, range: { start, end }, limit }) => {
  const client = await pool.connect();
  try {
    // We don’t have actual margin/volume columns in admin DB; approximate from rewards + offers created window.
    const { rows } = await client.query(
      `
      SELECT
        o.offer_id::text AS id,
        o.offer_name      AS name,
        COALESCE(SUM(r.your_revenue)::numeric, 0)  AS approx_margin,
        COALESCE(COUNT(r.reward_id), 0)            AS approx_volume
      FROM public.dashboard_offers o
      LEFT JOIN public.dashboard_offer_reward r
        ON r.offer_id = o.offer_id
      WHERE (o.created_at BETWEEN $1 AND $2)
      GROUP BY o.offer_id, o.offer_name
      ORDER BY ${metric === "volume" ? "approx_volume" : "approx_margin"} DESC
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
  } finally {
    client.release();
  }
};
