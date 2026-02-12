import axios from 'axios';

// URL do backend - prioridade: variável env > URL hardcoded > localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL 
  || 'https://web-production-1d256.up.railway.app/api'
  || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
export { api };
