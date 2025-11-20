import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Gauge, Registry } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly registry: Registry;

  // HTTP Metrics
  private readonly httpRequestDuration: Histogram<string>;
  private readonly httpRequestTotal: Counter<string>;
  private readonly httpRequestErrors: Counter<string>;

  // Business Metrics
  private readonly studentsCreated: Counter<string>;
  private readonly roomsCreated: Counter<string>;
  private readonly checkInsPerformed: Counter<string>;
  private readonly activeCheckIns: Gauge<string>;

  constructor() {
    this.registry = new Registry();

    // HTTP Metrics
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.5, 1, 2, 5],
      registers: [this.registry],
    });

    this.httpRequestTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });

    this.httpRequestErrors = new Counter({
      name: 'http_request_errors_total',
      help: 'Total number of HTTP request errors',
      labelNames: ['method', 'route', 'error_type'],
      registers: [this.registry],
    });

    // Business Metrics
    this.studentsCreated = new Counter({
      name: 'students_created_total',
      help: 'Total number of students created',
      registers: [this.registry],
    });

    this.roomsCreated = new Counter({
      name: 'rooms_created_total',
      help: 'Total number of rooms created',
      registers: [this.registry],
    });

    this.checkInsPerformed = new Counter({
      name: 'checkins_performed_total',
      help: 'Total number of check-ins performed',
      labelNames: ['room_id'],
      registers: [this.registry],
    });

    this.activeCheckIns = new Gauge({
      name: 'active_checkins',
      help: 'Number of active check-ins',
      labelNames: ['room_id'],
      registers: [this.registry],
    });
  }

  // HTTP Metrics
  recordHttpRequest(method: string, route: string, statusCode: number, duration: number) {
    this.httpRequestDuration.observe({ method, route, status_code: statusCode.toString() }, duration);
    this.httpRequestTotal.inc({ method, route, status_code: statusCode.toString() });

    if (statusCode >= 400) {
      this.httpRequestErrors.inc({ method, route, error_type: statusCode >= 500 ? 'server_error' : 'client_error' });
    }
  }

  // Business Metrics
  incrementStudentsCreated() {
    this.studentsCreated.inc();
  }

  incrementRoomsCreated() {
    this.roomsCreated.inc();
  }

  incrementCheckInsPerformed(roomId: string) {
    this.checkInsPerformed.inc({ room_id: roomId });
    this.activeCheckIns.inc({ room_id: roomId });
  }

  decrementActiveCheckIns(roomId: string) {
    this.activeCheckIns.dec({ room_id: roomId });
  }

  setActiveCheckIns(roomId: string, value: number) {
    this.activeCheckIns.set({ room_id: roomId }, value);
  }

  getRegistry(): Registry {
    return this.registry;
  }
}

