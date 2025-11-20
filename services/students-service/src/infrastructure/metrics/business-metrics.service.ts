import { Injectable } from '@nestjs/common';
import { Counter, Gauge, Registry } from 'prom-client';

@Injectable()
export class BusinessMetricsService {
  private readonly registry: Registry;

  // Business Metrics
  private readonly studentsCreated: Counter<string>;
  private readonly studentsUpdated: Counter<string>;
  private readonly studentsDeleted: Counter<string>;
  private readonly studentsActive: Gauge<string>;
  private readonly studentsTotal: Gauge<string>;

  constructor() {
    this.registry = new Registry();

    this.studentsCreated = new Counter({
      name: 'students_created_total',
      help: 'Total number of students created',
      labelNames: ['status'],
      registers: [this.registry],
    });

    this.studentsUpdated = new Counter({
      name: 'students_updated_total',
      help: 'Total number of students updated',
      registers: [this.registry],
    });

    this.studentsDeleted = new Counter({
      name: 'students_deleted_total',
      help: 'Total number of students deleted (soft delete)',
      registers: [this.registry],
    });

    this.studentsActive = new Gauge({
      name: 'students_active',
      help: 'Number of active students',
      registers: [this.registry],
    });

    this.studentsTotal = new Gauge({
      name: 'students_total',
      help: 'Total number of students (including inactive)',
      registers: [this.registry],
    });
  }

  incrementStudentsCreated(status: string = 'ACTIVE') {
    this.studentsCreated.inc({ status });
  }

  incrementStudentsUpdated() {
    this.studentsUpdated.inc();
  }

  incrementStudentsDeleted() {
    this.studentsDeleted.inc();
  }

  setStudentsActive(count: number) {
    this.studentsActive.set(count);
  }

  setStudentsTotal(count: number) {
    this.studentsTotal.set(count);
  }

  getRegistry(): Registry {
    return this.registry;
  }
}

