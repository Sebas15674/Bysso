import axiosInstance from '../utils/axiosInstance';

/**
 * Obtiene todas las bolsas, opcionalmente filtradas por estado.
 * @param {object} [params] - Parámetros de consulta opcionales.
 * @param {string} [params.status] - El estado de las bolsas a filtrar ('DISPONIBLE' o 'OCUPADA').
 * @returns {Promise<Array>} Lista de bolsas.
 */
export const getBags = async (params = {}) => {
    const response = await axiosInstance.get('/bags', { params });
    return response.data;
};

/**
 * Crea una nueva bolsa.
 * @param {string} id - El identificador único para la nueva bolsa.
 * @returns {Promise<Object>} La bolsa creada.
 */
export const createBag = async (id) => {
    const response = await axiosInstance.post('/bags', { id });
    return response.data;
};

/**
 * Elimina una bolsa por su ID.
 * @param {string} id - ID de la bolsa a eliminar.
 * @returns {Promise<Object>} El resultado de la operación de eliminación.
 */
export const deleteBag = async (id) => {
    const response = await axiosInstance.delete(`/bags/${id}`);
    return response.data;
};
