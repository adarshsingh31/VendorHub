import axiosInstance from "./axiosInstance";

export const getStoreSettings = async () => {
  const response = await axiosInstance.get("/api/seller/store-settings");
  return response.data;
};

export const updateStoreSettings = async (formData) => {
  // formData is a FormData object to support image uploads
  const response = await axiosInstance.patch("/api/seller/store-settings", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
