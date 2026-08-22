import api from "./axiosInstance";

export const adminUserService = {
  /**
   * GET /api/admin/users
   * Fetch all users (buyers) with pagination, search, and filters.
   */
  getUsers: async (params = {}) => {
    const { data } = await api.get("/api/admin/users", { params });
    return data;
  },

  /**
   * GET /api/admin/users/:id
   * Fetch single user details including order stats and history.
   */
  getUserById: async (id) => {
    const { data } = await api.get(`/api/admin/users/${id}`);
    return data;
  },

  /**
   * PATCH /api/admin/users/:id/status
   * Update user status (active/suspended)
   */
  updateUserStatus: async (id, status) => {
    const { data } = await api.patch(`/api/admin/users/${id}/status`, { status });
    return data;
  },

  /**
   * DELETE /api/admin/users/:id
   * Hard delete a user completely.
   */
  deleteUser: async (id) => {
    const { data } = await api.delete(`/api/admin/users/${id}`);
    return data;
  },
};
