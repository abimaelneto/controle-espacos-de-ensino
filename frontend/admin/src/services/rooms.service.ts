import { api } from './api';

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
    const response = await api.get('/rooms');
    return response.data;
  },

  async getById(id: string): Promise<Room> {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  },

  async create(data: CreateRoomDto): Promise<Room> {
    const response = await api.post('/rooms', data);
    return response.data;
  },

  async update(id: string, data: UpdateRoomDto): Promise<Room> {
    const response = await api.put(`/rooms/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/rooms/${id}`);
  },
};

