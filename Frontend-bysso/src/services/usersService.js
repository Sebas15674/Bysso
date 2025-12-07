// src/services/usersService.js
import axiosInstance from '../utils/axiosInstance';

/**
 * Obtiene una lista de todos los usuarios.
 * @returns {Promise<Array>}
 */
export const getUsers = async () => {
  try {
    const response = await axiosInstance.get('/users');
    return response.data;
  } catch (error) {
    console.error("Error al obtener los usuarios:", error);
    throw error.response?.data || { message: 'Error al cargar los usuarios' };
  }
};

/**
 * Crea un nuevo usuario.
 * @param {object} userData - Datos del usuario a crear (email, password, role).
 * @returns {Promise<object>}
 */
export const createUser = async (userData) => {
  try {
    const response = await axiosInstance.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error("Error al crear el usuario:", error);
    throw error.response?.data || { message: 'Error al crear el usuario' };
  }
};

/**
 * Actualiza un usuario existente.
 * @param {string} id - El ID del usuario a actualizar.
 * @param {object} userData - Los datos a actualizar.
 * @returns {Promise<object>}
 */
export const updateUser = async (id, userData) => {
  try {
    const response = await axiosInstance.patch(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar el usuario con ID ${id}:`, error);
    throw error.response?.data || { message: 'Error al actualizar el usuario' };
  }
};

/**
 * Elimina un usuario.
 * @param {string} id - El ID del usuario a eliminar.
 * @returns {Promise<void>}
 */
export const deleteUser = async (id) => {
  try {
    await axiosInstance.delete(`/users/${id}`);
  } catch (error) {
    console.error(`Error al eliminar el usuario con ID ${id}:`, error);
    throw error.response?.data || { message: 'Error al eliminar el usuario' };
  }
};
