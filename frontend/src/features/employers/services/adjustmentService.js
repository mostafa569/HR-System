import api from "../../auth/services/api";

const getAdjustments = async (employerId) => {
  try {
    const response = await api.get(`/employers/${employerId}/adjustments`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching adjustments:", error);
    throw error;
  }
};

const createAdjustment = async (adjustmentData) => {
  try {
    const response = await api.post("/adjustments", adjustmentData);
    return response.data;
  } catch (error) {
    console.error("Error creating adjustment:", error);
    throw error;
  }
};

// Update an existing adjustment
const updateAdjustment = async (id, adjustmentData) => {
  try {
    const response = await api.put(`/adjustments/${id}`, adjustmentData);
    return response.data;
  } catch (error) {
    console.error("Error updating adjustment:", error);
    throw error;
  }
};

const deleteAdjustment = async (id) => {
  try {
    const response = await api.delete(`/adjustments/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting adjustment:", error);
    throw error;
  }
};

export { getAdjustments, createAdjustment, updateAdjustment, deleteAdjustment };
