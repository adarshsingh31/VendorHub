/**
 * axiosInstance.js — Shared Axios instance for all VendorHub API calls.
 *
 * Request interceptor: automatically injects the stored JWT into every
 * outgoing request as:  Authorization: Bearer <token>
 *
 * Response interceptor: if the server returns 401 (token expired / invalid),
 * it clears localStorage and redirects the user to /login so they can
 * re-authenticate — regardless of whether they originally logged in with
 * email/password or Google.
 *
 * Usage:
 *   import api from './axiosInstance'
 *   const { data } = await api.get('/api/orders')
 */

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

// ─── Request Interceptor ───────────────────────────────────────────────────────
// Runs before every request. Reads the JWT from localStorage and attaches it.
// The key 'vh_token' is the single source of truth used throughout the app.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("vh_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ──────────────────────────────────────────────────────
// Runs after every response. On 401, clears auth data and redirects to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is expired or invalid — force re-login
      localStorage.removeItem("vh_token");
      localStorage.removeItem("vh_user");
      // Only redirect if not already on an auth page
      const publicPaths = ["/login", "/signup", "/forgot-password", "/"];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
