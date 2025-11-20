import { Module, Global } from '@nestjs/common';
import { PrometheusModule as NestPrometheusModule } from '@willsoto/nestjs-prometheus';
import { MetricsService } from './metrics.service';

@Global()
@Module({
  imports: [
    NestPrometheusModule.register({
      defaultMetrics: {
        enabled: true,
      },
      path: '/metrics',
    }),
  ],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}

