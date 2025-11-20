import { Attendance } from '../../entities/attendance.entity';

/**
 * Port: Interface para repositório de atendimentos
 */
export interface IAttendanceRepository {
  findById(id: string): Promise<Attendance | null>;
  findActiveByStudent(studentId: string): Promise<Attendance | null>;
  findActiveByRoom(roomId: string): Promise<Attendance[]>;
  findByStudent(studentId: string, limit?: number): Promise<Attendance[]>;
  findByRoom(roomId: string, startDate?: Date, endDate?: Date): Promise<Attendance[]>;
  countActiveByRoom(roomId: string): Promise<number>;
  countByRoomAndDate(roomId: string, date: Date): Promise<number>;
  save(attendance: Attendance): Promise<void>;
}

