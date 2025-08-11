// services/wallet.service.js
const walletRepo = require("../repositories/wallet.repo");

function resolveDateRange(from, to) {
  const end = to ? new Date(to) : new Date();
  const start = from
    ? new Date(from)
    : new Date(end.getTime() - 29 * 24 * 60 * 60 * 1000);
  const startISO = start.toISOString().slice(0, 10);
  const endISO = end.toISOString().slice(0, 10);
  return { startISO, endISO };
}

async function getBalance({ advertiserId }) {
  // Prefer the latest explicit balance snapshot; otherwise compute from transactions
  const snapshot = await walletRepo.fetchLatestBalance({ advertiserId });
  if (snapshot)
    return {
      advertiser_id: advertiserId,
      balance: Number(snapshot.balance || 0),
      as_of: snapshot.as_of,
    };

  const computed = await walletRepo.computeBalanceFromTransactions({
    advertiserId,
  });
  return {
    advertiser_id: advertiserId,
    balance: Number(computed.balance || 0),
    as_of: computed.as_of,
  };
}

async function listTransactions({ advertiserId, from, to, page, size, type }) {
  const { startISO, endISO } = resolveDateRange(from, to);
  const { items, total } = await walletRepo.fetchTransactions({
    advertiserId,
    startISO,
    endISO,
    page,
    size,
    type,
  });
  return {
    page,
    size,
    total,
    items: items.map((t) => ({
      id: t.id,
      type: t.type, // TOP_UP | SPEND | REFUND | ADJUSTMENT
      amount: Number(t.amount || 0),
      status: t.status, // SUCCESS | FAILED | PENDING
      note: t.note || null,
      created_at: t.created_at,
    })),
  };
}

async function listReceipts({ advertiserId, from, to }) {
  const { startISO, endISO } = resolveDateRange(from, to);
  const items = await walletRepo.fetchTopupReceipts({
    advertiserId,
    startISO,
    endISO,
  });
  return {
    window: { from: startISO, to: endISO },
    items: items.map((r) => ({
      id: r.id,
      amount: Number(r.amount || 0),
      status: r.status,
      created_at: r.created_at,
      receipt_number: r.receipt_number, // derived token/sequence if available
    })),
  };
}

async function addFunds({ advertiserId, amount, note }) {
  // 1) insert a SUCCESS top-up txn
  const txn = await walletRepo.insertTopupTransaction({
    advertiserId,
    amount,
    note,
  });

  // 2) insert a new wallet snapshot row with updated balance
  const balance = await walletRepo.incrementBalance({
    advertiserId,
    delta: amount,
  });
  // balance: { wallet_id, advertiser_id, balance, as_of }

  // 3) track balance history linked to that wallet row
  await walletRepo.trackBalance({
    advertiserId,
    balance: balance.balance,
    wallet_id: balance.wallet_id,
  });

  return {
    transaction: txn,
    balance,
  };
}

module.exports = {
  getBalance,
  listTransactions,
  listReceipts,
  addFunds,
};
