import axios from 'axios';

const STUDENTS_API_URL = import.meta.env.VITE_STUDENTS_API_URL || 'http://localhost:3001/api/v1';

const studentsApi = axios.create({
  baseURL: STUDENTS_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT
studentsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Student {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  cpf: string;
  email: string;
  matricula: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentDto {
  userId: string;
  firstName: string;
  lastName: string;
  cpf: string;
  email: string;
  matricula: string;
}

export interface UpdateStudentDto {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export const studentsService = {
  async getAll(): Promise<Student[]> {
    const response = await studentsApi.get('/students');
    return response.data;
  },

  async getById(id: string): Promise<Student> {
    const response = await studentsApi.get(`/students/${id}`);
    return response.data;
  },

  async create(data: CreateStudentDto): Promise<Student> {
    const response = await studentsApi.post('/students', data);
    return response.data;
  },

  async update(id: string, data: UpdateStudentDto): Promise<Student> {
    const response = await studentsApi.put(`/students/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await studentsApi.delete(`/students/${id}`);
  },
};

