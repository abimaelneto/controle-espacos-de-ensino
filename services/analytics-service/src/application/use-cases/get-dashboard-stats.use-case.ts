import { IMetricRepository } from '../../domain/ports/repositories/metric.repository.port';
import { MetricType } from '../../domain/entities/usage-metric.entity';

export class GetDashboardStatsUseCase {
  constructor(private readonly metricRepository: IMetricRepository) {}

  async execute(startDate?: Date, endDate?: Date) {
    const defaultEndDate = endDate || new Date();
    const defaultStartDate = startDate || this.getDefaultStartDate(defaultEndDate);

    // Buscar métricas agregadas
    const roomUsageMetrics = await this.metricRepository.getAggregatedMetrics(
      'ROOM_USAGE',
      defaultStartDate,
      defaultEndDate,
    );

    const studentActivityMetrics = await this.metricRepository.getAggregatedMetrics(
      'STUDENT_ACTIVITY',
      defaultStartDate,
      defaultEndDate,
    );

    // Buscar todas as métricas para cálculos adicionais
    const allRoomUsage = await this.metricRepository.findByType(
      'ROOM_USAGE',
      defaultStartDate,
      defaultEndDate,
    );

    // Calcular estatísticas
    const uniqueRooms = new Set(allRoomUsage.map((m) => m.getRoomId()).filter(Boolean));
    const uniqueStudents = new Set(
      allRoomUsage.map((m) => m.getStudentId()).filter(Boolean),
    );

    // Calcular check-ins ativos (últimas 24 horas)
    const last24Hours = new Date(defaultEndDate.getTime() - 24 * 60 * 60 * 1000);
    const activeCheckIns = allRoomUsage.filter(
      (m) => m.getRecordedAt() >= last24Hours,
    ).length;

    return {
      totalCheckins: roomUsageMetrics.count || 0,
      activeCheckins: activeCheckIns,
      roomsOccupied: uniqueRooms.size,
      studentsActive: uniqueStudents.size,
      period: {
        startDate: defaultStartDate.toISOString(),
        endDate: defaultEndDate.toISOString(),
      },
    };
  }

  private getDefaultStartDate(endDate: Date): Date {
    // Últimos 30 dias por padrão
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 30);
    return startDate;
  }
}

