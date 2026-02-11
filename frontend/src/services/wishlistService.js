// src/services/wishlist.service.js
import api from './api';

export const wishlistService = {
  // Get all wishlist items for logged-in user
  getWishlist: async () => {
    const { data } = await api.get('/wishlist');
    return data;
  },

  // Add product to wishlist (pass productId)
  addToWishlist: async (productId) => {
    const { data } = await api.post('/wishlist', { productId });
    return data;
  },

  // Remove product from wishlist
  removeFromWishlist: async (productId) => {
    const { data } = await api.delete(`/wishlist/${productId}`);
    return data;
  },

  // Check if product is in wishlist
  isInWishlist: async (productId) => {
    try {
      const { data } = await api.get('/wishlist');
      return data.wishlist.some(item => item.product?._id === productId);
    } catch (error) {
      return false;
    }
  }
};