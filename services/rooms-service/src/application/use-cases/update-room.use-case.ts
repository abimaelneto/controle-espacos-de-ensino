import { IRoomRepository } from '../../domain/ports/repositories/room.repository.port';
import { Room } from '../../domain/entities/room.entity';
import { Capacity } from '../../domain/value-objects/capacity.vo';
import { UpdateRoomDto } from '../dto/update-room.dto';

export class UpdateRoomUseCase {
  constructor(private readonly roomRepository: IRoomRepository) {}

  async execute(id: string, updateRoomDto: UpdateRoomDto): Promise<Room> {
    const room = await this.roomRepository.findById(id);

    if (!room) {
      throw new Error('Sala não encontrada');
    }

    // Atualizar capacidade se fornecido
    if (updateRoomDto.capacity !== undefined) {
      const newCapacity = new Capacity(updateRoomDto.capacity);
      room.updateCapacity(newCapacity);
    }

    // Atualizar descrição se fornecido
    if (updateRoomDto.description !== undefined) {
      room.updateDescription(updateRoomDto.description);
    }

    await this.roomRepository.save(room);

    return room;
  }
}

