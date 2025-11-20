import { Room } from '../../entities/room.entity';
import { RoomNumber } from '../../value-objects/room-number.vo';
import { RoomType } from '../../value-objects/room-type.vo';

/**
 * Port: Interface para repositório de salas
 * Implementado por adapters (MySQL, RDS, etc.)
 */
export interface IRoomRepository {
  findById(id: string): Promise<Room | null>;
  findByRoomNumber(roomNumber: RoomNumber): Promise<Room | null>;
  findByType(type: RoomType): Promise<Room[]>;
  findAll(includeInactive?: boolean): Promise<Room[]>;
  findAvailable(): Promise<Room[]>;
  save(room: Room): Promise<void>;
  delete(id: string): Promise<void>;
  existsByRoomNumber(roomNumber: RoomNumber): Promise<boolean>;
}

