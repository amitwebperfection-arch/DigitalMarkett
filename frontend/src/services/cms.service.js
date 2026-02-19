import api from './api';

export const cmsService = {
  getAllPages: () => api.get('/pages'),
  getPageById: (id) => api.get(`/pages/${id}`),           // ← /admin/ hatao
  getPageBySlug: (slug) => api.get(`/pages/slug/${slug}`), // ← /slug/ add karo
  createPage: (data) => api.post('/pages', data),
  updatePage: (id, data) => api.put(`/pages/${id}`, data),
  deletePage: (id) => api.delete(`/pages/${id}`),
};