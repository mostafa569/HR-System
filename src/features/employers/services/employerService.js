import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

const getEmployers = async (
  page = 1,
  department = "",
  search = "",
  sort = "full_name",
  direction = "asc"
) => {
  const token = localStorage.getItem("userToken");
  if (!token) {
    throw new Error("No authentication token found");
  }
  try {
    const params = new URLSearchParams();
    params.append("page", page);

    if (search) {
      params.append("search", search);
      params.append("search_fields", "full_name,national_id,phone");
    }

    if (department) {
      params.append("department", department);
    }

    const validSortFields = [
      "full_name",
      "national_id",
      "phone",
      "salary",
      "department",
    ];
    if (validSortFields.includes(sort)) {
      params.append("sort_by", sort);
      params.append("sort_direction", direction);
    }

    const url = `${API_URL}/employers?${params.toString()}`;
    console.log("Making API request to:", url);

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    console.log("API Response:", response);
    return response.data;
  } catch (error) {
    console.error("Error in getEmployers:", error);
    if (error.response) {
      console.error("Error response:", error.response.data);
      console.error("Error status:", error.response.status);
    }
    throw error;
  }
};

const createEmployer = async (data) => {
  const token = localStorage.getItem("userToken");
  const response = await axios.post(`${API_URL}/employers`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const updateEmployer = async (id, data) => {
  const token = localStorage.getItem("userToken");
  const response = await axios.put(`${API_URL}/employers/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const deleteEmployer = async (id) => {
  const token = localStorage.getItem("userToken");
  const response = await axios.delete(`${API_URL}/employers/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const attendEmployer = async (id) => {
  const token = localStorage.getItem("userToken");
  const response = await axios.post(
    `${API_URL}/employers/${id}/attend`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

const leaveEmployer = async (id) => {
  const token = localStorage.getItem("userToken");
  const response = await axios.post(
    `${API_URL}/employers/${id}/leave`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

const getDepartments = async () => {
  const token = localStorage.getItem("userToken");
  const response = await axios.get(`${API_URL}/departments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const getEmployer = async (id) => {
  const token = localStorage.getItem("userToken");
  if (!token) {
    throw new Error("No authentication token found");
  }
  try {
    console.log("Fetching employer with ID:", id);
    const response = await axios.get(`${API_URL}/employers/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Employer API Response:", response);
    return response.data;
  } catch (error) {
    console.error("Error in getEmployer:", error);
    if (error.response) {
      console.error("Error response:", error.response.data);
      console.error("Error status:", error.response.status);
    }
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
