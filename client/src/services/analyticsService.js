import axiosInstance from "./axiosInstance";

const BASE = "/api/analytics";

const qs = (params) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v !== undefined && v !== null && q.append(k, v));
  return q.toString();
};

export const getAnalyticsOverview    = (period) => axiosInstance.get(`${BASE}/seller/overview?${qs({ period })}`).then(r => r.data);
export const getSalesChart           = (period) => axiosInstance.get(`${BASE}/seller/sales-chart?${qs({ period })}`).then(r => r.data);
export const getOrderAnalytics       = (period) => axiosInstance.get(`${BASE}/seller/orders?${qs({ period })}`).then(r => r.data);
export const getProductAnalytics     = (period) => axiosInstance.get(`${BASE}/seller/products?${qs({ period })}`).then(r => r.data);
export const getCustomerAnalytics    = (period) => axiosInstance.get(`${BASE}/seller/customers?${qs({ period })}`).then(r => r.data);
export const getInventoryAnalytics   = ()       => axiosInstance.get(`${BASE}/seller/inventory`).then(r => r.data);
export const getRecentActivity       = ()       => axiosInstance.get(`${BASE}/seller/recent-activity`).then(r => r.data);
export const getCategorySales        = (period) => axiosInstance.get(`${BASE}/seller/category-sales?${qs({ period })}`).then(r => r.data);
export const getDashboardData        = ()       => axiosInstance.get(`${BASE}/seller/dashboard`).then(r => r.data);

