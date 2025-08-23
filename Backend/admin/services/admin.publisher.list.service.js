const repo = require("../repositories/admin.publisher.list.repository");

exports.list = async ({ q, page, limit }) => {
  const list = await repo.list({ q, page, limit });
  // add quick stats for each row without heavy queries
  const enriched = await repo.attachLightStats(list.data);
  return { ...list, data: enriched };
};
