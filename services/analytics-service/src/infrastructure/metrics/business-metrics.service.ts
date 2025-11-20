import { Injectable } from '@nestjs/common';
import { Counter, Gauge, Registry } from 'prom-client';

@Injectable()
export class BusinessMetricsService {
  private readonly registry: Registry;

  private readonly checkInsTotal: Counter<string>;
  private readonly checkInsByRoom: Counter<string>;
  private readonly uniqueStudentsGauge: Gauge<string>;
  private readonly roomLastCheckInGauge: Gauge<string>;

  private readonly uniqueStudents = new Set<string>();

  constructor() {
    this.registry = new Registry();

    this.checkInsTotal = new Counter({
      name: 'analytics_checkins_total',
      help: 'Total de check-ins processados pelo Analytics Service',
      labelNames: ['room_id'],
      registers: [this.registry],
    });

    this.checkInsByRoom = new Counter({
      name: 'analytics_checkins_by_room_total',
      help: 'Total de check-ins por sala',
      labelNames: ['room_id'],
      registers: [this.registry],
    });

    this.uniqueStudentsGauge = new Gauge({
      name: 'analytics_unique_students',
      help: 'Quantidade de estudantes únicos processados',
      registers: [this.registry],
    });

    this.roomLastCheckInGauge = new Gauge({
      name: 'analytics_room_last_checkin_timestamp',
      help: 'Timestamp do último check-in registrado por sala',
      labelNames: ['room_id'],
      registers: [this.registry],
    });
  }

  incrementCheckIns(roomId: string) {
    this.checkInsTotal.inc({ room_id: roomId });
    this.checkInsByRoom.inc({ room_id: roomId });
  }

  trackStudent(studentId: string) {
    if (!this.uniqueStudents.has(studentId)) {
      this.uniqueStudents.add(studentId);
      this.uniqueStudentsGauge.set(this.uniqueStudents.size);
    }
  }

  updateRoomLastCheckIn(roomId: string, checkInTimestamp: number) {
    this.roomLastCheckInGauge.set({ room_id: roomId }, checkInTimestamp);
  }

  getRegistry(): Registry {
    return this.registry;
  }
}


