import { create } from 'zustand';
import { authService, type LoginDto, type RegisterDto, type User } from '../services/auth.service';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  initialize: () => {
    const storedUser = authService.getStoredUser();
    const isAuthenticated = authService.isAuthenticated();
    set({
      user: storedUser,
      isAuthenticated,
    });
  },

  login: async (credentials: LoginDto) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.login(credentials);
      authService.storeAuthData(response);
      set({
        user: response.user,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao fazer login';
      set({
        error: errorMessage,
        loading: false,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  register: async (data: RegisterDto) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.register(data);
      authService.storeAuthData(response);
      set({
        user: response.user,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao registrar';
      set({
        error: errorMessage,
        loading: false,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },
}));

