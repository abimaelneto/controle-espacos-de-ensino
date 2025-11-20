import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MySQLRoomRepositoryAdapter } from './mysql-room.repository.adapter';
import { RoomEntity } from './room.entity';
import { RoomMapper } from './room.mapper';
import { Room } from '../../../../domain/entities/room.entity';
import { RoomNumber } from '../../../../domain/value-objects/room-number.vo';
import { Capacity } from '../../../../domain/value-objects/capacity.vo';
import { RoomType } from '../../../../domain/value-objects/room-type.vo';

describe('MySQLRoomRepositoryAdapter', () => {
  let adapter: MySQLRoomRepositoryAdapter;
  let repository: jest.Mocked<Repository<RoomEntity>>;

  beforeEach(async () => {
    const mockRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MySQLRoomRepositoryAdapter,
        {
          provide: getRepositoryToken(RoomEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    adapter = module.get<MySQLRoomRepositoryAdapter>(
      MySQLRoomRepositoryAdapter,
    );
    repository = module.get(getRepositoryToken(RoomEntity));
  });

  describe('findById', () => {
    it('should return room when found', async () => {
      const entity = new RoomEntity();
      entity.id = 'room-123';
      entity.roomNumber = 'A101';
      entity.capacity = 30;
      entity.type = 'CLASSROOM';
      entity.description = 'Sala de aula';
      entity.hasEquipment = false;
      entity.status = 'ACTIVE';
      entity.createdAt = new Date();
      entity.updatedAt = new Date();

      repository.findOne.mockResolvedValue(entity);

      const result = await adapter.findById('room-123');

      expect(result).toBeDefined();
      expect(result?.getId()).toBe('room-123');
      expect(result?.getRoomNumber().toString()).toBe('A101');
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'room-123' },
      });
    });

    it('should return null when not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await adapter.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('should save new room', async () => {
      const room = Room.create(
        new RoomNumber('A101'),
        new Capacity(30),
        new RoomType('CLASSROOM'),
        'Sala de aula',
      );

      const entity = new RoomEntity();
      entity.id = room.getId();
      Object.assign(entity, RoomMapper.toPersistence(room));

      repository.create.mockReturnValue(entity);
      repository.save.mockResolvedValue(entity);

      await adapter.save(room);

      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('existsByRoomNumber', () => {
    it('should return true if room number exists', async () => {
      const entity = new RoomEntity();
      entity.roomNumber = 'A101';

      repository.findOne.mockResolvedValue(entity);

      const result = await adapter.existsByRoomNumber(new RoomNumber('A101'));

      expect(result).toBe(true);
    });

    it('should return false if room number does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await adapter.existsByRoomNumber(new RoomNumber('A101'));

      expect(result).toBe(false);
    });
  });
});

