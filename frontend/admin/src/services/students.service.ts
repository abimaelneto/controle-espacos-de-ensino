import { api } from './api';

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
    const response = await api.get('/students');
    return response.data;
  },

  async getById(id: string): Promise<Student> {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  async create(data: CreateStudentDto): Promise<Student> {
    const response = await api.post('/students', data);
    return response.data;
  },

  async update(id: string, data: UpdateStudentDto): Promise<Student> {
    const response = await api.put(`/students/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/students/${id}`);
  },
};

