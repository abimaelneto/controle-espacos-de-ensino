import { Injectable, OnModuleInit } from '@nestjs/common';
import { IEventConsumer } from '../../domain/ports/messaging/event-consumer.port';
import { AttendanceEventHandlerService } from '../../application/services/attendance-event-handler.service';
import { IDomainEvent } from '../../domain/events/domain-event.interface';

@Injectable()
export class AttendanceEventsConsumer implements OnModuleInit {
  constructor(
    private readonly eventConsumer: IEventConsumer,
    private readonly eventHandler: AttendanceEventHandlerService,
  ) {}

  async onModuleInit() {
    await this.eventConsumer.subscribe(
      'attendance.events',
      async (event: IDomainEvent) => {
        switch (event.eventType) {
          case 'AttendanceCheckedIn':
            await this.eventHandler.handleAttendanceCheckedIn(event);
            break;
          default:
            console.warn(`Unknown event type: ${event.eventType}`);
        }
      },
    );
  }
}

