import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_ROOMS_API_URL || 'http://localhost:3002/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para adicionar token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export interface Room {
  id: string;
  roomNumber: string;
  capacity: number;
  type: string;
  description: string;
  status: string;
}

export const roomsService = {
  async getRoom(roomId: string): Promise<Room> {
    const response = await api.get<Room>(`/rooms/${roomId}`);
    return response.data;
  },

  async getRooms(): Promise<Room[]> {
    const response = await api.get<Room[]>('/rooms');
    return response.data;
  },
};

