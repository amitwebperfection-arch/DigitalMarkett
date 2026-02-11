import axios from 'axios';

// Axios instance for backend API
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // backend base URL
  withCredentials: true, // send cookies if your backend requires auth
});

// Submit contact form (public)
export const submitContactForm = async (formData) => {
  const { data } = await api.post('/contact', formData);
  return data; // returns { success, message }
};

// Fetch all contact messages for admin
export const getAllMessagesAdmin = async () => {
  const { data } = await api.get('/contact/admin/contact');
  return data; // returns { success, messages }
};
