import { IDomainEvent } from './domain-event.interface';
import { Room } from '../entities/room.entity';

export class RoomCreatedEvent implements IDomainEvent {
  readonly eventType = 'RoomCreated';
  readonly aggregateId: string;
  readonly occurredAt: Date;
  readonly topic = 'room.events';
  readonly payload: {
    roomId: string;
    roomNumber: string;
    capacity: number;
    type: string;
  };

  constructor(room: Room) {
    this.aggregateId = room.getId();
    this.occurredAt = new Date();
    this.payload = {
      roomId: room.getId(),
      roomNumber: room.getRoomNumber().toString(),
      capacity: room.getCapacity().getValue(),
      type: room.getType().getValue(),
    };
  }
}

