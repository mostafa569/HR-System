import axios from "axios";
import api from "./api";

export const loginUser = async (data) => {
  // const res = await axios.post("/api/hr/login", data);

  const res = await api.post("/hr/login", data);
  return res.data;
};

export const logoutUser = async () => {
  const res = await api.post("/hr/logout");
  return res.data;
};

export const authService = {
  apiCall: async (endpoint, options = {}) => {
    try {
      const config = {
        method: options.method || "GET",
        url: endpoint,
        ...options,
      };

      if (options.body) {
        config.data = JSON.parse(options.body);
      }

      const response = await api(config);
      return response.data;
    } catch (error) {
      console.error("API call error:", error);
      throw error;
    }
  },

  uploadFile: async (endpoint, formData) => {
    try {
      const response = await api.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("File upload error:", error);
      throw error;
    }
  },
};
