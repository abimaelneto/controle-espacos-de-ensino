import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface User {
  id: string;
  email: string;
  role: string;
}

class AuthService {
  async login(credentials: LoginDto): Promise<AuthResponse> {
    const response = await authApi.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  }

  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await authApi.post<AuthResponse>('/auth/register', data);
    return response.data;
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getStoredRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  storeAuthData(authResponse: AuthResponse): void {
    localStorage.setItem('auth_token', authResponse.accessToken);
    localStorage.setItem('refresh_token', authResponse.refreshToken);
    localStorage.setItem('user', JSON.stringify(authResponse.user));
  }

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }
}

export const authService = new AuthService();

