import axios from 'axios';

// @ts-ignore - Vite environment variables
const ANALYTICS_API_URL = import.meta.env.VITE_ANALYTICS_API_URL || 'http://localhost:3004/api/v1';

const analyticsApi = axios.create({
  baseURL: ANALYTICS_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT
analyticsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface RoomUsageStats {
  roomId: string;
  period: {
    startDate: string;
    endDate: string;
  };
  totalUsage: number;
  totalHours: number;
  averageUsagePerDay: number;
}

export interface DashboardStats {
  totalCheckins: number;
  activeCheckins: number;
  roomsOccupied: number;
  studentsActive: number;
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface StudentStats {
  studentId: string;
  period: {
    startDate: string;
    endDate: string;
  };
  totalCheckins: number;
  totalHours: number;
  roomsVisited: number;
  averageCheckinsPerDay: number;
  dailyStats: Array<{
    date: string;
    checkins: number;
  }>;
}

export interface RoomUsageTimeline {
  roomId: string;
  period: {
    startDate: string;
    endDate: string;
  };
  totalCheckins: number;
  totalHours: number;
  uniqueStudents: number;
  averageCheckinsPerDay: number;
  dailyStats: Array<{
    date: string;
    checkins: number;
  }>;
}

export interface RealtimeRoomOccupancy {
  roomId: string;
  roomNumber?: string;
  currentOccupancy: number;
  capacity?: number;
  occupancyRate: number;
  lastCheckIn?: string;
  checkInsLastHour: number;
  checkInsLast15Minutes: number;
  uniqueStudentsLastHour: number;
}

export const analyticsService = {
  async getDashboardStats(startDate?: Date, endDate?: Date): Promise<DashboardStats> {
    const params: any = {};
    if (startDate) params.startDate = startDate.toISOString();
    if (endDate) params.endDate = endDate.toISOString();

    const response = await analyticsApi.get('/analytics/dashboard', { params });
    return response.data;
  },

  async getRoomUsageStats(
    roomId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<RoomUsageStats> {
    const response = await analyticsApi.get('/analytics/rooms/stats', {
      params: {
        roomId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    });
    return response.data;
  },

  async getRoomUsageTimeline(
    roomId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<RoomUsageTimeline> {
    const params: any = {};
    if (startDate) params.startDate = startDate.toISOString();
    if (endDate) params.endDate = endDate.toISOString();

    const response = await analyticsApi.get(`/analytics/rooms/${roomId}/timeline`, { params });
    return response.data;
  },

  async getStudentStats(
    studentId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<StudentStats> {
    const params: any = {};
    if (startDate) params.startDate = startDate.toISOString();
    if (endDate) params.endDate = endDate.toISOString();

    const response = await analyticsApi.get(`/analytics/students/${studentId}/stats`, { params });
    return response.data;
  },

  async getRealtimeOccupancy(roomIds?: string[]): Promise<RealtimeRoomOccupancy[]> {
    const params: any = {};
    if (roomIds && roomIds.length > 0) {
      params.roomIds = roomIds.join(',');
    }

    const response = await analyticsApi.get('/analytics/rooms/realtime', { params });
    return response.data;
  },
};

