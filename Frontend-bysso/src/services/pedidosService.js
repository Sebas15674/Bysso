import axios from 'axios';
import axiosInstance from '../utils/axiosInstance'; // Import the axios instance

// ======================================================================
// PEDIDOS - CRUD y Estados
// ======================================================================

/**
 * Crea un nuevo pedido.
 * @param {FormData} formData - Objeto FormData que contiene 'data' (JSON string) y 'imagen' (File).
 * @returns {Promise<Object>} El pedido creado.
 */
export const createPedido = async (formData) => {
    const response = await axiosInstance.post('/pedidos', formData, {
        headers: {
            'Content-Type': 'multipart/form-data', // Axios handles this header automatically for FormData
        },
    });
    return response.data;
};

/**
 * Obtiene todos los pedidos.
 * @returns {Promise<Array>} Lista de todos los pedidos.
 */
export const getAllPedidos = async () => {
    const response = await axiosInstance.get('/pedidos');
    return response.data;
};

/**
 * Obtiene un pedido por su ID.
 * @param {string} id - ID del pedido.
 * @returns {Promise<Object>} El pedido.
 */
export const getPedidoById = async (id) => {
    const response = await axiosInstance.get(`/pedidos/${id}`);
    return response.data;
};

/**
 * Obtiene pedidos por estado (ej. 'PENDIENTE').
 * @param {string} estado - El estado de los pedidos a filtrar.
 * @returns {Promise<Array>} Lista de pedidos con el estado especificado.
 */
export const getPedidosByEstado = async (estado, search, page, limit) => {
    // Si estado es un array, lo convierte en un string separado por comas.
    const estadoParam = Array.isArray(estado) ? estado.join(',') : estado;
    
    const params = { 
        estado: estadoParam,
        page, 
        limit 
    };

    if (search) {
        params.search = search;
    }

    const response = await axiosInstance.get('/pedidos', {
        params: params,
    });
    return response.data;
};

/**
 * Actualiza un pedido existente.
 * @param {string} id - ID del pedido a actualizar.
 * @param {FormData} formData - Objeto FormData que contiene los datos actualizados.
 * @returns {Promise<Object>} El pedido actualizado.
 */
export const updatePedido = async (id, formData) => {
    const response = await axiosInstance.patch(`/pedidos/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Actualiza el estado de un pedido a 'en-produccion'.
 * @param {string} id - ID del pedido.
 * @returns {Promise<Object>} El pedido actualizado.
 */
export const updatePedidoToEnProduccion = async (id) => {
    const response = await axiosInstance.patch(`/pedidos/${id}/estado/en-produccion`);
    return response.data;
};

/**
 * Actualiza el estado de un pedido a 'en-proceso'.
 * @param {string} id - ID del pedido.
 * @returns {Promise<Object>} El pedido actualizado.
 */
export const updatePedidoToEnProceso = async (id) => {
    const response = await axiosInstance.patch(`/pedidos/${id}/estado/en-proceso`);
    return response.data;
};

/**
 * Actualiza el estado de un pedido a 'listo-entrega'.
 * @param {string} id - ID del pedido.
 * @returns {Promise<Object>} El pedido actualizado.
 */
export const updatePedidoToListoParaEntrega = async (id) => {
    const response = await axiosInstance.patch(`/pedidos/${id}/estado/listo-entrega`);
    return response.data;
};

/**
 * Actualiza el estado de un pedido a 'entregado'.
 * @param {string} id - ID del pedido.
 * @returns {Promise<Object>} El pedido actualizado.
 */
export const updatePedidoToEntregado = async (id) => {
    const response = await axiosInstance.patch(`/pedidos/${id}/estado/entregado`);
    return response.data;
};

/**
 * Actualiza el estado de un pedido a 'cancelado'.
 * @param {string} id - ID del pedido.
 * @returns {Promise<Object>} El pedido actualizado.
 */
export const updatePedidoToCancelado = async (id) => {
    const response = await axiosInstance.patch(`/pedidos/${id}/estado/cancelado`);
    return response.data;
};

/**
 * Cancela múltiples pedidos basado en una lista de IDs de bolsas.
 * @param {string[]} bagIds - Array de IDs de bolsas a cancelar.
 * @returns {Promise<Object>} Resultado de la operación.
 */
export const cancelMultiplePedidos = async (bagIds) => {
    const response = await axiosInstance.patch('/pedidos/cancelar', { bagIds });
    return response.data;
};

/**
 * Elimina múltiples pedidos basado en una lista de IDs de pedidos.
 * @param {string[]} orderIds - Array de IDs de pedidos a eliminar.
 * @returns {Promise<Object>} Resultado de la operación.
 */
export const deleteMultiplePedidos = async (orderIds) => {
    const response = await axiosInstance.delete('/pedidos/delete-multiple', {
        data: { orderIds }, // For DELETE requests, data is passed like this
    });
    return response.data;
};



// ======================================================================
// CLIENTES
// ======================================================================

/**
 * Obtiene un cliente por su número de cédula.
 * @param {string} cedula - Número de cédula del cliente.
 * @returns {Promise<Object|null>} El cliente o null si no se encuentra.
 */
export const getClienteByCedula = async (cedula) => {
    try {
        const response = await axiosInstance.get(`/clientes/cedula/${cedula}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
            return null; // Devuelve null si el cliente no se encuentra
        }
        throw error; // Relanza otros errores
    }
};

// ======================================================================
// TRABAJADORES
// ======================================================================

/**
 * Obtiene todos los trabajadores activos.
 * @returns {Promise<Array>} Lista de trabajadores activos.
 */
export const getActiveWorkers = async () => {
    const response = await axiosInstance.get('/workers', {
        params: { activo: true },
    });
    return response.data;
};