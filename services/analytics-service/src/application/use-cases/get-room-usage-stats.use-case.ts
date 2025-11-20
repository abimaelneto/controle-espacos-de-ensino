import { IMetricRepository } from '../../domain/ports/repositories/metric.repository.port';

export class GetRoomUsageStatsUseCase {
  constructor(private readonly metricRepository: IMetricRepository) {}

  async execute(roomId: string, startDate: Date, endDate: Date): Promise<any> {
    const metrics = await this.metricRepository.findByRoom(
      roomId,
      startDate,
      endDate,
    );

    const totalUsage = metrics.length;
    const totalHours = metrics.reduce(
      (sum, metric) => sum + (metric.getMetadata().duration || 0),
      0,
    );

    return {
      roomId,
      period: {
        startDate,
        endDate,
      },
      totalUsage,
      totalHours: totalHours / 60, // Converter minutos para horas
      averageUsagePerDay: totalUsage / this.getDaysBetween(startDate, endDate),
    };
  }

  private getDaysBetween(start: Date, end: Date): number {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1; // Evitar divisão por zero
  }
}

