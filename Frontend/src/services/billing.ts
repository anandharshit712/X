import api from "../lib/api";

export const getBillingDetails = async () => (await api.get("/api/user/billing-details")).data;

export const upsertBillingDetails = async (payload: any) => (await api.put("/api/user/billing-details", payload)).data;
