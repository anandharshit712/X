const repo = require("../repositories/admin.publisher.overview.repository");

exports.getSummary = async ({ startDate, endDate }) => {
  // supports the date range pickers in Overview (falls back to last 7 days)
  const range = normalizeRange(startDate, endDate);
  const [totals, pending] = await Promise.all([
    repo.countTotals(range),
    repo.countPending(range),
  ]);

  // shape tailored to your Overview cards
  return {
    dateRange: range,
    totals, // { publishers, offers, advertisers, apps (0 when unknown) }
    pending, // { invoices, publishers, offers, notifications }
  };
};

exports.getTopOffers = async ({ metric, startDate, endDate, limit }) => {
  const range = normalizeRange(startDate, endDate);
  return repo.selectTopOffers({ metric, range, limit });
};

function normalizeRange(startDate, endDate) {
  const end = endDate ? new Date(endDate) : new Date();
  const start = startDate ? new Date(startDate) : new Date(end);
  start.setDate(end.getDate() - 6);
  return {
    start: new Date(start.setHours(0, 0, 0, 0)),
    end: new Date(end.setHours(23, 59, 59, 999)),
  };
}
