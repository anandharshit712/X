const repo = require("../repositories/admin.publisher.transactions.repository");

exports.listTransactions = async (params) => {
  // data table + summary cards
  const [rows, totals] = await Promise.all([
    repo.findTransactions(params),
    repo.getTotals(params.publisherName),
  ]);

  return {
    data: rows,
    totals, // { total_amount, paid_amount, unpaid_amount, total_rows }
  };
};

exports.createTransaction = async ({
  publisherName,
  txnDate,
  description,
  amount,
  paidInFull,
}) => {
  if (!publisherName || !txnDate || amount == null) {
    throw new Error("publisherName, date and amount are required");
  }
  return repo.insertTransaction({
    publisherName,
    txnDate,
    description,
    amount,
    paidInFull,
  });
};

exports.updateTransaction = async ({ id, changes }) => {
  if (!id) throw new Error("id is required");
  return repo.updateTransaction(id, changes);
};

exports.deleteTransaction = async ({ id }) => {
  if (!id) throw new Error("id is required");
  return repo.deleteTransaction(id);
};
