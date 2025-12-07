// src/services/authService.js
import axiosInstance from '../utils/axiosInstance';
import { jwtDecode } from 'jwt-decode'; // Necesitarás instalar jwt-decode: npm install jwt-decode

const TOKEN_KEY = 'accessToken';

/**
 * Inicia sesión llamando al endpoint /auth/login
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} El usuario decodificado del token
 */
export const login = async (email, password) => {
  try {
    const response = await axiosInstance.post('/auth/login', { email, password });
    const { access_token } = response.data;

    if (access_token) {
      localStorage.setItem(TOKEN_KEY, access_token);
      const user = jwtDecode(access_token);
      return user;
    }
    return null;
  } catch (error) {
    // Lanza el error para que el componente que llama pueda manejarlo
    throw error.response?.data || { message: 'Error de red o del servidor' };
  }
};

/**
 * Cierra la sesión eliminando el token de localStorage
 */
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Obtiene el token de acceso actual
 * @returns {string|null}
 */
export const getAccessToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Obtiene el usuario decodificado del token guardado
 * @returns {object|null}
 */
export const getCurrentUser = () => {
  const token = getAccessToken();
  if (token) {
    try {
      return jwtDecode(token);
    } catch (error) {
      // Si el token es inválido, lo eliminamos
      console.error('Token inválido:', error);
      logout();
      return null;
    }
  }
  return null;
};
