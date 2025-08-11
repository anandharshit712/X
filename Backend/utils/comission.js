// utils/commission.js
// Company commission is 30% including 18% GST on the commission.
// Commission ex-GST is 30% / 1.18 ≈ 25.4237288136%
const COMMISSION_RATE_INCL_GST = 0.3;
const GST_RATE = 0.18;

function commissionSplit(grossCommissionInclGST) {
  const commissionExGST = grossCommissionInclGST / (1 + GST_RATE);
  const gstOnCommission = grossCommissionInclGST - commissionExGST;
  return { commissionExGST, gstOnCommission };
}

function computePayout(grossRevenue) {
  const grossCommissionInclGST = grossRevenue * COMMISSION_RATE_INCL_GST;
  const { commissionExGST, gstOnCommission } = commissionSplit(
    grossCommissionInclGST
  );
  const netPayout = grossRevenue - commissionExGST; // exclude GST part from deduction
  return {
    grossRevenue,
    commission_ex_gst: +commissionExGST.toFixed(6),
    gst_on_commission: +gstOnCommission.toFixed(6),
    net_payout: +netPayout.toFixed(6),
  };
}

module.exports = {
  COMMISSION_RATE_INCL_GST,
  GST_RATE,
  computePayout,
};
