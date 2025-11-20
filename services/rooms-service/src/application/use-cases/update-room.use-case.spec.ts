import { UpdateRoomUseCase } from './update-room.use-case';
import { IRoomRepository } from '../../domain/ports/repositories/room.repository.port';
import { Room } from '../../domain/entities/room.entity';
import { RoomNumber } from '../../domain/value-objects/room-number.vo';
import { Capacity } from '../../domain/value-objects/capacity.vo';
import { RoomType } from '../../domain/value-objects/room-type.vo';
import { UpdateRoomDto } from '../dto/update-room.dto';

describe('UpdateRoomUseCase', () => {
  let useCase: UpdateRoomUseCase;
  let roomRepository: jest.Mocked<IRoomRepository>;
  let room: Room;

  beforeEach(() => {
    roomRepository = {
      findById: jest.fn(),
      findByRoomNumber: jest.fn(),
      findByType: jest.fn(),
      findAll: jest.fn(),
      findAvailable: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      existsByRoomNumber: jest.fn(),
    };

    useCase = new UpdateRoomUseCase(roomRepository);

    const roomNumber = new RoomNumber('A101');
    const capacity = new Capacity(30);
    const type = new RoomType('CLASSROOM');
    room = Room.create(roomNumber, capacity, type, 'Sala de aula');
  });

  describe('execute', () => {
    it('should update room capacity', async () => {
      roomRepository.findById.mockResolvedValue(room);
      roomRepository.save.mockResolvedValue(undefined);

      const updateDto: UpdateRoomDto = {
        capacity: 50,
      };

      const result = await useCase.execute(room.getId(), updateDto);

      expect(result.getCapacity().getValue()).toBe(50);
      expect(roomRepository.save).toHaveBeenCalled();
    });

    it('should update room description', async () => {
      roomRepository.findById.mockResolvedValue(room);
      roomRepository.save.mockResolvedValue(undefined);

      const updateDto: UpdateRoomDto = {
        description: 'Nova descrição',
      };

      const result = await useCase.execute(room.getId(), updateDto);

      expect(result.getDescription()).toBe('Nova descrição');
    });

    it('should throw error if room not found', async () => {
      roomRepository.findById.mockResolvedValue(null);

      const updateDto: UpdateRoomDto = {
        capacity: 50,
      };

      await expect(useCase.execute('non-existent-id', updateDto)).rejects.toThrow(
        'Sala não encontrada',
      );
    });
  });
});

