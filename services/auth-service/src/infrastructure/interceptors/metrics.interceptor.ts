import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Counter, Histogram, Registry } from 'prom-client';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  private readonly httpRequestDuration: Histogram<string>;
  private readonly httpRequestTotal: Counter<string>;
  private readonly registry: Registry;

  constructor() {
    this.registry = new Registry();

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code', 'service'],
      buckets: [0.1, 0.5, 1, 2, 5],
      registers: [this.registry],
    });

    this.httpRequestTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code', 'service'],
      registers: [this.registry],
    });
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const method = request.method;
    const route = request.route?.path || request.url;
    const service = 'auth-service';
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = (Date.now() - startTime) / 1000;
          const statusCode = response.statusCode;

          this.httpRequestDuration.observe(
            { method, route, status_code: statusCode.toString(), service },
            duration,
          );
          this.httpRequestTotal.inc({ method, route, status_code: statusCode.toString(), service });
        },
        error: (error) => {
          const duration = (Date.now() - startTime) / 1000;
          const statusCode = error.status || 500;

          this.httpRequestDuration.observe(
            { method, route, status_code: statusCode.toString(), service },
            duration,
          );
          this.httpRequestTotal.inc({ method, route, status_code: statusCode.toString(), service });
        },
      }),
    );
  }

  getRegistry(): Registry {
    return this.registry;
  }
}

