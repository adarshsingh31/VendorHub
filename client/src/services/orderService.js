import axiosInstance from "./axiosInstance";

const API_URL = "/api/orders"; // the proxy will prepend /api

/**
 * Fetch orders for the authenticated seller
 */
export const getSellerOrders = async (params = {}) => {
  const { status, search, page, limit } = params;
  let query = "?";
  if (status) query += `status=${status}&`;
  if (search) query += `search=${search}&`;
  if (page) query += `page=${page}&`;
  if (limit) query += `limit=${limit}&`;

  const response = await axiosInstance.get(`${API_URL}/seller${query}`);
  return response.data;
};

/**
 * Fetch details of a specific seller order
 */
export const getSellerOrderDetails = async (orderId) => {
  const response = await axiosInstance.get(`${API_URL}/seller/${orderId}`);
  return response.data;
};

/**
 * Update the status of a specific item in a seller order
 */
export const updateSellerItemStatus = async (orderId, itemId, status) => {
  const response = await axiosInstance.patch(`${API_URL}/seller/${orderId}/item/${itemId}/status`, {
    status
  });
  return response.data;
};

/**
 * Fetch product sales summary for the authenticated seller
 */
export const getProductSalesSummary = async () => {
  const response = await axiosInstance.get(`${API_URL}/seller/product-sales`);
  return response.data;
};

/**
 * Fetch detailed sales data for a specific product
 */
export const getProductSalesDetails = async (productId) => {
  const response = await axiosInstance.get(`${API_URL}/seller/product-sales/${productId}`);
  return response.data;
};

