const repo = require("../repositories/admin.publisher.detail.repository");

exports.getOne = async ({ publisherName }) => {
  const exists = await repo.ensurePublisher(publisherName);
  if (!exists) return null;

  const [profile, kpis, latestInvoices, latestTransactions, latestValidations] =
    await Promise.all([
      repo.getProfile(publisherName),
      repo.getKPIs(publisherName),
      repo.getInvoices(publisherName, 10),
      repo.getTransactions(publisherName, 10),
      repo.getValidations(publisherName, 6),
    ]);

  return {
    publisherName,
    profile, // bank/company/billing (from dashboard_validation)
    kpis, // counts/sums for header cards
    latestInvoices, // last 10
    latestTransactions, // last 10
    latestValidations, // last 6
  };
};
