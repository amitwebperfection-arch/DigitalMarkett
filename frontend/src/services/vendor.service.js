import api from './api';

export const vendorService = {
  // Apply to become a vendor
  applyForVendor: async (vendorData) => {
    const { data } = await api.post('/vendor/apply', vendorData);
    return data;
  },

  // Get vendor dashboard data
  getDashboard: async () => {
    const { data } = await api.get('/vendor/dashboard');
    return data;
  },

  // Get vendor earnings
  getEarnings: async (params = {}) => {
    const { data } = await api.get('/vendor/earnings', { params });
    return data;
  },

  // Get vendor reviews
  getReviews: async (params = {}) => {
    const { data } = await api.get('/vendor/reviews', { params });
    return data;
  },

  // Get vendor payouts
  getPayouts: async (params = {}) => {
    const { data } = await api.get('/payouts/my', { params });
    return data;
  },

  // Request payout
  requestPayout: async ({ amount, method, accountDetails }) => {
    const { data } = await api.post('/payouts/request', {
      amount,
      method,
      accountDetails
    });
    return data;
  },

  // Approve vendor (admin)
  approveVendor: async (id) => {
    const { data } = await api.put(`/vendor/approve/${id}`);
    return data;
  },

  // Reject vendor (admin)
  rejectVendor: async (id) => {
    const { data } = await api.put(`/vendor/reject/${id}`);
    return data;
  },

  // Get vendor orders
  getOrders: async (params = {}) => {
    const { data } = await api.get('/orders/vendor', { params });
    return data;
  },

  // Update bank details
  updateBankDetails: async (bankData) => {
    const response = await api.put('/vendor/bank-details', bankData);
    return response.data;
  },

  // Get vendor stats
  getStats: async () => {
    const { data } = await api.get('/vendor/stats');
    return data;
  },

  // Get vendor products
  getProducts: async (params = {}) => {
    const { data } = await api.get('/vendor/products', { params });
    return data;
  }
};