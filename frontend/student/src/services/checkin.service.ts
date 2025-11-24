import axios from 'axios';
import type { CheckInRequest, CheckInResponse, CheckInHistory } from '@/types/checkin';

const API_BASE_URL = import.meta.env.VITE_CHECKIN_API_URL || 'http://localhost:3003';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export interface ActiveAttendance {
  attendanceId: string;
  studentId: string;
  roomId: string;
  roomNumber?: string;
  checkInTime: Date;
}

export interface CheckOutRequest {
  identificationMethod: 'CPF' | 'MATRICULA' | 'QR_CODE' | 'BIOMETRIC';
  identificationValue: string;
}

export interface CheckOutResponse {
  success: boolean;
  message: string;
  attendanceId?: string;
}

export const checkInService = {
  async performCheckIn(request: CheckInRequest): Promise<CheckInResponse> {
    const response = await api.post<CheckInResponse>('/api/v1/checkin', request);
    return response.data;
  },

  async getCheckInHistory(studentId: string): Promise<CheckInHistory[]> {
    const response = await api.get<CheckInHistory[]>(
      `/api/v1/checkin/history/${studentId}`,
    );
    return response.data;
  },

  async getActiveAttendance(
    method: string,
    value: string,
  ): Promise<ActiveAttendance | null> {
    try {
      const response = await api.get<ActiveAttendance | null>(
        `/api/v1/checkin/active`,
        {
          params: { method, value },
        },
      );
      return response.data;
    } catch (error) {
      return null;
    }
  },

  async performCheckOut(request: CheckOutRequest): Promise<CheckOutResponse> {
    const response = await api.post<CheckOutResponse>(
      '/api/v1/checkin/checkout',
      request,
    );
    return response.data;
  },
};

