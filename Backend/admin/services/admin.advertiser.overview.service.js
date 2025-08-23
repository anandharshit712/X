const repo = require("../repositories/admin.advertiser.overview.repository");

exports.getSummary = async ({ start, end }) => {
  const range = normalizeRange(start, end);
  const [totals, pending] = await Promise.all([
    repo.selectTotals(range),
    repo.selectPending(range),
  ]);
  return { range, totals, pending };
};

exports.getTopOffers = async ({ metric, start, end, limit }) => {
  const range = normalizeRange(start, end);
  return repo.selectTopOffers({ metric, range, limit });
};

function normalizeRange(start, end) {
  const e = end ? new Date(end) : new Date();
  const s = start
    ? new Date(start)
    : new Date(e.getTime() - 6 * 24 * 60 * 60 * 1000);
  s.setHours(0, 0, 0, 0);
  e.setHours(23, 59, 59, 999);
  return { start: s, end: e };
}
