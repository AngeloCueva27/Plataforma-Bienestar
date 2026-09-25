import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // Estandarizado a localhost para evitar choques CORS
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    // Buscará 'token' y, si no lo encuentra, buscará 'access_token'
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;