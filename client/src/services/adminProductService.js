import api from "./axiosInstance";

export const adminProductService = {
  /**
   * GET /api/admin/products
   * Fetch all products with pagination, search, and advanced filters.
   */
  getProducts: async (params = {}) => {
    const { data } = await api.get("/api/admin/products", { params });
    return data;
  },

  /**
   * GET /api/admin/products/filters
   * Fetch distinct categories and sellers for the filter dropdowns.
   */
  getFilters: async () => {
    const { data } = await api.get("/api/admin/products/filters");
    return data;
  },

  /**
   * GET /api/admin/products/:id
   * Fetch detailed product info, stats, recent orders, and reviews.
   */
  getProductById: async (id) => {
    const { data } = await api.get(`/api/admin/products/${id}`);
    return data;
  },

  /**
   * PATCH /api/admin/products/:id/status
   * Update product status (active, inactive, blocked).
   */
  updateProductStatus: async (id, status) => {
    const { data } = await api.patch(`/api/admin/products/${id}/status`, { status });
    return data;
  },

  /**
   * DELETE /api/admin/products/:id
   * Delete a product permanently.
   */
  deleteProduct: async (id) => {
    const { data } = await api.delete(`/api/admin/products/${id}`);
    return data;
  },
};
