import axios from "axios";

import api from '../services/api'; 
export const loginUser = async (data) => {
  // const res = await axios.post("/api/hr/login", data);
  
  const res = await api.post("/hr/login", data);
  return res.data;
};