import { Controller, Get, Header } from '@nestjs/common';
import { register } from 'prom-client';
import { BusinessMetricsService } from '../../infrastructure/metrics/business-metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly businessMetrics: BusinessMetricsService) {}

  @Get()
  @Header('Content-Type', register.contentType)
  async getMetrics() {
    const businessRegistry = this.businessMetrics.getRegistry();
    const [defaultMetrics, businessMetrics] = await Promise.all([
      register.metrics(),
      businessRegistry.metrics(),
    ]);

    return `${defaultMetrics}\n${businessMetrics}`;
  }
}

