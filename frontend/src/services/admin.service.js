import api from './api';

export const adminService = {
 getDashboard: async () => {
  const { data } = await api.get('/admin/dashboard');
  return data.stats; // ✅ ONLY stats return karo
},

  getUsers: async (params = {}) => {
    const { data } = await api.get('/admin/users', { params });
    return data;
  },

  banUser: async (id) => {
    const { data } = await api.put(`/admin/users/${id}/ban`);
    return data;
  },

  unbanUser: async (id) => {
    const { data } = await api.put(`/admin/users/${id}/unban`);
    return data;
  },

  deleteUser: async (id) => {
    const { data } = await api.delete(`/admin/users/${id}`);
    return data;
  },

  // ✅ Vendors
  // getVendors: async (params = {}) => {
  //   const { data } = await api.get('/admin/vendors', { params });
  //   return data;
  // },

  // approveVendor: async (id) => {
  //   const { data } = await api.put(`/admin/vendors/${id}/approve`);
  //   return data;
  // },

  // suspendVendor: async (id) => {
  //   const { data } = await api.put(`/admin/vendors/${id}/suspend`);
  //   return data;
  // },

  
  // Vendors
  getVendors: async (params) => {
    const { data } = await api.get('/admin/vendors', { params });
    return data;
  },

  approveVendor: async (vendorId) => {
    const { data } = await api.put(`/admin/vendors/${vendorId}/approve`);
    return data;
  },

  rejectVendor: async (vendorId) => {
    const { data } = await api.put(`/admin/vendors/${vendorId}/reject`);
    return data;
  },

  suspendVendor: async (vendorId) => {
    const { data } = await api.put(`/admin/vendors/${vendorId}/suspend`);
    return data;
  },

  // ✅ Payouts
  // getPayouts: async (params = {}) => {
  //   const { data } = await api.get('/admin/payouts', { params });
  //   return data;
  // },
  getPayouts: ({ page, limit }) =>
  api.get('/payouts/all', {
    params: { page, limit }
  }).then(res => res.data),

processPayout: (id, body) =>
  api.put(`/payouts/${id}/process`, body).then(res => res.data),


  // processPayout: async (id) => {
  //   const { data } = await api.put(`/admin/payouts/${id}/process`);
  //   return data;
  // },

  // Settings
  getSettings: async () => {
    const { data } = await api.get('/admin/settings');
    return data;
  },

  updateSettings: async (settingsData) => {
    const { data } = await api.put('/admin/settings', settingsData);
    return data;
  },
  
   // Analytics & Charts
  getRevenueChart: async (period = '7days') => {
    const { data } = await api.get('/admin/analytics/revenue', { params: { period } });
    return data;
  },

  getCategoryChart: async () => {
    const { data } = await api.get('/admin/analytics/categories');
    return data;
  },

  getOrderStatusChart: async (period = '7days') => {
    const { data } = await api.get('/admin/analytics/order-status', { params: { period } });
    return data;
  },

  getTopProducts: async (limit = 5) => {
    const { data } = await api.get('/admin/analytics/top-products', { params: { limit } });
    return data;
  },

  getRecentActivity: async (limit = 5) => {
    const { data } = await api.get('/admin/activity/recent', { params: { limit } });
    return data;
  }
};