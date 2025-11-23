import { randomUUID } from 'crypto';

export class Attendance {
  private id: string;
  private studentId: string;
  private roomId: string;
  private checkInTime: Date;
  private idempotencyKey: string | null;
  private createdAt: Date;
  private updatedAt: Date;

  private constructor(
    id: string,
    studentId: string,
    roomId: string,
    checkInTime: Date,
    idempotencyKey: string | null,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.studentId = studentId;
    this.roomId = roomId;
    this.checkInTime = checkInTime;
    this.idempotencyKey = idempotencyKey;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static checkIn(studentId: string, roomId: string, idempotencyKey?: string): Attendance {
    const now = new Date();
    return new Attendance(
      randomUUID(),
      studentId,
      roomId,
      now,
      idempotencyKey || null,
      now,
      now,
    );
  }

  static reconstitute(
    id: string,
    studentId: string,
    roomId: string,
    checkInTime: Date,
    idempotencyKey: string | null,
    createdAt: Date,
    updatedAt: Date,
  ): Attendance {
    return new Attendance(
      id,
      studentId,
      roomId,
      checkInTime,
      idempotencyKey,
      createdAt,
      updatedAt,
    );
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getStudentId(): string {
    return this.studentId;
  }

  getRoomId(): string {
    return this.roomId;
  }

  getCheckInTime(): Date {
    return this.checkInTime;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getIdempotencyKey(): string | null {
    return this.idempotencyKey;
  }
}
