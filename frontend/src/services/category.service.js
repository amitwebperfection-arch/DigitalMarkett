import api from './api';

export const categoryService = {
  getCategories: async (params = {}) => {
    const { data } = await api.get('/categories', { params });
    return data;
  },

  getCategoryById: async (id) => {
    const { data } = await api.get(`/categories/${id}`);
    return data;
  },

  getCategoryBySlug: async (slug) => {
    const { data } = await api.get(`/categories/slug/${slug}`);
    return data;
  },

  createCategory: async (formData) => {
    for (let [key, value] of formData.entries()) {
    }
    const { data } = await api.post('/categories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return data;
  },

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

  deleteCategory: async (id) => {
    const { data } = await api.delete(`/categories/${id}`);
    return data;
  },

  bulkDeleteCategories: async (ids) => {
    const { data } = await api.post('/categories/bulk-delete', { ids });
    return data;
  },

  toggleCategoryPublished: async (id) => {
    const { data } = await api.patch(
      `/categories/${id}/toggle-published`
    );
    return data;
  },

  getCategoryTree: async () => {
    const { data } = await api.get('/categories/tree');
    return data;
  },

  getSubcategories: async (parentId) => {
    const { data } = await api.get(`/categories/${parentId}/subcategories`);
    return data;
  }
};
