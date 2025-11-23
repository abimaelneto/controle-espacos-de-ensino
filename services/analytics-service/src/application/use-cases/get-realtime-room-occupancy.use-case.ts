import { IMetricRepository } from '../../domain/ports/repositories/metric.repository.port';

export interface RealtimeRoomOccupancy {
  roomId: string;
  roomNumber?: string;
  currentOccupancy: number;
  capacity?: number;
  occupancyRate: number;
  lastCheckIn?: string;
  checkInsLastHour: number;
  checkInsLast15Minutes: number;
  uniqueStudentsLastHour: number;
}

export class GetRealtimeRoomOccupancyUseCase {
  constructor(private readonly metricRepository: IMetricRepository) {}

  async execute(roomIds?: string[]): Promise<RealtimeRoomOccupancy[]> {
    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
    const last15Minutes = new Date(now.getTime() - 15 * 60 * 1000);

    // Se roomIds não for fornecido, buscar todas as salas com atividade recente
    if (!roomIds || roomIds.length === 0) {
      // Buscar todas as métricas das últimas 24 horas para identificar salas ativas
      const recentMetrics = await this.metricRepository.findByType(
        'ROOM_USAGE',
        new Date(now.getTime() - 24 * 60 * 60 * 1000),
        now,
      );
      
      const uniqueRoomIds = new Set(recentMetrics.map((m) => m.getRoomId()).filter(Boolean));
      roomIds = Array.from(uniqueRoomIds);
    }

    const results: RealtimeRoomOccupancy[] = [];

    for (const roomId of roomIds) {
      // Buscar métricas da última hora
      const metricsLastHour = await this.metricRepository.findByRoom(roomId, lastHour, now);
      
      // Buscar métricas dos últimos 15 minutos
      const metricsLast15Min = metricsLastHour.filter(
        (m) => m.getRecordedAt() >= last15Minutes,
      );

      // Calcular ocupação atual (check-ins dos últimos 15 minutos)
      const currentOccupancy = metricsLast15Min.length;
      
      // Calcular check-ins da última hora
      const checkInsLastHour = metricsLastHour.length;
      
      // Calcular check-ins dos últimos 15 minutos
      const checkInsLast15Minutes = metricsLast15Min.length;
      
      // Calcular alunos únicos da última hora
      const uniqueStudentsLastHour = new Set(
        metricsLastHour.map((m) => m.getStudentId()).filter(Boolean),
      ).size;

      // Último check-in
      const lastCheckIn = metricsLastHour.length > 0
        ? metricsLastHour[metricsLastHour.length - 1].getRecordedAt().toISOString()
        : undefined;

      // Taxa de ocupação (assumindo que cada check-in representa 1 pessoa)
      // Se não houver capacidade, usar check-ins da última hora como base
      const occupancyRate = currentOccupancy > 0 ? (currentOccupancy / Math.max(checkInsLastHour, 1)) * 100 : 0;

      results.push({
        roomId,
        currentOccupancy,
        occupancyRate,
        lastCheckIn,
        checkInsLastHour,
        checkInsLast15Minutes,
        uniqueStudentsLastHour,
      });
    }

    return results.sort((a, b) => b.currentOccupancy - a.currentOccupancy);
  }
}

