import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5148/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 (unauthorized) globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (localStorage.getItem('token')) {
        toast.error("Votre session a expiré, veuillez vous reconnecter.");
      }
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on an auth page
      const authPaths = ['/login', '/ClientRegister', '/PrestataireRegister'];
      const currentPath = window.location.pathname;
      if (!authPaths.some(p => currentPath.startsWith(p)) && currentPath !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;