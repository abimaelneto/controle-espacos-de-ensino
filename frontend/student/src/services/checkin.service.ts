import axios from 'axios';
import type { CheckInRequest, CheckInResponse, CheckInHistory } from '@/types/checkin';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3004/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const checkInService = {
  async performCheckIn(request: CheckInRequest): Promise<CheckInResponse> {
    const response = await api.post<CheckInResponse>('/v1/checkin', request);
    return response.data;
  },

  async getCheckInHistory(studentId: string): Promise<CheckInHistory[]> {
    const response = await api.get<CheckInHistory[]>(
      `/v1/checkin/history/${studentId}`,
    );
    return response.data;
  },


  async validateStudent(identificationMethod: string, value: string): Promise<boolean> {
    try {
      const response = await api.post('/v1/students/validate', {
        method: identificationMethod,
        value,
      });
      return response.data.valid;
    } catch {
      return false;
    }
  },
};

