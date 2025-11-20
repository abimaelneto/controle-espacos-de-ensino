import { api } from './api';

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

export const analyticsService = {
  async getRoomUsageStats(
    roomId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<RoomUsageStats> {
    const response = await api.get('/analytics/rooms/stats', {
      params: {
        roomId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    });
    return response.data;
  },
};

