import { Injectable, Inject, Optional } from '@nestjs/common';
import { IMetricRepository } from '../../domain/ports/repositories/metric.repository.port';
import { UsageMetric } from '../../domain/entities/usage-metric.entity';
import { IDomainEvent } from '../../domain/events/domain-event.interface';
import { BusinessMetricsService } from '../../infrastructure/metrics/business-metrics.service';
import { RealtimeEventsGateway } from '../../infrastructure/websocket/realtime-events.gateway';

const METRIC_REPOSITORY = 'METRIC_REPOSITORY';

@Injectable()
export class AttendanceEventHandlerService {
  private realtimeGateway?: RealtimeEventsGateway;

  constructor(
    @Inject(METRIC_REPOSITORY) private readonly metricRepository: IMetricRepository,
    @Optional() private readonly businessMetricsService?: BusinessMetricsService,
  ) {}

  setRealtimeGateway(gateway: RealtimeEventsGateway) {
    this.realtimeGateway = gateway;
  }

  async handleAttendanceCheckedIn(event: IDomainEvent): Promise<void> {
    const { attendanceId, studentId, roomId, checkInTime } = event.payload;

    // Usar checkInTime do evento como recordedAt, não a data atual
    const recordedAt = checkInTime ? new Date(checkInTime as string) : new Date();

    const metric = UsageMetric.create(
      'ROOM_USAGE',
      1, // value: 1 check-in
      roomId as string,
      studentId as string,
      {
        attendanceId: attendanceId as string,
        checkInTime: checkInTime as string,
        action: 'CHECK_IN',
      },
    );

    // Sobrescrever recordedAt com o checkInTime do evento
    const metricWithCorrectTime = UsageMetric.reconstitute(
      metric.getId(),
      metric.getMetricType(),
      metric.getRoomId(),
      metric.getStudentId(),
      metric.getValue(),
      metric.getMetadata(),
      recordedAt, // Usar checkInTime do evento
      metric.getCreatedAt(),
    );

    await this.metricRepository.save(metricWithCorrectTime);

    this.businessMetricsService?.incrementCheckIns(roomId as string);
    this.businessMetricsService?.trackStudent(studentId as string);
    this.businessMetricsService?.updateRoomLastCheckIn(
      roomId as string,
      new Date(checkInTime as string).getTime() / 1000,
    );

    // Notificar clientes WebSocket sobre o novo check-in (via Kafka)
    if (this.realtimeGateway) {
      this.realtimeGateway.broadcastCheckIn({
        roomId: roomId as string,
        studentId: studentId as string,
        attendanceId: attendanceId as string,
        checkInTime: checkInTime as string,
      });
    }
  }

  async handleAttendanceCheckedOut(event: IDomainEvent): Promise<void> {
    const { attendanceId, studentId, roomId, checkInTime, checkOutTime } = event.payload;

    // Usar checkOutTime do evento como recordedAt, não a data atual
    const recordedAt = checkOutTime ? new Date(checkOutTime as string) : new Date();

    const metric = UsageMetric.create(
      'ROOM_USAGE',
      -1, // value: -1 para checkout (reduz ocupação)
      roomId as string,
      studentId as string,
      {
        attendanceId: attendanceId as string,
        checkInTime: checkInTime as string,
        checkOutTime: checkOutTime as string,
        action: 'CHECK_OUT',
      },
    );

    // Sobrescrever recordedAt com o checkOutTime do evento
    const metricWithCorrectTime = UsageMetric.reconstitute(
      metric.getId(),
      metric.getMetricType(),
      metric.getRoomId(),
      metric.getStudentId(),
      metric.getValue(),
      metric.getMetadata(),
      recordedAt, // Usar checkOutTime do evento
      metric.getCreatedAt(),
    );

    await this.metricRepository.save(metricWithCorrectTime);

    // Notificar clientes WebSocket sobre o checkout (via Kafka)
    if (this.realtimeGateway) {
      this.realtimeGateway.broadcastCheckOut({
        roomId: roomId as string,
        studentId: studentId as string,
        attendanceId: attendanceId as string,
        checkInTime: checkInTime as string,
        checkOutTime: checkOutTime as string,
      });
    }
  }
}

