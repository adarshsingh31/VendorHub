import api from "./axiosInstance";

export const adminSellerService = {
  /**
   * GET /api/admin/sellers
   * Fetch all sellers (Active, Suspended, Pending, Rejected) with pagination, search, and filters.
   */
  getSellers: async (params = {}) => {
    const { data } = await api.get("/api/admin/sellers", { params });
    return data;
  },

  /**
   * GET /api/admin/sellers/:id
   * Fetch single seller details (Info, Store Profile, Business Stats, Recent items).
   */
  getSellerById: async (id) => {
    const { data } = await api.get(`/api/admin/sellers/${id}`);
    return data;
  },

  /**
   * PATCH /api/admin/sellers/:id/status
   * Update seller status (active/suspended).
   */
  updateSellerStatus: async (id, status) => {
    const { data } = await api.patch(`/api/admin/sellers/${id}/status`, { status });
    return data;
  },

  /**
   * DELETE /api/admin/sellers/:id
   * Hard delete a seller completely.
   */
  deleteSeller: async (id) => {
    const { data } = await api.delete(`/api/admin/sellers/${id}`);
    return data;
  },

  /**
   * PATCH /api/admin/seller-applications/:id/approve
   * Approve a pending seller application
   */
  approveApplication: async (id) => {
    const { data } = await api.patch(`/api/admin/seller-applications/${id}/approve`);
    return data;
  },

  /**
   * PATCH /api/admin/seller-applications/:id/reject
   * Reject a pending seller application
   */
  rejectApplication: async (id, adminNote = "") => {
    const { data } = await api.patch(`/api/admin/seller-applications/${id}/reject`, { adminNote });
    return data;
  },
};
