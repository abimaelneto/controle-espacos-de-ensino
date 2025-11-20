import { GetRoomUseCase } from './get-room.use-case';
import { IRoomRepository } from '../../domain/ports/repositories/room.repository.port';
import { Room } from '../../domain/entities/room.entity';
import { RoomNumber } from '../../domain/value-objects/room-number.vo';
import { Capacity } from '../../domain/value-objects/capacity.vo';
import { RoomType } from '../../domain/value-objects/room-type.vo';

describe('GetRoomUseCase', () => {
  let useCase: GetRoomUseCase;
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

    useCase = new GetRoomUseCase(roomRepository);

    const roomNumber = new RoomNumber('A101');
    const capacity = new Capacity(30);
    const type = new RoomType('CLASSROOM');
    room = Room.create(roomNumber, capacity, type, 'Sala de aula');
  });

  describe('execute', () => {
    it('should return room when found', async () => {
      roomRepository.findById.mockResolvedValue(room);

      const result = await useCase.execute(room.getId());

      expect(result).toBe(room);
      expect(roomRepository.findById).toHaveBeenCalledWith(room.getId());
    });

    it('should return null when room not found', async () => {
      roomRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute('non-existent-id');

      expect(result).toBeNull();
    });
  });
});

