import api from "./axiosInstance";

export const getWishlist = async () => {
  const res = await api.get("/api/wishlist");
  return res.data;
};

export const toggleWishlist = async (productId) => {
  const res = await api.post(`/api/wishlist/${productId}`);
  return res.data;
};
