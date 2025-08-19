import api from "../lib/api";

export const getPayments = async (params?: { from?: string; to?: string; app_id?: string }) =>
  (await api.get("/api/payments", { params })).data;