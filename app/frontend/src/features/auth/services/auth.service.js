import api from '../../../services/api';

export const authService = {
  async register({ name, email, phone, password }) {
    const response = await api.post('/auth/register', { name, email, phone, password });
    return response.data;
  },

  async login({ email, password }) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  }
};
