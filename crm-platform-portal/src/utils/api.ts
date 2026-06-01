import axios from 'axios';
import type { AxiosInstance } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: { email: string; password: string; full_name: string; role?: string }) =>
    api.post('/auth/register', data),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  refreshToken: (token: string) =>
    api.post('/auth/refresh', { token }),
  getProfile: () =>
    api.get('/auth/profile'),
};

export const contactsAPI = {
  list: (params?: { limit?: number; status?: string; assigned_to?: string }) =>
    api.get('/contacts', { params }),
  getById: (id: string) =>
    api.get(`/contacts/${id}`),
  create: (data: any) =>
    api.post('/contacts', data),
  update: (id: string, data: any) =>
    api.put(`/contacts/${id}`, data),
  delete: (id: string) =>
    api.delete(`/contacts/${id}`),
  updateLeadScore: (id: string, scoreChange: number) =>
    api.put(`/contacts/${id}/lead-score`, { scoreChange }),
  exportPhones: () =>
    api.get('/contacts/export/phones'),
};

export const usersAPI = {
  list: (params?: { limit?: number; offset?: number }) =>
    api.get('/users', { params }),
  getById: (id: string) =>
    api.get(`/users/${id}`),
  create: (data: { email: string; password: string; fullName: string; role?: string }) =>
    api.post('/users', data),
  update: (id: string, data: { fullName?: string; role?: string; active?: boolean }) =>
    api.put(`/users/${id}`, data),
  delete: (id: string) =>
    api.delete(`/users/${id}`),
};

export default api;
