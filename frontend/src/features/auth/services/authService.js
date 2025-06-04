import axios from 'axios';

export const loginUser = async (data) => {
  const res = await axios.post('http://127.0.0.1:8000/api/hr/login', data);
  return res.data;
};