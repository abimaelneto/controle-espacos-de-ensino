import { IMetricRepository } from '../../domain/ports/repositories/metric.repository.port';

export class GetStudentStatsUseCase {
  constructor(private readonly metricRepository: IMetricRepository) {}

  async execute(studentId: string, startDate?: Date, endDate?: Date) {
    const defaultEndDate = endDate || new Date();
    const defaultStartDate = startDate || this.getDefaultStartDate(defaultEndDate);

    const metrics = await this.metricRepository.findByStudent(
      studentId,
      defaultStartDate,
      defaultEndDate,
    );

    // Agrupar por data para gráfico temporal
    const dailyStats = this.groupByDate(metrics);
    
    // Calcular estatísticas
    const totalCheckins = metrics.length;
    const uniqueRooms = new Set(metrics.map((m) => m.getRoomId()).filter(Boolean));
    const totalHours = metrics.reduce(
      (sum, metric) => sum + (metric.getMetadata().duration || 0),
      0,
    ) / 60; // Converter minutos para horas

    return {
      studentId,
      period: {
        startDate: defaultStartDate.toISOString(),
        endDate: defaultEndDate.toISOString(),
      },
      totalCheckins,
      totalHours,
      roomsVisited: uniqueRooms.size,
      averageCheckinsPerDay: totalCheckins / this.getDaysBetween(defaultStartDate, defaultEndDate),
      dailyStats: Array.from(dailyStats.entries()).map(([date, count]) => ({
        date,
        checkins: count,
      })),
    };
  }

  private groupByDate(metrics: any[]): Map<string, number> {
    const grouped = new Map<string, number>();
    
    metrics.forEach((metric) => {
      const date = new Date(metric.getRecordedAt()).toISOString().split('T')[0];
      const current = grouped.get(date) || 0;
      grouped.set(date, current + 1);
    });

    return grouped;
  }

  private getDaysBetween(start: Date, end: Date): number {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  }

  private getDefaultStartDate(endDate: Date): Date {
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 30);
    return startDate;
  }
}

