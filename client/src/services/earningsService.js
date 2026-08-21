import axiosInstance from "./axiosInstance";

const API_URL = "/api/earnings";

export const getEarningsSummary = async () => {
  const response = await axiosInstance.get(`${API_URL}/seller/summary`);
  return response.data;
};

export const getEarningsTransactions = async (params = {}) => {
  const { search, status, period, page, limit } = params;
  const query = new URLSearchParams();
  if (search) query.append("search", search);
  if (status && status !== "all") query.append("status", status);
  if (period) query.append("period", period);
  if (page) query.append("page", page);
  if (limit) query.append("limit", limit);
  const response = await axiosInstance.get(`${API_URL}/seller/transactions?${query.toString()}`);
  return response.data;
};

export const getProductPerformance = async () => {
  const response = await axiosInstance.get(`${API_URL}/seller/product-performance`);
  return response.data;
};

export const getEarningsChart = async (period = "30d") => {
  const response = await axiosInstance.get(`${API_URL}/seller/chart?period=${period}`);
  return response.data;
};
