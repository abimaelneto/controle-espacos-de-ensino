import { IRoomRepository } from '../../domain/ports/repositories/room.repository.port';
import { Room } from '../../domain/entities/room.entity';

export class GetRoomUseCase {
  constructor(private readonly roomRepository: IRoomRepository) {}

  async execute(id: string): Promise<Room | null> {
    return this.roomRepository.findById(id);
  }
}

