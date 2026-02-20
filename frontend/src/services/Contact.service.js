import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', 
  withCredentials: true, 
});

export const submitContactForm = async (formData) => {
  const { data } = await api.post('/contact', formData);
  return data; 
};

export const getAllMessagesAdmin = async () => {
  const { data } = await api.get('/contact/admin/contact');
  return data; 
};
