import { IDomainEvent } from './domain-event.interface';
import { Attendance } from '../entities/attendance.entity';

export class AttendanceCheckedOutEvent implements IDomainEvent {
  readonly eventType = 'AttendanceCheckedOut';
  readonly aggregateId: string;
  readonly occurredAt: Date;
  readonly topic = 'attendance.events';
  readonly payload: {
    attendanceId: string;
    studentId: string;
    roomId: string;
    checkInTime: string;
    checkOutTime: string;
  };

  constructor(attendance: Attendance) {
    this.aggregateId = attendance.getId();
    this.occurredAt = new Date();
    this.payload = {
      attendanceId: attendance.getId(),
      studentId: attendance.getStudentId(),
      roomId: attendance.getRoomId(),
      checkInTime: attendance.getCheckInTime().toISOString(),
      checkOutTime: new Date().toISOString(),
    };
  }
}


