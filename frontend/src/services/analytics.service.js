import api from './api';

export const analyticsService = {
  getAdminAnalytics: () => api.get('/analytics/admin'),
  getVendorAnalytics: () => api.get('/analytics/vendor'),
};
