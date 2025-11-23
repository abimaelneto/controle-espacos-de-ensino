import { CheckInValidationService } from './checkin-validation.service';
import { IAttendanceRepository } from '../ports/repositories/attendance.repository.port';
import { IStudentsClient } from '../ports/http/students-client.port';
import { IRoomsClient } from '../ports/http/rooms-client.port';
import { Attendance } from '../entities/attendance.entity';

describe('CheckInValidationService', () => {
  let service: CheckInValidationService;
  let attendanceRepository: jest.Mocked<IAttendanceRepository>;
  let studentsClient: jest.Mocked<IStudentsClient>;
  let roomsClient: jest.Mocked<IRoomsClient>;

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
      saveWithCapacityCheck: jest.fn(),
      findByIdempotencyKey: jest.fn(),
      delete: jest.fn(),
    };

    studentsClient = {
      findStudentByCPF: jest.fn(),
      findStudentByMatricula: jest.fn(),
      validateStudentActive: jest.fn(),
    };

    roomsClient = {
      getRoom: jest.fn(),
      validateRoomAvailable: jest.fn(),
    };

    service = new CheckInValidationService(
      attendanceRepository,
      studentsClient,
      roomsClient,
    );
  });

  describe('validateCheckIn', () => {
    it('should validate successful check-in', async () => {
      studentsClient.validateStudentActive.mockResolvedValue(true);

      roomsClient.getRoom.mockResolvedValue({
        id: 'room-456',
        roomNumber: 'A101',
        capacity: 30,
        type: 'CLASSROOM',
        status: 'ACTIVE',
      });

      attendanceRepository.findActiveByStudent.mockResolvedValue(null);
      attendanceRepository.countActiveByRoom.mockResolvedValue(15);

      const result = await service.validateCheckIn('student-123', 'room-456');

      expect(result.valid).toBe(true);
      expect(result.room).toBeDefined();
    });

    it('should reject if student is inactive', async () => {
      studentsClient.validateStudentActive.mockResolvedValue(false);

      const result = await service.validateCheckIn('student-123', 'room-456');

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('inativo');
    });

    it('should reject if student already has check-in today', async () => {
      studentsClient.validateStudentActive.mockResolvedValue(true);

      roomsClient.getRoom.mockResolvedValue({
        id: 'room-456',
        roomNumber: 'A101',
        capacity: 30,
        type: 'CLASSROOM',
        status: 'ACTIVE',
      });

      // Mock check-in de hoje
      const todayCheckIn = Attendance.checkIn('student-123', 'room-789');
      attendanceRepository.findActiveByStudent.mockResolvedValue(todayCheckIn);

      const result = await service.validateCheckIn('student-123', 'room-456');

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('já possui um check-in');
    });

    it('should reject if room is at capacity', async () => {
      studentsClient.validateStudentActive.mockResolvedValue(true);

      roomsClient.getRoom.mockResolvedValue({
        id: 'room-456',
        roomNumber: 'A101',
        capacity: 30,
        type: 'CLASSROOM',
        status: 'ACTIVE',
      });

      attendanceRepository.findActiveByStudent.mockResolvedValue(null);
      attendanceRepository.countActiveByRoom.mockResolvedValue(30);

      const result = await service.validateCheckIn('student-123', 'room-456');

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('capacidade máxima');
    });
  });
});

