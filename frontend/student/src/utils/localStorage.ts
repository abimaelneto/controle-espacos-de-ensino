/**
 * Utilitários para gerenciar últimas salas usadas no localStorage
 */

const RECENT_ROOMS_KEY = 'student_recent_rooms';
const MAX_RECENT_ROOMS = 5;

export interface RecentRoom {
  roomId: string;
  roomNumber: string;
  lastUsed: string;
}

export const recentRoomsStorage = {
  /**
   * Adicionar sala às recentes
   */
  addRoom(roomId: string, roomNumber: string): void {
    try {
      const recent = this.getRecentRooms();
      
      // Remover se já existe
      const filtered = recent.filter(r => r.roomId !== roomId);
      
      // Adicionar no início
      const updated = [
        { roomId, roomNumber, lastUsed: new Date().toISOString() },
        ...filtered,
      ].slice(0, MAX_RECENT_ROOMS);
      
      localStorage.setItem(RECENT_ROOMS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Erro ao salvar sala recente:', error);
    }
  },

  /**
   * Obter salas recentes
   */
  getRecentRooms(): RecentRoom[] {
    try {
      const data = localStorage.getItem(RECENT_ROOMS_KEY);
      if (!data) return [];
      
      const rooms = JSON.parse(data) as RecentRoom[];
      return rooms.filter(r => r.roomId && r.roomNumber);
    } catch (error) {
      console.error('Erro ao ler salas recentes:', error);
      return [];
    }
  },

  /**
   * Obter apenas IDs das salas recentes
   */
  getRecentRoomIds(): string[] {
    return this.getRecentRooms().map(r => r.roomId);
  },

  /**
   * Limpar salas recentes
   */
  clear(): void {
    try {
      localStorage.removeItem(RECENT_ROOMS_KEY);
    } catch (error) {
      console.error('Erro ao limpar salas recentes:', error);
    }
  },
};

