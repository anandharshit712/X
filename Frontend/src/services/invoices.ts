import api from "../lib/api";
export const listInvoices = async () => (await api.get("/api/invoices")).data;
export const uploadInvoice = async (file: File) => {
  const fd = new FormData();
  fd.append("file", file);
  return (
    await api.post("/api/invoices/upload", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  ).data;
};
export const downloadInvoice = async (id: string) => {
  const res = await api.get(`/api/invoices/${id}/download`, {
    responseType: "blob",
  });
  return res.data; // blob; createObjectURL in component
};
