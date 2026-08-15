import api from "./axiosInstance";

export const getCart = async () => {
  const res = await api.get("/api/cart");
  return res.data;
};

export const addToCart = async (productId, quantity = 1) => {
  const res = await api.post("/api/cart", { productId, quantity });
  return res.data;
};

export const updateCartItem = async (productId, quantity) => {
  const res = await api.put(`/api/cart/${productId}`, { quantity });
  return res.data;
};

export const removeFromCart = async (productId) => {
  const res = await api.delete(`/api/cart/${productId}`);
  return res.data;
};
