import { create } from 'zustand';
import { roomsService, type Room, type CreateRoomDto, type UpdateRoomDto } from '../services/rooms.service';

interface RoomsState {
  rooms: Room[];
  loading: boolean;
  error: string | null;
  fetchRooms: () => Promise<void>;
  createRoom: (data: CreateRoomDto) => Promise<void>;
  updateRoom: (id: string, data: UpdateRoomDto) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;
}

export const useRoomsStore = create<RoomsState>((set) => ({
  rooms: [],
  loading: false,
  error: null,

  fetchRooms: async () => {
    set({ loading: true, error: null });
    try {
      const rooms = await roomsService.getAll();
      set({ rooms, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createRoom: async (data) => {
    set({ loading: true, error: null });
    try {
      const room = await roomsService.create(data);
      set((state) => ({
        rooms: [...state.rooms, room],
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateRoom: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updated = await roomsService.update(id, data);
      set((state) => ({
        rooms: state.rooms.map((r) => (r.id === id ? updated : r)),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteRoom: async (id) => {
    set({ loading: true, error: null });
    try {
      await roomsService.delete(id);
      set((state) => ({
        rooms: state.rooms.filter((r) => r.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
}));

