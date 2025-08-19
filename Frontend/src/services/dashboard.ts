import api from "../lib/api"; // adjust path alias if needed

export async function getOverview() {
  const res = await api.get("/api/dashboard/overview");
  return res.data?.data ?? res.data;
}
