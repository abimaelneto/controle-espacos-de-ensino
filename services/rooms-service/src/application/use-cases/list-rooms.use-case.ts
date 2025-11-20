import { IRoomRepository } from '../../domain/ports/repositories/room.repository.port';
import { Room } from '../../domain/entities/room.entity';

export class ListRoomsUseCase {
  constructor(private readonly roomRepository: IRoomRepository) {}

  async execute(includeInactive = false): Promise<Room[]> {
    return this.roomRepository.findAll(includeInactive);
  }
}

