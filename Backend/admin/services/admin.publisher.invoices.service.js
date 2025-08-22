const repo = require("../repositories/admin.publisher.invoices.repository");

exports.list = async (filters) => {
  const { rows, total, page, limit } = await repo.list(filters);
  return { data: rows, total, page, limit };
};
