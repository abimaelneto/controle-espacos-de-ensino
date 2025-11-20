import { IRoomRepository } from '../../domain/ports/repositories/room.repository.port';
import { Room } from '../../domain/entities/room.entity';

export class DeleteRoomUseCase {
  constructor(private readonly roomRepository: IRoomRepository) {}

  async execute(id: string): Promise<void> {
    const room = await this.roomRepository.findById(id);

    if (!room) {
      throw new Error('Sala não encontrada');
    }

    room.deactivate();
    await this.roomRepository.save(room);
  }
}

