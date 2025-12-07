// Frontend-bysso/src/services/dashboardService.js
import axiosInstance from '../utils/axiosInstance';

export const getInFlowOrdersCount = async () => {
  try {
    const response = await axiosInstance.get('/dashboard/in-flow-orders-count');
    return response.data;
  } catch (error) {
    console.error('Error fetching in-flow orders count:', error);
    throw error;
  }
};

export const getDashboardStats = async () => {
  try {
    const response = await axiosInstance.get('/dashboard'); // Endpoint para obtener conteos por estado
    return response.data;
  } catch (error) {
    console.error('Error fetching order status counts:', error);
    throw error;
  }
};
