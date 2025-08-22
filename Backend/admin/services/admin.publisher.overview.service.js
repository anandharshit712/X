const repo = require("../repositories/admin.publisher.overview.repository");

exports.getOverview = async () => {
  // If later we need cross-db context (e.g., user-side wallet), add it here.
  return await repo.getOverview();
};
