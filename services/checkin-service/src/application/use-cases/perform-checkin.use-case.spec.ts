import { PerformCheckInUseCase } from './perform-checkin.use-case';
import { IAttendanceRepository } from '../../domain/ports/repositories/attendance.repository.port';
import { CheckInValidationService } from '../../domain/services/checkin-validation.service';
import { IEventPublisher } from '../../domain/ports/messaging/event-publisher.port';
import { Attendance } from '../../domain/entities/attendance.entity';
import { ResolveStudentIdUseCase } from './resolve-student-id.use-case';

describe('PerformCheckInUseCase', () => {
  let useCase: PerformCheckInUseCase;
  let attendanceRepository: jest.Mocked<IAttendanceRepository>;
  let validationService: jest.Mocked<CheckInValidationService>;
  let eventPublisher: jest.Mocked<IEventPublisher>;
  let resolveStudentIdUseCase: jest.Mocked<ResolveStudentIdUseCase>;

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

    validationService = {
      validateCheckIn: jest.fn(),
    } as any;

    eventPublisher = {
      publish: jest.fn(),
      publishMany: jest.fn(),
    };

    resolveStudentIdUseCase = {
      execute: jest.fn(),
    } as any;

    useCase = new PerformCheckInUseCase(
      attendanceRepository,
      validationService,
      eventPublisher,
      resolveStudentIdUseCase,
    );
  });

  describe('execute', () => {
    it('should perform check-in successfully', async () => {
      const attendance = Attendance.checkIn('student-123', 'room-456');

      validationService.validateCheckIn.mockResolvedValue({
        valid: true,
        student: {
          id: 'student-123',
          userId: 'user-123',
          name: 'João Silva',
          cpf: '12345678909',
          email: 'joao@example.com',
          matricula: '2024001234',
          status: 'ACTIVE',
        },
        room: {
          id: 'room-456',
          roomNumber: 'A101',
          capacity: 30,
          type: 'CLASSROOM',
          status: 'ACTIVE',
        },
      });

      attendanceRepository.findByIdempotencyKey.mockResolvedValue(null);
      attendanceRepository.saveWithCapacityCheck.mockResolvedValue({
        success: true,
      });
      eventPublisher.publish.mockResolvedValue(undefined);

      const result = await useCase.execute({
        studentId: 'student-123',
        roomId: 'room-456',
        identificationMethod: 'MATRICULA',
        identificationValue: '2024001234',
      });

      expect(result.success).toBe(true);
      expect(result.attendance).toBeDefined();
      expect(attendanceRepository.saveWithCapacityCheck).toHaveBeenCalled();
      expect(eventPublisher.publish).toHaveBeenCalled();
    });

    it('should reject check-in if validation fails', async () => {
      validationService.validateCheckIn.mockResolvedValue({
        valid: false,
        reason: 'Aluno já possui check-in ativo',
      });

      const result = await useCase.execute({
        studentId: 'student-123',
        roomId: 'room-456',
        identificationMethod: 'MATRICULA',
        identificationValue: '2024001234',
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('já possui check-in ativo');
      expect(attendanceRepository.save).not.toHaveBeenCalled();
    });
  });
});

