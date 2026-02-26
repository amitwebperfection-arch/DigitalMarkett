import api from "./api";

export const notificationService = {
  getNotifications: async (page = 1, limit = 15) => {
    const { data } = await api.get('/notifications', { params: { page, limit } });
    return data;
  },

  getUnreadCount: async () => {
    const { data } = await api.get('/notifications/unread-count');
    return data;
  },

  markAsRead: async (id) => {
    const { data } = await api.put(`/notifications/${id}/read`);
    return data;
  },

  markAllAsRead: async () => {
    const { data } = await api.put('/notifications/read-all');
    return data;
  },
};