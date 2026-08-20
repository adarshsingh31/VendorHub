/**
 * sellerApplicationService.js
 *
 * API helpers for the Buyer → Seller application flow.
 * Follows the same pattern as the other service files — uses the shared
 * axiosInstance so every request automatically carries the Bearer token.
 */
import api from "./axiosInstance";

export const sellerApplicationService = {
  /**
   * POST /api/seller/apply
   * Submit a new seller application (buyer only).
   * payload: { shopName, shopDescription, phone, city, shopAddress }
   */
  submit: async (payload) => {
    const { data } = await api.post("/api/seller/apply", payload);
    return data;
  },

  /**
   * GET /api/seller/application
   * Fetch the logged-in buyer's latest application (or null).
   */
  getMyApplication: async () => {
    const { data } = await api.get("/api/seller/application");
    return data;
  },

  /**
   * GET /api/admin/seller-applications
   * Fetch all applications — admin only.
   */
  getAllApplications: async () => {
    const { data } = await api.get("/api/admin/seller-applications");
    return data;
  },

  /**
   * PATCH /api/admin/seller-applications/:id/approve
   * Approve an application — admin only.
   * Returns { token, user } with the new seller role.
   */
  approveApplication: async (id) => {
    const { data } = await api.patch(
      `/api/admin/seller-applications/${id}/approve`
    );
    return data;
  },

  /**
   * PATCH /api/admin/seller-applications/:id/reject
   * Reject an application with an optional admin note — admin only.
   * payload: { adminNote }
   */
  rejectApplication: async (id, adminNote = "") => {
    const { data } = await api.patch(
      `/api/admin/seller-applications/${id}/reject`,
      { adminNote }
    );
    return data;
  },
};
