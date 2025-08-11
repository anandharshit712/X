// services/payments.service.js
const paymentsRepo = require("../repositories/payments.repo");
const { computePayout } = require("../utils/commission");

function resolveDateRange(from, to) {
  const end = to ? new Date(to) : new Date();
  const start = from ? new Date(from) : new Date(end.getTime() - 29 * 24 * 60 * 60 * 1000);
  const startISO = start.toISOString().slice(0, 10);
  const endISO = end.toISOString().slice(0, 10);
  return { startISO, endISO };
}

async function listPayments({ advertiserId, from, to, appId }) {
  const { startISO, endISO } = resolveDateRange(from, to);

  const rows = await paymentsRepo.fetchPayments({
    advertiserId, startISO, endISO, appId,
  });

  // Compute payout per row & totals
  let totalGross = 0, totalCommission = 0, totalGST = 0, totalNet = 0;
  const items = rows.map(r => {
    const grossRevenue = Number(r.revenue || 0);
    const payout = computePayout(grossRevenue);
    totalGross += payout.grossRevenue;
    totalCommission += payout.commission_ex_gst;
    totalGST += payout.gst_on_commission;
    totalNet += payout.net_payout;

    return {
      date: r.date,            // 'YYYY-MM-DD'
      app_id: r.app_id,
      gross_revenue: payout.grossRevenue,
      commission_ex_gst: payout.commission_ex_gst,
      gst_on_commission: payout.gst_on_commission,
      net_payout: payout.net_payout,
      status: r.status || null // optional joined status
    };
  });

  return {
    window: { from: startISO, to: endISO },
    filters: { app_id: appId || null },
    totals: {
      gross_revenue: +totalGross.toFixed(6),
      commission_ex_gst: +totalCommission.toFixed(6),
      gst_on_commission: +totalGST.toFixed(6),
      net_payout: +totalNet.toFixed(6),
    },
    items,
  };
}

async function getPaymentStatus({ advertiserId, month, appId }) {
  // month expected 'YYYY-MM'; repo will handle parsing
  const rows = await paymentsRepo.fetchPaymentStatus({ advertiserId, month, appId });
  return { month: month || null, app_id: appId || null, items: rows };
}

module.exports = { listPayments, getPaymentStatus };
