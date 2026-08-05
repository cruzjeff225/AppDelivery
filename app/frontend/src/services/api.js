import axios from 'axios';

/**
 * Cliente HTTP centralizado con Axios
 * Configurado con la URL base del backend Express
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de peticiones: agrega el token JWT (o un user-id de prueba)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Fallback para desarrollo mientras el módulo de Auth se conecta
      config.headers['x-user-id'] = localStorage.getItem('userId') || '1';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
