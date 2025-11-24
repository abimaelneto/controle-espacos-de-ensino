import axios from 'axios';

const ROOMS_API_URL = import.meta.env.VITE_ROOMS_API_URL || 'http://localhost:3002/api/v1';

const roomsApi = axios.create({
  baseURL: ROOMS_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT
roomsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Room {
  id: string;
  roomNumber: string;
  type: string;
  capacity: number;
  hasEquipment: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomDto {
  roomNumber: string;
  type: string;
  capacity: number;
  hasEquipment: boolean;
}

export interface UpdateRoomDto {
  type?: string;
  capacity?: number;
  hasEquipment?: boolean;
}

export const roomsService = {
  async getAll(): Promise<Room[]> {
    const response = await roomsApi.get('/rooms');
    return response.data;
  },

  async getById(id: string): Promise<Room> {
    const response = await roomsApi.get(`/rooms/${id}`);
    return response.data;
  },

  async create(data: CreateRoomDto): Promise<Room> {
    const response = await roomsApi.post('/rooms', data);
    return response.data;
  },

  async update(id: string, data: UpdateRoomDto): Promise<Room> {
    const response = await roomsApi.put(`/rooms/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await roomsApi.delete(`/rooms/${id}`);
  },
};

