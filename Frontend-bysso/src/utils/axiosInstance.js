import axios from 'axios';

// La clave donde se guarda el token en localStorage. Debe ser la misma que en authService.
const TOKEN_KEY = 'accessToken';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000', // Your backend base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configura el interceptor de peticiones directamente.
// Esto se ejecuta una sola vez cuando este módulo es importado.
axiosInstance.interceptors.request.use(
  (config) => {
    // Lee el token directamente del localStorage en cada petición.
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Ya no es necesario exportar una función de configuración.
export default axiosInstance;
