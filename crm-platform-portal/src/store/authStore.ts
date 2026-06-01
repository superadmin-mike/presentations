import { create } from 'zustand';
import type { AuthStore } from '../types';
import { authAPI } from '../utils/api';

export const useAuthStore = create<AuthStore>((set) => ({
  user: (() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  })(),
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login(email, password);
      const { data, token } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(data));

      set({
        user: data,
        token,
        isLoading: false,
      });
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed';
      set({
        error: message,
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      user: null,
      token: null,
      error: null,
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));
