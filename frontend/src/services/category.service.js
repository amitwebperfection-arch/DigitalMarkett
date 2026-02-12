import api from './api';

export const categoryService = {
  // ================= CATEGORIES =================

  // Get all categories (filters supported)
  getCategories: async (params = {}) => {
    const { data } = await api.get('/categories', { params });
    return data;
  },

  // Get single category by ID
  getCategoryById: async (id) => {
    const { data } = await api.get(`/categories/${id}`);
    return data;
  },

  // Get category by slug (public)
  getCategoryBySlug: async (slug) => {
    const { data } = await api.get(`/categories/slug/${slug}`);
    return data;
  },

  // Create category
  createCategory: async (formData) => {

    // Debug FormData
    for (let [key, value] of formData.entries()) {
    }

    const { data } = await api.post('/categories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return data;
  },

  // Update category
  updateCategory: async (id, formData) => {

    for (let [key, value] of formData.entries()) {
    }

    const { data } = await api.put(`/categories/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return data;
  },

  // Delete single category
  deleteCategory: async (id) => {
    const { data } = await api.delete(`/categories/${id}`);
    return data;
  },

  // Bulk delete categories
  bulkDeleteCategories: async (ids) => {
    const { data } = await api.post('/categories/bulk-delete', { ids });
    return data;
  },

  // Toggle publish / unpublish
  toggleCategoryPublished: async (id) => {
    const { data } = await api.patch(
      `/categories/${id}/toggle-published`
    );
    return data;
  },
  // Get category tree
  getCategoryTree: async () => {
    const { data } = await api.get('/categories/tree');
    return data;
  },

  // Get subcategories
  getSubcategories: async (parentId) => {
    const { data } = await api.get(`/categories/${parentId}/subcategories`);
    return data;
  }
};
