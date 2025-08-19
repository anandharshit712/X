import api from "../lib/api";
export const getApps = async () => (await api.get("/api/apps")).data;
export const getAppStats = async (app_id: string, from?: string, to?: string) =>
  (await api.get(`/api/apps/${app_id}/stats`, { params: { from, to } })).data;
export const searchApps = async (query: string) => (await api.get(`/api/search-apps?q=${query}`)).data;
export const addApp = async (appData: any) => (await api.post("/api/apps", appData)).data;
