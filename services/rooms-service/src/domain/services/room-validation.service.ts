import { IRoomRepository } from '../ports/repositories/room.repository.port';
import { RoomNumber } from '../value-objects/room-number.vo';

export class RoomValidationService {
  constructor(private readonly roomRepository: IRoomRepository) {}

  async validateRoomNumberUniqueness(roomNumber: RoomNumber): Promise<boolean> {
    const exists = await this.roomRepository.existsByRoomNumber(roomNumber);
    return !exists;
  }
}

