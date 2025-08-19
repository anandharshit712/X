import api from "../lib/api";
export type AnalyticsParams = {
  from?: string;
  to?: string;
  app_id?: string;
  country?: string;
  metric?: string;
};
export const getAnalytics = async (p: AnalyticsParams) =>
  (await api.get("/api/analytics", { params: p })).data;
