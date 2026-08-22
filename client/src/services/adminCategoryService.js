import api from "./axiosInstance";

const BASE = "/api/admin/categories";
const PUBLIC_BASE = "/api/categories";

export const adminCategoryService = {
  /** GET /api/categories/public — no auth (for seller + buyer) */
  getPublicCategories: async () => {
    const { data } = await api.get(`${PUBLIC_BASE}/public`);
    return data;
  },

  /** GET /api/admin/categories — admin paginated list */
  getCategories: async (params = {}) => {
    const { data } = await api.get(BASE, { params });
    return data;
  },

  /** GET /api/admin/categories/:id — admin detail */
  getCategoryById: async (id) => {
    const { data } = await api.get(`${BASE}/${id}`);
    return data;
  },

  /** POST /api/admin/categories — create (multipart/form-data for image) */
  createCategory: async (formData) => {
    const { data } = await api.post(BASE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  /** PATCH /api/admin/categories/:id — update */
  updateCategory: async (id, formData) => {
    const { data } = await api.patch(`${BASE}/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  /** PATCH /api/admin/categories/:id/status */
  updateCategoryStatus: async (id, status) => {
    const { data } = await api.patch(`${BASE}/${id}/status`, { status });
    return data;
  },

  /** DELETE /api/admin/categories/:id */
  deleteCategory: async (id) => {
    const { data } = await api.delete(`${BASE}/${id}`);
    return data;
  },

  /** PATCH /api/admin/categories/:id/move-products */
  moveProducts: async (id, targetCategoryId) => {
    const { data } = await api.patch(`${BASE}/${id}/move-products`, { targetCategoryId });
    return data;
  },
};
