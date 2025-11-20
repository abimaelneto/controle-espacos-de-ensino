import { GetRoomUsageStatsUseCase } from './get-room-usage-stats.use-case';
import { IMetricRepository } from '../../domain/ports/repositories/metric.repository.port';
import { UsageMetric } from '../../domain/entities/usage-metric.entity';

describe('GetRoomUsageStatsUseCase', () => {
  let useCase: GetRoomUsageStatsUseCase;
  let metricRepository: jest.Mocked<IMetricRepository>;

  beforeEach(() => {
    metricRepository = {
      save: jest.fn(),
      findByType: jest.fn(),
      findByRoom: jest.fn(),
      findByStudent: jest.fn(),
      getAggregatedMetrics: jest.fn(),
    };

    useCase = new GetRoomUsageStatsUseCase(metricRepository);
  });

  describe('execute', () => {
    it('should return room usage statistics', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const metrics = [
        UsageMetric.create('ROOM_USAGE', 1, 'room-123', null, {
          duration: 120,
        }),
        UsageMetric.create('ROOM_USAGE', 1, 'room-123', null, {
          duration: 90,
        }),
      ];

      metricRepository.findByRoom.mockResolvedValue(metrics);

      const result = await useCase.execute('room-123', startDate, endDate);

      expect(result.roomId).toBe('room-123');
      expect(result.totalUsage).toBe(2);
      expect(result.totalHours).toBe(3.5); // (120 + 90) / 60
      expect(metricRepository.findByRoom).toHaveBeenCalledWith(
        'room-123',
        startDate,
        endDate,
      );
    });
  });
});

