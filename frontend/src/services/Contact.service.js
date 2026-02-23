import api from './api';

export const submitContactForm = async (formData) => {
  const { data } = await api.post('/contact', formData);
  return data;
};

export const getAllMessagesAdmin = async () => {
  const { data } = await api.get('/contact/admin/contact');
  return data;
};