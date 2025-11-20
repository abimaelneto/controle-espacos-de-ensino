import { AttendanceEventHandlerService } from './attendance-event-handler.service';
import { IMetricRepository } from '../../domain/ports/repositories/metric.repository.port';
import { IDomainEvent } from '../../domain/events/domain-event.interface';
import { BusinessMetricsService } from '../../infrastructure/metrics/business-metrics.service';

describe('AttendanceEventHandlerService', () => {
  let service: AttendanceEventHandlerService;
  let metricRepository: jest.Mocked<IMetricRepository>;
  let businessMetrics: jest.Mocked<BusinessMetricsService>;

  beforeEach(() => {
    metricRepository = {
      save: jest.fn(),
      findByRoom: jest.fn(),
      findByType: jest.fn(),
      getAggregatedMetrics: jest.fn(),
    } as any;

    businessMetrics = {
      incrementCheckIns: jest.fn(),
      trackStudent: jest.fn(),
      updateRoomLastCheckIn: jest.fn(),
      getRegistry: jest.fn(),
    } as unknown as jest.Mocked<BusinessMetricsService>;

    service = new AttendanceEventHandlerService(
      metricRepository,
      businessMetrics,
    );
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
      expect(businessMetrics.incrementCheckIns).toHaveBeenCalledWith(
        'room-456',
      );
      expect(businessMetrics.trackStudent).toHaveBeenCalledWith('student-123');
      expect(businessMetrics.updateRoomLastCheckIn).toHaveBeenCalledWith(
        'room-456',
        expect.any(Number),
      );
    });
  });

});

