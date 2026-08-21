import axiosInstance from "./axiosInstance";

export const getSellerReviews = async (params) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });
  
  const response = await axiosInstance.get(`/api/reviews/seller?${query.toString()}`);
  return response.data;
};

export const submitReview = async (data) => {
  const response = await axiosInstance.post(`/api/reviews`, data);
  return response.data;
};

export const getProductReviews = async (productId, page = 1, limit = 10) => {
  const response = await axiosInstance.get(`/api/reviews/product/${productId}?page=${page}&limit=${limit}`);
  return response.data;
};
