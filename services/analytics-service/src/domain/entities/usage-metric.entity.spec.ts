import { UsageMetric } from './usage-metric.entity';

describe('UsageMetric Entity', () => {
  describe('create', () => {
    it('should create a new usage metric', () => {
      const metric = UsageMetric.create('ROOM_USAGE', 1, 'room-123');

      expect(metric).toBeDefined();
      expect(metric.getId()).toBeDefined();
      expect(metric.getMetricType()).toBe('ROOM_USAGE');
      expect(metric.getRoomId()).toBe('room-123');
      expect(metric.getValue()).toBe(1);
      expect(metric.getRecordedAt()).toBeInstanceOf(Date);
    });

    it('should create metric with metadata', () => {
      const metadata = { duration: 120, startTime: '08:00' };
      const metric = UsageMetric.create(
        'ROOM_USAGE',
        1,
        'room-123',
        null,
        metadata,
      );

      expect(metric.getMetadata()).toEqual(metadata);
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute metric from persistence', () => {
      const id = 'metric-123';
      const recordedAt = new Date('2024-01-01');
      const createdAt = new Date('2024-01-01');

      const metric = UsageMetric.reconstitute(
        id,
        'STUDENT_ACTIVITY',
        null,
        'student-123',
        1,
        {},
        recordedAt,
        createdAt,
      );

      expect(metric.getId()).toBe(id);
      expect(metric.getStudentId()).toBe('student-123');
      expect(metric.getRecordedAt()).toBe(recordedAt);
    });
  });
});

