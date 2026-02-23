import api from './api';

export const wishlistService = {
  getWishlist: async () => {
    const { data } = await api.get('/wishlist');
    return data;
  },

  addToWishlist: async (productId) => {
    const { data } = await api.post('/wishlist', { productId });
    return data;
  },

  removeFromWishlist: async (productId) => {
    const { data } = await api.delete(`/wishlist/${productId}`);
    return data;
  },

  isInWishlist: async (productId) => {
    try {
      const { data } = await api.get('/wishlist');
      return data.wishlist.some(item => item.product?._id === productId);
    } catch (error) {
      return false;
    }
  }
};