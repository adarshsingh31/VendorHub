import api from "./axiosInstance";

export const adminDashboardService = {
  /**
   * GET /api/admin/dashboard
   * Fetches all dynamic data required for the admin dashboard.
   */
  getDashboardData: async () => {
    const { data } = await api.get("/api/admin/dashboard");
    return data;
  },
};
