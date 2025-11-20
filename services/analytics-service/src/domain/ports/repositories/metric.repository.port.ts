import { UsageMetric } from '../../entities/usage-metric.entity';
import { MetricType } from '../../entities/usage-metric.entity';

/**
 * Port: Interface para repositório de métricas
 * Implementado por adapters (MySQL, RDS, etc.)
 */
export interface IMetricRepository {
  save(metric: UsageMetric): Promise<void>;
  findByType(type: MetricType, startDate?: Date, endDate?: Date): Promise<UsageMetric[]>;
  findByRoom(roomId: string, startDate?: Date, endDate?: Date): Promise<UsageMetric[]>;
  findByStudent(studentId: string, startDate?: Date, endDate?: Date): Promise<UsageMetric[]>;
  getAggregatedMetrics(type: MetricType, startDate: Date, endDate: Date): Promise<any>;
}

