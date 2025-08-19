import api from "../lib/api";
export const getAccountSettings = async () =>
  (await api.get("/api/settings/account")).data;
export const updateAccountSettings = async (payload: any) =>
  (await api.put("/api/settings/account", payload)).data;
// Team routes are not implemented on BE; UI can stay visible but calls should be disabled/commented until added.
