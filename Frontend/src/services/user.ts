import api from "../lib/api";
export const getBilling = async () =>
  (await api.get("/api/user/billing-details")).data;
export const updateBilling = async (payload: any) =>
  (await api.put("/api/user/billing-details", payload)).data;
