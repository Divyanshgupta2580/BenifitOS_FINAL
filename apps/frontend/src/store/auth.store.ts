import { create } from 'zustand';
import { storageService } from '../services/storage.service';
import { apiClient } from '../services/api-client';

export interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setAuth: (user: User, accessToken: string, refreshToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  loadAuthFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  setAuth: async (user, accessToken, refreshToken) => {
    await storageService.setItem('user', JSON.stringify(user));
    await storageService.setItem('accessToken', accessToken);
    if (refreshToken) {
      await storageService.setItem('refreshToken', refreshToken);
    }
    set({ user, accessToken, refreshToken: refreshToken || null, isAuthenticated: true, error: null });
  },

  logout: async () => {
    try {
      const refreshToken = await storageService.getItem('refreshToken');
      await apiClient.post('/auth/logout', refreshToken ? { refreshToken } : {});
    } catch {
      // Ignore logout network errors
    }
    await storageService.removeItem('user');
    await storageService.removeItem('accessToken');
    await storageService.removeItem('refreshToken');
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, error: null });
  },

  loadAuthFromStorage: async () => {
    set({ isLoading: true });
    try {
      const userStr = await storageService.getItem('user');
      const accessToken = await storageService.getItem('accessToken');
      const refreshToken = await storageService.getItem('refreshToken');

      if (userStr && accessToken) {
        const user = JSON.parse(userStr);
        set({ user, accessToken, refreshToken: refreshToken || null, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
