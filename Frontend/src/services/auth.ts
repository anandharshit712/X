// src/services/auth.ts
// Tiny auth service that returns { token, user, redirectPath } from backend.
// Assumes you have an axios instance exported from ./http.
// If you don't, see the note at the bottom for a drop‑in http client.

import http from "../lib/api";

export type UserShape = {
  id?: number;
  advertiser_id?: number;
  name: string;
  email: string;
  role: "admin" | "user";
  account_type?: string | null;
};

export type AuthResponse = {
  token: string;
  user: UserShape;
  redirectPath: string; // e.g., "/admin/publisher/dashboard" or "/dashboard"
  message?: string;
};

// ---- LOGIN ----
export async function login(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await http.post("/auth/login", payload);

  // Some controllers return { token, user, redirectPath }
  // Others return { message, data: { token, user, redirectPath } }
  const data = res.data?.data ?? res.data;

  return {
    token: data.token,
    user: data.user,
    redirectPath: data.redirectPath,
    message: data.message,
  };
}

// ---- SIGNUP ----
export type SignupPayload = {
  name: string;
  email: string;
  password: string;
  account_type?: string;
  company_name?: string;
  address?: string;
  city?: string;
  pincode?: string;
  country?: string;
};

export async function signup(payload: SignupPayload): Promise<AuthResponse> {
  const res = await http.post("/auth/register", payload);
  const data = res.data?.data ?? res.data;

  return {
    token: data.token,
    user: data.user ?? {
      id: data.advertiser_id ?? data.id,
      advertiser_id: data.advertiser_id,
      name: data.name,
      email: data.email,
      role: data.role,
      account_type: data.account_type,
    },
    redirectPath: data.redirectPath,
    message: data.message,
  };
}

export async function changePassword(body: { old_password: string; new_password: string }) {
  const res = await http.post("/api/auth/change-password", body);
  return res.data;
}
/* 
NOTE: If you DON'T already have src/services/http.ts, create it like this:

// src/services/http.ts
import axios from "axios";
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
});
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export default http;

*/
