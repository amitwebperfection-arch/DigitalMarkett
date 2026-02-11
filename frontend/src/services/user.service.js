import api from './api';
import { wishlistService } from './wishlistService';

export const userService = {
  getProfile: async () => {
    const { data } = await api.get('/users/me');
    return data;
  },

  updateProfile: async (userData) => {
    const { data } = await api.put('/users/me', userData);
    return data;
  },

  getDashboard: async () => {
    const { data } = await api.get('/users/dashboard');
    return data;
  },

  getMyOrders: async (params = {}) => {
    const { data } = await api.get('/users/orders', { params });
    return data;
  },

  getMyDownloads: async () => {
    const { data } = await api.get('/users/downloads');
    return data;
  },
  downloadFile: async (licenseId) => {
    const response = await api.get(
      `/users/downloads/${licenseId}/file`,
      { responseType: 'blob' }
    );
    return response.data;
  },
    getWallet: async () => {
    const { data } = await api.get('/wallet');
    return data;
  },

  getWalletTransactions: async (params) => {
    const { data } = await api.get('/wallet/transactions', { params });
    return data;
  },

  addFunds: async ({ amount, description }) => {
    const { data } = await api.post('/wallet/add', {
      amount,
      description
    });
    return data;
  },
  createWalletOrder: async ({ amount }) => {
  const { data } = await api.post('/wallet/topup/init', { amount });
  return data;
},
  getWishlist: wishlistService.getWishlist,
  addToWishlist: wishlistService.addToWishlist,
  removeFromWishlist: wishlistService.removeFromWishlist
};
