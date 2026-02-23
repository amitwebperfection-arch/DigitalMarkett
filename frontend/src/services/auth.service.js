import api from './api';

export const authService = {
  register: async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    return data;
  },

  verifyOTP: async (email, otp) => {
    const { data } = await api.post('/auth/verify-otp', { email, otp });
    return data;
  },

  resendOTP: async (email) => {
    const { data } = await api.post('/auth/resend-otp', { email });
    return data;
  },

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  googleAuth: async (credential) => {
    const { data } = await api.post('/auth/google', { credential });
    return data;
  },

  logout: async () => {
    const { data } = await api.post('/auth/logout');
    return data;
  },

  refreshToken: async () => {
    const { data } = await api.post('/auth/refresh');
    return data;
  },

  forgotPassword: async (email) => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },

  resetPassword: async (token, password) => {
    const { data } = await api.post(`/auth/reset-password/${token}`, { password });
    return data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  changePassword: async (data) => {
    const response = await api.post('/auth/change-password', data);
    return response.data;
  },

  getProfile: async () => {
    const { data } = await api.get('/users/me');
    return data;
  }
};