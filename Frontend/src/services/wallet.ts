// src/api/wallet.ts (or wherever your file lives)
import api from "../lib/api";

/** Allowed payment methods (store exact values in DB) */
export type PaymentMethod = "BANK_TRANSFER" | "UPI" | "CREDIT_CARD";

/** Transaction shape returned by the backend list API */
export interface WalletTransaction {
  transaction_id: number; // or `id` if you normalize elsewhere
  amount: number;
  transaction_type: "TOP_UP" | "SPEND" | "REFUND" | "ADJUSTMENT";
  transaction_status: "SUCCESS" | "FAILED" | "PENDING";
  payment_method?: PaymentMethod | null;
  created_at: string; // ISO timestamp
  // note/coupon_code etc. can be added if you surface them in UI
}

/** Balance response shape (controller returns { ok, data }) */
export interface WalletBalanceData {
  advertiser_id: number;
  balance: number;
  as_of: string; // ISO timestamp
}

/** Params for transactions listing */
export interface ListTxParams {
  from?: string;
  to?: string;
  page?: number;
  size?: number;
  type?: "TOP_UP" | "SPEND" | "REFUND" | "ADJUSTMENT" | string;
}

/** Add funds request (new) */
export interface AddFundsRequest {
  amount: number;
  payment_method: PaymentMethod;
  note?: string;
}

/** Legacy payload (old UI used `method`) — still supported */
export interface AddFundsLegacyRequest {
  amount: number;
  method: PaymentMethod | string;
  note?: string;
}

/* =========================
 *        API Calls
 * ======================= */

export const getBalance = async () =>
  (
    await api.get<{ ok: boolean; data: WalletBalanceData }>(
      "/api/wallet/balance"
    )
  ).data;

export const getTransactions = async (p: ListTxParams) =>
  (await api.get("/api/wallet/transactions", { params: p })).data;

export const getWalletInvoices = async (p: { from?: string; to?: string }) =>
  (await api.get("/api/wallet/invoices", { params: p })).data;

/**
 * addFunds — supports both new and legacy call styles:
 *   addFunds(5000, 'UPI')
 *   addFunds({ amount: 5000, payment_method: 'UPI' })
 *   addFunds({ amount: 5000, method: 'UPI' }) // legacy
 */
export async function addFunds(
  amount: number,
  payment_method: PaymentMethod
): Promise<any>;
export async function addFunds(
  payload: AddFundsRequest | AddFundsLegacyRequest
): Promise<any>;
export async function addFunds(
  arg1: number | AddFundsRequest | AddFundsLegacyRequest,
  arg2?: PaymentMethod
): Promise<any> {
  let body: AddFundsRequest;

  if (typeof arg1 === "number") {
    // Style: addFunds(5000, 'UPI')
    body = { amount: arg1, payment_method: arg2 as PaymentMethod };
  } else {
    // Style: addFunds({ amount, payment_method }) or legacy { amount, method }
    const payload = arg1 as AddFundsRequest | AddFundsLegacyRequest;
    const pm =
      (payload as AddFundsRequest).payment_method ??
      (payload as AddFundsLegacyRequest).method;
    body = {
      amount: payload.amount,
      payment_method: pm as PaymentMethod,
      note: (payload as any).note,
    };
  }

  const res = await api.post("/api/wallet/add-funds", body, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });

  return res.data; // { ok: true, data: { transaction, balance } }
}
