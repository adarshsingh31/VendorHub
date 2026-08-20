import api from "./axiosInstance";

export const homeService = {
  getCategories: async () => {
    const { data } = await api.get("/api/home/categories");
    return data;
  },

  getNewArrivals: async () => {
    const { data } = await api.get("/api/home/new-arrivals");
    return data;
  },

  getTrending: async () => {
    const { data } = await api.get("/api/home/trending");
    return data;
  },

  getDeals: async () => {
    const { data } = await api.get("/api/home/deals");
    return data;
  },

  getRecommended: async () => {
    const { data } = await api.get("/api/home/recommended");
    return data;
  },

  getFeaturedSellers: async () => {
    const { data } = await api.get("/api/home/featured-sellers");
    return data;
  },

  getBanners: async () => {
    const { data } = await api.get("/api/home/banners");
    return data;
  },
};
