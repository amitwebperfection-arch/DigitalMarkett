import api from './api';

export const getCoupons = async (page = 1, limit = 10) => {
  const { data } = await api.get(`/coupons?page=${page}&limit=${limit}`);
  return data;
};

export const createCoupon = async (coupon) => {
  const { data } = await api.post('/coupons', coupon);
  return data;
};

export const deleteCoupon = async (id) => {
  const { data } = await api.delete(`/coupons/${id}`);
  return data;
};

export const applyCoupon = async (code, cartTotal, productIds) => {
  const { data } = await api.post('/coupons/apply', { code, cartTotal, productIds });
  return data;
};
