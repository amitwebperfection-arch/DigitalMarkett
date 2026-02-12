import api from './api';

export const productService = {
  // ✅ Get all PUBLIC products (for home page, shop page)
  getProducts: async (params = {}) => {
    const { data } = await api.get('/products', { params });
    return data;
  },
  getAdminProducts: async (params = {}) => {
    const { data } = await api.get('/admin/products', { params });
    return data;
  },

  // ✅ ADD THIS: Get VENDOR's own products (for vendor dashboard)
  getVendorProducts: async (params = {}) => {
    const { data } = await api.get('/products/vendor/products', { params });
    return data;
  },

  getVendorProduct: async (id) => {
    const { data } = await api.get(`/products/vendor/${id}`);
    return data;
  },

  getProductBySlug: async (slug) => {
    const { data } = await api.get(`/products/${slug}`);
    return data;
  },

  createProduct: async (formData) => {
    
  
    
    const { data } = await api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return data;
  },

  updateProduct: async (id, productData) => {
    
    
    
    const { data } = await api.put(`/products/${id}`, productData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return data;
  },

  deleteProduct: async (id) => {
    const { data } = await api.delete(`/products/${id}`);
    return data;
  },

  approveProduct: async (id) => {
    const { data } = await api.put(`/products/${id}/approve`);
    return data;
  },

  rejectProduct: async (id) => {
    const { data } = await api.put(`/products/${id}/reject`);
    return data;
  },

  // ================= REVIEWS =================
  getProductReviews: async (productId, page = 1, limit = 10) => {
    const { data } = await api.get(
      `/reviews/${productId}?page=${page}&limit=${limit}`
    );
    return data;
  },

  addReview: async (reviewData) => {
    const { data } = await api.post(`/reviews`, reviewData);
    return data;
  },

  deleteReview: async (reviewId) => {
    const { data } = await api.delete(`/reviews/${reviewId}`);
    return data;
  },
  
  getRelatedProducts: async (category) => {
    const { data } = await api.get(
      `/products/related`,
      { params: { category } }
    );
    return data;
  },

  togglePublish: async (id) => {
    const { data } = await api.patch(`/products/${id}/toggle-published`);
    return data;
  },
};