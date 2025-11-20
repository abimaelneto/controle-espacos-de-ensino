import { Room } from '../../../../domain/entities/room.entity';
import { RoomEntity } from './room.entity';
import { RoomNumber } from '../../../../domain/value-objects/room-number.vo';
import { Capacity } from '../../../../domain/value-objects/capacity.vo';
import { RoomType } from '../../../../domain/value-objects/room-type.vo';

export class RoomMapper {
  static toDomain(entity: RoomEntity): Room {
    return Room.reconstitute(
      entity.id,
      new RoomNumber(entity.roomNumber),
      new Capacity(entity.capacity),
      new RoomType(entity.type),
      entity.description || '',
      entity.hasEquipment,
      entity.status,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toPersistence(room: Room): Omit<RoomEntity, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      roomNumber: room.getRoomNumber().toString(),
      capacity: room.getCapacity().getValue(),
      type: room.getType().getValue(),
      description: room.getDescription(),
      hasEquipment: room.hasEquipment(),
      status: room.getStatus(),
    };
  }
}

