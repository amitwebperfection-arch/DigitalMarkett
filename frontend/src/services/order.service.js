import api from './api';

export const orderService = {
  createOrder: async (orderData) => {
    const { data } = await api.post('/orders/create', orderData);
    return data;
  },

  getMyOrders: async (params = {}) => {
    const { data } = await api.get('/orders/my', { params });
    return data;
  },

  getAdminOrders: async (params = {}) => {
    const { data } = await api.get('/orders/admin', { params });
    return data;
  }
};