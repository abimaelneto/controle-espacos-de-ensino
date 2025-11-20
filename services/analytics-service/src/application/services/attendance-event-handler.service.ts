import { Injectable } from '@nestjs/common';
import { IMetricRepository } from '../../domain/ports/repositories/metric.repository.port';
import { UsageMetric } from '../../domain/entities/usage-metric.entity';
import { IDomainEvent } from '../../domain/events/domain-event.interface';
import { BusinessMetricsService } from '../../infrastructure/metrics/business-metrics.service';

@Injectable()
export class AttendanceEventHandlerService {
  constructor(
    private readonly metricRepository: IMetricRepository,
    private readonly businessMetricsService?: BusinessMetricsService,
  ) {}

  async handleAttendanceCheckedIn(event: IDomainEvent): Promise<void> {
    const { attendanceId, studentId, roomId, checkInTime } = event.payload;

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

    await this.metricRepository.save(metric);

    this.businessMetricsService?.incrementCheckIns(roomId as string);
    this.businessMetricsService?.trackStudent(studentId as string);
    this.businessMetricsService?.updateRoomLastCheckIn(
      roomId as string,
      new Date(checkInTime as string).getTime() / 1000,
    );
  }
}

