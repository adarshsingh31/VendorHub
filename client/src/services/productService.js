import api from "./axiosInstance";

export const createProduct = async (formData) => {
  const response = await api.post("/api/products", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const updateProduct = async (id, formData) => {
  const response = await api.put(`/api/products/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getAllProducts = async (params = {}) => {
  const { search, category, minPrice, maxPrice, sort, page, limit } = params;
  let query = "?";
  if (search) query += `search=${encodeURIComponent(search)}&`;
  if (category) query += `category=${encodeURIComponent(category)}&`;
  if (minPrice) query += `minPrice=${minPrice}&`;
  if (maxPrice) query += `maxPrice=${maxPrice}&`;
  if (sort) query += `sort=${sort}&`;
  if (page) query += `page=${page}&`;
  if (limit) query += `limit=${limit}&`;
  
  const response = await api.get(`/api/products${query}`);
  return response.data;
};

export const getSellerProducts = async () => {
  const response = await api.get("/api/products/seller");
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/api/products/${id}`);
  return response.data;
};
