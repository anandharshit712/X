const repo = require("../repositories/admin.advertiser.advertisers.repository");

exports.list = async ({ q, page, limit }) => {
  const base = await repo.list({ q, page, limit });
  const enriched = await repo.attachLightStats(base.data);
  return { ...base, data: enriched };
};

exports.detail = async ({ advertiserName }) => {
  const exists = await repo.ensureAdvertiser(advertiserName);
  if (!exists) return null;

  const [profile, kpis, latestOffers, latestRewards, approvals] =
    await Promise.all([
      repo.getProfile(advertiserName),
      repo.getKPIs(advertiserName),
      repo.getOffers(advertiserName, 10),
      repo.getRewards(advertiserName, 10),
      repo.getApprovals(advertiserName, 10),
    ]);

  return {
    advertiserName,
    profile,
    kpis,
    latestOffers,
    latestRewards,
    approvals,
  };
};
