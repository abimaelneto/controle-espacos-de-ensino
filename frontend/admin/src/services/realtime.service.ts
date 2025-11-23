import { io, Socket } from 'socket.io-client';

const ANALYTICS_WS_URL = import.meta.env.VITE_ANALYTICS_WS_URL || 'http://localhost:3004';

export interface CheckInEvent {
  type: 'checkin';
  data: {
    roomId: string;
    studentId: string;
    attendanceId: string;
    checkInTime: string;
  };
  timestamp: string;
}

export interface RoomOccupancyEvent {
  type: 'room:occupancy';
  roomId: string;
  data: {
    roomId: string;
    occupancy: number;
    checkInsLast15Minutes: number;
    checkInsLastHour: number;
  };
  timestamp: string;
}

export interface DashboardUpdateEvent {
  type: 'dashboard:update';
  data: {
    totalCheckins: number;
    activeCheckins: number;
    roomsOccupied: number;
    studentsActive: number;
  };
  timestamp: string;
}

class RealtimeService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  connect() {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(`${ANALYTICS_WS_URL}/realtime`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to realtime updates via WebSocket');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from realtime updates');
    });

    this.socket.on('connected', (data) => {
      console.log('📡 Realtime service connected:', data);
    });

    // Registrar listeners existentes
    this.listeners.forEach((handlers, event) => {
      handlers.forEach((handler) => {
        this.socket?.on(event, handler);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  subscribe(rooms?: string[]) {
    if (!this.socket?.connected) {
      this.connect();
    }

    this.socket?.emit('subscribe', { rooms });
  }

  unsubscribe(rooms?: string[]) {
    this.socket?.emit('unsubscribe', { rooms });
  }

  on(event: 'checkin', handler: (data: CheckInEvent) => void): void;
  on(event: 'room:checkin', handler: (data: RoomOccupancyEvent) => void): void;
  on(event: 'room:occupancy', handler: (data: RoomOccupancyEvent) => void): void;
  on(event: 'occupancy:update', handler: (data: RoomOccupancyEvent) => void): void;
  on(event: 'dashboard:update', handler: (data: DashboardUpdateEvent) => void): void;
  on(event: string, handler: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    if (this.socket) {
      this.socket.on(event, handler);
    }
  }

  off(event: string, handler?: (data: any) => void): void {
    if (handler) {
      this.listeners.get(event)?.delete(handler);
      this.socket?.off(event, handler);
    } else {
      this.listeners.delete(event);
      this.socket?.off(event);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const realtimeService = new RealtimeService();

