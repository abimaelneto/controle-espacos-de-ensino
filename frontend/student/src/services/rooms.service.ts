import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_ROOMS_API_URL || 'http://localhost:3002/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
});

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

