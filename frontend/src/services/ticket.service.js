import api from './api';

export const ticketService = {
  // User
  createTicket: async (ticketData) => {
    const { data } = await api.post('/tickets', ticketData);
    return data;
  },

  getMyTickets: async (page = 1, limit = 10) => {
    const { data } = await api.get(`/tickets/my?page=${page}&limit=${limit}`);
    return data;
  },

  getTicketById: async (id) => {
    const { data } = await api.get(`/tickets/${id}`);
    return data;
  },

  replyToTicket: async (id, message) => {
    const { data } = await api.post(`/tickets/${id}/reply`, { message });
    return data;
  },

  // Admin
  getAllTickets: async (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams({ page, limit, ...filters }).toString();
    const { data } = await api.get(`/tickets?${params}`);
    return data;
  },

  updateTicketStatus: async (id, status) => {
    const { data } = await api.put(`/tickets/${id}/status`, { status });
    return data;
  },

  // Vendor (same as getMyTickets)
  getVendorTickets: async (page = 1, limit = 10) => {
    const { data } = await api.get(`/tickets/my?page=${page}&limit=${limit}`);
    return data;
  },

  // Alias for admin reply
  replyTicket: async (id, message) => {
    const { data } = await api.post(`/tickets/${id}/reply`, { message });
    return data;
  }
};