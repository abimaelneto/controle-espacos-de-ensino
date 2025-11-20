import { DeleteRoomUseCase } from './delete-room.use-case';
import { IRoomRepository } from '../../domain/ports/repositories/room.repository.port';
import { Room } from '../../domain/entities/room.entity';
import { RoomNumber } from '../../domain/value-objects/room-number.vo';
import { Capacity } from '../../domain/value-objects/capacity.vo';
import { RoomType } from '../../domain/value-objects/room-type.vo';

describe('DeleteRoomUseCase', () => {
  let useCase: DeleteRoomUseCase;
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

    useCase = new DeleteRoomUseCase(roomRepository);

    const roomNumber = new RoomNumber('A101');
    const capacity = new Capacity(30);
    const type = new RoomType('CLASSROOM');
    room = Room.create(roomNumber, capacity, type, 'Sala de aula');
  });

  describe('execute', () => {
    it('should deactivate room', async () => {
      roomRepository.findById.mockResolvedValue(room);
      roomRepository.save.mockResolvedValue(undefined);

      await useCase.execute(room.getId());

      expect(room.isActive()).toBe(false);
      expect(roomRepository.save).toHaveBeenCalled();
    });

    it('should throw error if room not found', async () => {
      roomRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('non-existent-id')).rejects.toThrow(
        'Sala não encontrada',
      );
    });
  });
});

