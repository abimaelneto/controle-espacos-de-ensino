import { Injectable } from '@nestjs/common';
import { Counter, Gauge, Registry } from 'prom-client';

@Injectable()
export class BusinessMetricsService {
  private readonly registry: Registry;

  // Business Metrics
  private readonly roomsCreated: Counter<string>;
  private readonly roomsUpdated: Counter<string>;
  private readonly roomsDeleted: Counter<string>;
  private readonly roomsActive: Gauge<string>;
  private readonly roomsTotal: Gauge<string>;
  private readonly roomsByType: Gauge<string>;

  constructor() {
    this.registry = new Registry();

    this.roomsCreated = new Counter({
      name: 'rooms_created_total',
      help: 'Total number of rooms created',
      labelNames: ['type'],
      registers: [this.registry],
    });

    this.roomsUpdated = new Counter({
      name: 'rooms_updated_total',
      help: 'Total number of rooms updated',
      registers: [this.registry],
    });

    this.roomsDeleted = new Counter({
      name: 'rooms_deleted_total',
      help: 'Total number of rooms deleted (soft delete)',
      registers: [this.registry],
    });

    this.roomsActive = new Gauge({
      name: 'rooms_active',
      help: 'Number of active rooms',
      registers: [this.registry],
    });

    this.roomsTotal = new Gauge({
      name: 'rooms_total',
      help: 'Total number of rooms (including inactive)',
      registers: [this.registry],
    });

    this.roomsByType = new Gauge({
      name: 'rooms_by_type',
      help: 'Number of rooms by type',
      labelNames: ['type'],
      registers: [this.registry],
    });
  }

  incrementRoomsCreated(type: string) {
    this.roomsCreated.inc({ type });
  }

  incrementRoomsUpdated() {
    this.roomsUpdated.inc();
  }

  incrementRoomsDeleted() {
    this.roomsDeleted.inc();
  }

  setRoomsActive(count: number) {
    this.roomsActive.set(count);
  }

  setRoomsTotal(count: number) {
    this.roomsTotal.set(count);
  }

  setRoomsByType(type: string, count: number) {
    this.roomsByType.set({ type }, count);
  }

  getRegistry(): Registry {
    return this.registry;
  }
}

