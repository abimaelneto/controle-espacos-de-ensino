import { Attendance } from './attendance.entity';

describe('Attendance Entity', () => {
  describe('checkIn', () => {
    it('should create a new attendance record', () => {
      const attendance = Attendance.checkIn('student-123', 'room-456');

      expect(attendance).toBeDefined();
      expect(attendance.getId()).toBeDefined();
      expect(attendance.getStudentId()).toBe('student-123');
      expect(attendance.getRoomId()).toBe('room-456');
      expect(attendance.getCheckInTime()).toBeInstanceOf(Date);
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute attendance from persistence', () => {
      const checkInTime = new Date('2024-01-01T10:00:00');
      const createdAt = new Date('2024-01-01T10:00:00');
      const updatedAt = new Date('2024-01-01T10:00:00');

      const attendance = Attendance.reconstitute(
        'attendance-123',
        'student-123',
        'room-456',
        checkInTime,
        createdAt,
        updatedAt,
      );

      expect(attendance.getId()).toBe('attendance-123');
      expect(attendance.getStudentId()).toBe('student-123');
      expect(attendance.getRoomId()).toBe('room-456');
      expect(attendance.getCheckInTime()).toEqual(checkInTime);
    });
  });
});
