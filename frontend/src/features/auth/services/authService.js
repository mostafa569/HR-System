import axios from "axios";

export const loginUser = async (data) => {
  const res = await axios.post("/api/hr/login", data);
  return res.data;
};
