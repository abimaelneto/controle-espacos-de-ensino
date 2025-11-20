import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
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
    const response = await api.get<Room>(`/v1/rooms/${roomId}`);
    return response.data;
  },

  async getRooms(): Promise<Room[]> {
    const response = await api.get<Room[]>('/v1/rooms');
    return response.data;
  },
};

