import { GetAttendanceHistoryUseCase } from './get-attendance-history.use-case';
import { IAttendanceRepository } from '../../domain/ports/repositories/attendance.repository.port';
import { Attendance } from '../../domain/entities/attendance.entity';

describe('GetAttendanceHistoryUseCase', () => {
  let useCase: GetAttendanceHistoryUseCase;
  let attendanceRepository: jest.Mocked<IAttendanceRepository>;

  beforeEach(() => {
    attendanceRepository = {
      findById: jest.fn(),
      findActiveByStudent: jest.fn(),
      findActiveByRoom: jest.fn(),
      findByStudent: jest.fn(),
      findByRoom: jest.fn(),
      countActiveByRoom: jest.fn(),
      countByRoomAndDate: jest.fn(),
      save: jest.fn(),
    };

    useCase = new GetAttendanceHistoryUseCase(attendanceRepository);
  });

  describe('execute', () => {
    it('should return attendance history', async () => {
      const attendance1 = Attendance.checkIn('student-123', 'room-456');
      const attendance2 = Attendance.checkIn('student-123', 'room-789');

      attendanceRepository.findByStudent.mockResolvedValue([
        attendance1,
        attendance2,
      ]);

      const result = await useCase.execute('student-123');

      expect(result).toHaveLength(2);
      expect(result[0].checkInTime).toBeInstanceOf(Date);
      expect(result[1].checkInTime).toBeInstanceOf(Date);
    });

    it('should return empty array if no history', async () => {
      attendanceRepository.findByStudent.mockResolvedValue([]);

      const result = await useCase.execute('student-123');

      expect(result).toHaveLength(0);
    });
  });
});

