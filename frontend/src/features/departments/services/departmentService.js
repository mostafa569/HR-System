import axios from 'axios';

const API_URL = 'http://localhost:8000/api/departments'; 

const getAllDepartments = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

const createDepartment = async (departmentData) => {
  const response = await axios.post(API_URL, departmentData);
  return response.data;
};

const getDepartmentById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

const updateDepartment = async (id, departmentData) => {
  const response = await axios.put(`${API_URL}/${id}`, departmentData);
  return response.data;
};

const deleteDepartment = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

const departmentService = {
  getAllDepartments,
  createDepartment,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};

export default departmentService;