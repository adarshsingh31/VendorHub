import axiosInstance from "./axiosInstance";

const API_URL = "/api/inventory";

/**
 * Fetch all inventory for the authenticated seller
 */
export const getSellerInventory = async () => {
  const response = await axiosInstance.get(`${API_URL}/seller`);
  return response.data;
};

/**
 * Update stock for a specific product
 */
export const updateProductStock = async (productId, data) => {
  const response = await axiosInstance.patch(`${API_URL}/seller/${productId}`, data);
  return response.data;
};

/**
 * Fetch inventory history for a specific product
 */
export const getProductInventoryHistory = async (productId) => {
  const response = await axiosInstance.get(`${API_URL}/seller/${productId}/history`);
  return response.data;
};
