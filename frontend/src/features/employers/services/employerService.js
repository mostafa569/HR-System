import api from "../../auth/services/api";

const getEmployers = async (
  page = 1,
  department = "",
  search = "",
  sortBy = "full_name",
  sortDirection = "asc"
) => {
  try {
    const response = await api.get("/employers", {
      params: {
        page,
        department_name: department,
        search,
        sort_by: sortBy,
        sort_direction: sortDirection,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching employers:", error);
    throw error;
  }
};

const createEmployer = async (employerData) => {
  try {
    const response = await api.post("/employers", employerData);
    return response.data;
  } catch (error) {
    console.error("Error creating employer:", error);
    throw error;
  }
};

const updateEmployer = async (id, employerData) => {
  try {
    const response = await api.put(`/employers/${id}`, employerData);
    return response.data;
  } catch (error) {
    console.error("Error updating employer:", error);
    throw error;
  }
};

const deleteEmployer = async (id) => {
  try {
    const response = await api.delete(`/employers/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting employer:", error);
    throw error;
  }
};

const attendEmployer = async (id, applyAdjustment) => {
  try {
    const response = await api.post(`/employers/${id}/attend`, {
      apply_adjustment: applyAdjustment,
    });
    return response.data;
  } catch (error) {
    console.error("Error marking attendance:", error);
    throw error;
  }
};

const leaveEmployer = async (id, applyAdjustment) => {
  try {
    const response = await api.post(`/employers/${id}/leave`, {
      apply_adjustment: applyAdjustment,
    });
    return response.data;
  } catch (error) {
    console.error("Error marking leave:", error);
    throw error;
  }
};

const getDepartments = async () => {
  try {
    const response = await api.get("/departments");
    return response.data;
  } catch (error) {
    console.error("Error fetching departments:", error);
    throw error;
  }
};

const getEmployer = async (id) => {
  try {
    const response = await api.get(`/employers/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching employer:", error);
    throw error;
  }
};

export {
  getEmployers,
  createEmployer,
  updateEmployer,
  deleteEmployer,
  attendEmployer,
  leaveEmployer,
  getDepartments,
  getEmployer,
};
