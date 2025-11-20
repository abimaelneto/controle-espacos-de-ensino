import { Injectable } from '@nestjs/common';
import { Counter, Gauge, Histogram, Registry } from 'prom-client';

@Injectable()
export class BusinessMetricsService {
  private readonly registry: Registry;

  // Business Metrics
  private readonly checkinsPerformed: Counter<string>;
  private readonly checkinsFailed: Counter<string>;
  private readonly checkinsByRoom: Counter<string>;
  private readonly checkinsByMethod: Counter<string>;
  private readonly activeCheckins: Gauge<string>;
  private readonly checkinDuration: Histogram<string>;
  private readonly roomOccupancy: Gauge<string>;
  private readonly roomCapacity: Gauge<string>;

  constructor() {
    this.registry = new Registry();

    this.checkinsPerformed = new Counter({
      name: 'checkins_performed_total',
      help: 'Total number of check-ins performed',
      labelNames: ['room_id', 'room_type'],
      registers: [this.registry],
    });

    this.checkinsFailed = new Counter({
      name: 'checkins_failed_total',
      help: 'Total number of failed check-ins',
      labelNames: ['reason'],
      registers: [this.registry],
    });

    this.checkinsByRoom = new Counter({
      name: 'checkins_by_room_total',
      help: 'Total check-ins by room',
      labelNames: ['room_id', 'room_number'],
      registers: [this.registry],
    });

    this.checkinsByMethod = new Counter({
      name: 'checkins_by_method_total',
      help: 'Total check-ins by identification method',
      labelNames: ['method'],
      registers: [this.registry],
    });

    this.activeCheckins = new Gauge({
      name: 'active_checkins',
      help: 'Number of active check-ins',
      labelNames: ['room_id'],
      registers: [this.registry],
    });

    this.checkinDuration = new Histogram({
      name: 'checkin_duration_seconds',
      help: 'Time taken to process check-in',
      labelNames: ['room_id'],
      buckets: [0.1, 0.5, 1, 2, 5],
      registers: [this.registry],
    });

    this.roomOccupancy = new Gauge({
      name: 'room_occupancy',
      help: 'Current occupancy of rooms',
      labelNames: ['room_id', 'room_number'],
      registers: [this.registry],
    });

    this.roomCapacity = new Gauge({
      name: 'room_capacity',
      help: 'Capacity of rooms',
      labelNames: ['room_id', 'room_number'],
      registers: [this.registry],
    });
  }

  incrementCheckinsPerformed(roomId: string, roomType: string) {
    this.checkinsPerformed.inc({ room_id: roomId, room_type: roomType });
  }

  incrementCheckinsFailed(reason: string) {
    this.checkinsFailed.inc({ reason });
  }

  incrementCheckinsByRoom(roomId: string, roomNumber: string) {
    this.checkinsByRoom.inc({ room_id: roomId, room_number: roomNumber });
  }

  incrementCheckinsByMethod(method: string) {
    this.checkinsByMethod.inc({ method });
  }

  setActiveCheckins(roomId: string, count: number) {
    this.activeCheckins.set({ room_id: roomId }, count);
  }

  recordCheckinDuration(roomId: string, duration: number) {
    this.checkinDuration.observe({ room_id: roomId }, duration);
  }

  setRoomOccupancy(roomId: string, roomNumber: string, occupancy: number) {
    this.roomOccupancy.set({ room_id: roomId, room_number: roomNumber }, occupancy);
  }

  setRoomCapacity(roomId: string, roomNumber: string, capacity: number) {
    this.roomCapacity.set({ room_id: roomId, room_number: roomNumber }, capacity);
  }

  getRegistry(): Registry {
    return this.registry;
  }
}

