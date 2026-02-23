import api from './api';

export const vendorService = {
  applyForVendor: async (vendorData) => {
    const { data } = await api.post('/vendor/apply', vendorData);
    return data;
  },

  getDashboard: async () => {
    const { data } = await api.get('/vendor/dashboard');
    return data;
  },

  getEarnings: async (params = {}) => {
    const { data } = await api.get('/vendor/earnings', { params });
    return data;
  },

  getReviews: async (params = {}) => {
    const { data } = await api.get('/vendor/reviews', { params });
    return data;
  },

  getPayouts: async (params = {}) => {
    const { data } = await api.get('/payouts/my', { params });
    return data;
  },

  requestPayout: async ({ amount, method, accountDetails }) => {
    const { data } = await api.post('/payouts/request', {
      amount,
      method,
      accountDetails
    });
    return data;
  },

  approveVendor: async (id) => {
    const { data } = await api.put(`/vendor/approve/${id}`);
    return data;
  },

  rejectVendor: async (id) => {
    const { data } = await api.put(`/vendor/reject/${id}`);
    return data;
  },

  getOrders: async (params = {}) => {
    const { data } = await api.get('/orders/vendor', { params });
    return data;
  },

  updateBankDetails: async (bankData) => {
    const response = await api.put('/vendor/bank-details', bankData);
    return response.data;
  },

  getStats: async () => {
    const { data } = await api.get('/vendor/stats');
    return data;
  },

  getProducts: async (params = {}) => {
    const { data } = await api.get('/vendor/products', { params });
    return data;
  }
};