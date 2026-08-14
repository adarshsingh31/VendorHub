/**
 * addressService.js — API service for address management
 * Handles all address CRUD operations via the backend API
 */

import api from "./axiosInstance";

/**
 * Get all addresses for the current user
 */
export const getAddresses = async () => {
  const response = await api.get("/api/users/addresses");
  return response.data.data;
};

/**
 * Get the default address for the current user
 */
export const getDefaultAddress = async () => {
  const response = await api.get("/api/users/addresses/default");
  return response.data.data;
};

/**
 * Add a new address
 * @param {Object} addressData - The address data to add
 */
export const addAddress = async (addressData) => {
  const response = await api.post("/api/users/addresses", addressData);
  return response.data.data;
};

/**
 * Update an existing address
 * @param {String} addressId - The address ID
 * @param {Object} addressData - The updated address data
 */
export const updateAddress = async (addressId, addressData) => {
  const response = await api.put(
    `/api/users/addresses/${addressId}`,
    addressData,
  );
  return response.data.data;
};

/**
 * Delete an address
 * @param {String} addressId - The address ID to delete
 */
export const deleteAddress = async (addressId) => {
  await api.delete(`/api/users/addresses/${addressId}`);
};

/**
 * Set an address as the default address
 * @param {String} addressId - The address ID to set as default
 */
export const setDefaultAddress = async (addressId) => {
  const response = await api.put(`/api/users/addresses/${addressId}/default`);
  return response.data.data;
};
