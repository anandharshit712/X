import api from "../lib/api";
export const listCampaigns = async (p: {
  status?: string;
  app_id?: string;
  q?: string;
  page?: number;
  size?: number;
}) => (await api.get("/api/campaigns", { params: p })).data;
export const createCampaign = async (payload: any) =>
  (await api.post("/api/campaigns", payload)).data;
export const updateCampaign = async (id: string, payload: any) =>
  (await api.put(`/api/campaigns/${id}`, payload)).data;
export const pauseCampaign = async (id: string) =>
  (await api.post(`/api/campaigns/${id}/pause`, {})).data;
export const resumeCampaign = async (id: string) =>
  (await api.post(`/api/campaigns/${id}/resume`, {})).data;
export const getCampaignStats = async (
  id: string,
  p: { from?: string; to?: string }
) => (await api.get(`/api/campaigns/${id}/stats`, { params: p })).data;
