import axiosInstance from '../utils/axiosInstance';

const API_URL = '/workers';

/**
 * Obtiene una lista de trabajadores.
 * @param {boolean} [activo] - Filtra los trabajadores por su estado activo.
 * @param {string} [searchQuery] - Texto para buscar en los trabajadores.
 * @returns {Promise<Array>} La lista de trabajadores.
 */
export const getWorkers = (activo, searchQuery) => {
  return axiosInstance.get(API_URL, {
    params: { 
      activo,
      search: searchQuery
    },
  });
};

/**
 * Crea un nuevo trabajador.
 * @param {Object} workerData - Los datos del trabajador a crear.
 * @param {string} workerData.nombre - El nombre del trabajador.
 * @returns {Promise<Object>} El trabajador creado.
 */
export const createWorker = (workerData) => {
  return axiosInstance.post(API_URL, workerData);
};

/**
 * Actualiza un trabajador existente por su ID.
 * @param {string} id - El ID del trabajador a actualizar.
 * @param {Object} workerData - Los datos a actualizar.
 * @param {string} [workerData.nombre] - El nuevo nombre del trabajador.
 * @param {boolean} [workerData.activo] - El nuevo estado de actividad.
 * @returns {Promise<Object>} El trabajador actualizado.
 */
export const updateWorker = (id, workerData) => {
  return axiosInstance.patch(`${API_URL}/${id}`, workerData);
};

/**
 * Elimina un trabajador por su ID.
 * @param {string} id - El ID del trabajador a eliminar.
 * @returns {Promise<void>}
 */
export const deleteWorker = (id) => {
  return axiosInstance.delete(`${API_URL}/${id}`);
};
