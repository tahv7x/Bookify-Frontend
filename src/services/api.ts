import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5148/api',
});

// Token is stored separately: localStorage.setItem("token", data.token)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;