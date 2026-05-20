import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5243/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000
});

// Интерсептор для добавления токена
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;