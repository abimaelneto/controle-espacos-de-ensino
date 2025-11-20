import { create } from 'zustand';
import { studentsService, type Student, type CreateStudentDto, type UpdateStudentDto } from '../services/students.service';

interface StudentsState {
  students: Student[];
  loading: boolean;
  error: string | null;
  fetchStudents: () => Promise<void>;
  createStudent: (data: CreateStudentDto) => Promise<void>;
  updateStudent: (id: string, data: UpdateStudentDto) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
}

export const useStudentsStore = create<StudentsState>((set) => ({
  students: [],
  loading: false,
  error: null,

  fetchStudents: async () => {
    set({ loading: true, error: null });
    try {
      const students = await studentsService.getAll();
      set({ students, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createStudent: async (data) => {
    set({ loading: true, error: null });
    try {
      const student = await studentsService.create(data);
      set((state) => ({
        students: [...state.students, student],
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateStudent: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updated = await studentsService.update(id, data);
      set((state) => ({
        students: state.students.map((s) => (s.id === id ? updated : s)),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteStudent: async (id) => {
    set({ loading: true, error: null });
    try {
      await studentsService.delete(id);
      set((state) => ({
        students: state.students.filter((s) => s.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
}));

