import { randomUUID } from 'crypto';

export type MetricType = 'ROOM_USAGE' | 'STUDENT_ACTIVITY' | 'OCCUPANCY_RATE';

export class UsageMetric {
  private id: string;
  private metricType: MetricType;
  private roomId: string | null;
  private studentId: string | null;
  private value: number;
  private metadata: Record<string, any>;
  private recordedAt: Date;
  private createdAt: Date;

  private constructor(
    id: string,
    metricType: MetricType,
    roomId: string | null,
    studentId: string | null,
    value: number,
    metadata: Record<string, any>,
    recordedAt: Date,
    createdAt: Date,
  ) {
    this.id = id;
    this.metricType = metricType;
    this.roomId = roomId;
    this.studentId = studentId;
    this.value = value;
    this.metadata = metadata;
    this.recordedAt = recordedAt;
    this.createdAt = createdAt;
  }

  static create(
    metricType: MetricType,
    value: number,
    roomId: string | null = null,
    studentId: string | null = null,
    metadata: Record<string, any> = {},
  ): UsageMetric {
    const now = new Date();
    return new UsageMetric(
      randomUUID(),
      metricType,
      roomId,
      studentId,
      value,
      metadata,
      now,
      now,
    );
  }

  static reconstitute(
    id: string,
    metricType: MetricType,
    roomId: string | null,
    studentId: string | null,
    value: number,
    metadata: Record<string, any>,
    recordedAt: Date,
    createdAt: Date,
  ): UsageMetric {
    return new UsageMetric(
      id,
      metricType,
      roomId,
      studentId,
      value,
      metadata,
      recordedAt,
      createdAt,
    );
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getMetricType(): MetricType {
    return this.metricType;
  }

  getRoomId(): string | null {
    return this.roomId;
  }

  getStudentId(): string | null {
    return this.studentId;
  }

  getValue(): number {
    return this.value;
  }

  getMetadata(): Record<string, any> {
    return this.metadata;
  }

  getRecordedAt(): Date {
    return this.recordedAt;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }
}

