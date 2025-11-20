import { ListRoomsUseCase } from './list-rooms.use-case';
import { IRoomRepository } from '../../domain/ports/repositories/room.repository.port';
import { Room } from '../../domain/entities/room.entity';
import { RoomNumber } from '../../domain/value-objects/room-number.vo';
import { Capacity } from '../../domain/value-objects/capacity.vo';
import { RoomType } from '../../domain/value-objects/room-type.vo';

describe('ListRoomsUseCase', () => {
  let useCase: ListRoomsUseCase;
  let roomRepository: jest.Mocked<IRoomRepository>;
  let rooms: Room[];

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

    useCase = new ListRoomsUseCase(roomRepository);

    const room1 = Room.create(
      new RoomNumber('A101'),
      new Capacity(30),
      new RoomType('CLASSROOM'),
      'Sala 1',
    );

    const room2 = Room.create(
      new RoomNumber('A102'),
      new Capacity(50),
      new RoomType('LABORATORY'),
      'Sala 2',
    );

    rooms = [room1, room2];
  });

  describe('execute', () => {
    it('should return all active rooms by default', async () => {
      roomRepository.findAll.mockResolvedValue(rooms);

      const result = await useCase.execute();

      expect(result).toEqual(rooms);
      expect(roomRepository.findAll).toHaveBeenCalledWith(false);
    });

    it('should return all rooms including inactive when requested', async () => {
      roomRepository.findAll.mockResolvedValue(rooms);

      const result = await useCase.execute(true);

      expect(result).toEqual(rooms);
      expect(roomRepository.findAll).toHaveBeenCalledWith(true);
    });
  });
});

