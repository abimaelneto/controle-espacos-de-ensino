import { IAttendanceRepository } from '../../domain/ports/repositories/attendance.repository.port';
import { Attendance } from '../../domain/entities/attendance.entity';

export interface AttendanceHistoryItem {
  id: string;
  roomId: string;
  roomNumber?: string;
  checkInTime: Date;
}

export class GetAttendanceHistoryUseCase {
  constructor(
    private readonly attendanceRepository: IAttendanceRepository,
  ) {}

  async execute(
    studentId: string,
    limit = 50,
  ): Promise<AttendanceHistoryItem[]> {
    const attendances = await this.attendanceRepository.findByStudent(
      studentId,
      limit,
    );

    return attendances.map((attendance) => ({
      id: attendance.getId(),
      roomId: attendance.getRoomId(),
      checkInTime: attendance.getCheckInTime(),
    }));
  }
}

