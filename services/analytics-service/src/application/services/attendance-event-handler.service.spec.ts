import { AttendanceEventHandlerService } from './attendance-event-handler.service';
import { IMetricRepository } from '../../domain/ports/repositories/metric.repository.port';
import { IDomainEvent } from '../../domain/events/domain-event.interface';

describe('AttendanceEventHandlerService', () => {
  let service: AttendanceEventHandlerService;
  let metricRepository: jest.Mocked<IMetricRepository>;

  beforeEach(() => {
    metricRepository = {
      save: jest.fn(),
      findByRoom: jest.fn(),
      findByType: jest.fn(),
      getAggregatedMetrics: jest.fn(),
    } as any;

    service = new AttendanceEventHandlerService(metricRepository);
  });

  describe('handleAttendanceCheckedIn', () => {
    it('should create metric for check-in event', async () => {
      const event: IDomainEvent = {
        eventType: 'AttendanceCheckedIn',
        aggregateId: 'attendance-123',
        occurredAt: new Date(),
        topic: 'attendance.events',
        payload: {
          attendanceId: 'attendance-123',
          studentId: 'student-123',
          roomId: 'room-456',
          checkInTime: '2024-01-01T10:00:00Z',
        },
      };

      await service.handleAttendanceCheckedIn(event);

      expect(metricRepository.save).toHaveBeenCalled();
    });
  });

});

