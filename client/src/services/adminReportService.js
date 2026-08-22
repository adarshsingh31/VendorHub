import api from "./axiosInstance";

const BASE = "/api/admin/reports";

export const adminReportService = {
  getOverview: async (params) => {
    const { data } = await api.get(`${BASE}/overview`, { params });
    return data;
  },

  getRevenue: async (params) => {
    const { data } = await api.get(`${BASE}/revenue`, { params });
    return data;
  },

  getOrders: async (params) => {
    const { data } = await api.get(`${BASE}/orders`, { params });
    return data;
  },

  getSellers: async (params) => {
    const { data } = await api.get(`${BASE}/sellers`, { params });
    return data;
  },

  getProducts: async (params) => {
    const { data } = await api.get(`${BASE}/products`, { params });
    return data;
  },

  getCategories: async (params) => {
    const { data } = await api.get(`${BASE}/categories`, { params });
    return data;
  },

  getCustomers: async (params) => {
    const { data } = await api.get(`${BASE}/customers`, { params });
    return data;
  },

  getPayments: async (params) => {
    const { data } = await api.get(`${BASE}/payments`, { params });
    return data;
  },

  getRefunds: async (params) => {
    const { data } = await api.get(`${BASE}/refunds`, { params });
    return data;
  },

  getReviews: async (params) => {
    const { data } = await api.get(`${BASE}/reviews`, { params });
    return data;
  },

  // Using fetch or window.open for blob/CSV download is usually better than axios
  // but we can use axios if we set responseType to blob
  exportReport: async (params) => {
    const { data } = await api.get(`${BASE}/export`, { 
      params,
      responseType: 'blob' 
    });
    return data;
  }
};
