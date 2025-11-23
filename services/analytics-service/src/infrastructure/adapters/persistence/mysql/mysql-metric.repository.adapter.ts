import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IMetricRepository } from '../../../../domain/ports/repositories/metric.repository.port';
import { UsageMetric } from '../../../../domain/entities/usage-metric.entity';
import { MetricType } from '../../../../domain/entities/usage-metric.entity';
import { MetricEntity } from './metric.entity';

@Injectable()
export class MySQLMetricRepositoryAdapter implements IMetricRepository {
  constructor(
    @InjectRepository(MetricEntity)
    private readonly repository: Repository<MetricEntity>,
  ) {}

  async save(metric: UsageMetric): Promise<void> {
    const entity = this.repository.create({
      id: metric.getId(),
      metricType: metric.getMetricType(),
      roomId: metric.getRoomId(),
      studentId: metric.getStudentId(),
      value: metric.getValue(),
      metadata: metric.getMetadata(),
      recordedAt: metric.getRecordedAt(),
      createdAt: metric.getCreatedAt(),
    });

    await this.repository.save(entity);
  }

  async findByType(
    type: MetricType,
    startDate?: Date,
    endDate?: Date,
  ): Promise<UsageMetric[]> {
    const queryBuilder = this.repository.createQueryBuilder('metric')
      .where('metric.metricType = :type', { type });

    if (startDate) {
      queryBuilder.andWhere('metric.recordedAt >= :startDate', { startDate });
    }
    if (endDate) {
      queryBuilder.andWhere('metric.recordedAt <= :endDate', { endDate });
    }

    const entities = await queryBuilder.getMany();
    return entities.map((entity) => this.toDomain(entity));
  }

  async findByRoom(
    roomId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<UsageMetric[]> {
    const queryBuilder = this.repository.createQueryBuilder('metric')
      .where('metric.roomId = :roomId', { roomId });

    if (startDate) {
      queryBuilder.andWhere('metric.recordedAt >= :startDate', { startDate });
    }
    if (endDate) {
      queryBuilder.andWhere('metric.recordedAt <= :endDate', { endDate });
    }

    const entities = await queryBuilder.getMany();
    return entities.map((entity) => this.toDomain(entity));
  }

  async findByStudent(
    studentId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<UsageMetric[]> {
    const queryBuilder = this.repository.createQueryBuilder('metric')
      .where('metric.studentId = :studentId', { studentId });

    if (startDate) {
      queryBuilder.andWhere('metric.recordedAt >= :startDate', { startDate });
    }
    if (endDate) {
      queryBuilder.andWhere('metric.recordedAt <= :endDate', { endDate });
    }

    const entities = await queryBuilder.getMany();
    return entities.map((entity) => this.toDomain(entity));
  }

  async getAggregatedMetrics(
    type: MetricType,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    const result = await this.repository
      .createQueryBuilder('metric')
      .select('SUM(metric.value)', 'total')
      .addSelect('AVG(metric.value)', 'average')
      .addSelect('COUNT(metric.id)', 'count')
      .where('metric.metricType = :type', { type })
      .andWhere('metric.recordedAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getRawOne();

    return {
      total: parseFloat(result.total) || 0,
      average: parseFloat(result.average) || 0,
      count: parseInt(result.count) || 0,
    };
  }

  private toDomain(entity: MetricEntity): UsageMetric {
    return UsageMetric.reconstitute(
      entity.id,
      entity.metricType as MetricType,
      entity.roomId,
      entity.studentId,
      parseFloat(entity.value.toString()),
      entity.metadata || {},
      entity.recordedAt,
      entity.createdAt,
    );
  }
}

