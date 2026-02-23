import api from './api';

export const paymentService = {
  createPaymentIntent: async (orderId, method) => {
    const { data } = await api.post('/payments/create-intent', { orderId, method });
    return data;
  },

  verifyRazorpay: async (paymentData) => {
    const { data } = await api.post('/payments/verify-razorpay', paymentData);
    return data;
  }
};