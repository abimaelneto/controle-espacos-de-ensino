import { CreateRoomUseCase } from './create-room.use-case';
import { IRoomRepository } from '../../domain/ports/repositories/room.repository.port';
import { IEventPublisher } from '../../domain/ports/messaging/event-publisher.port';
import { RoomValidationService } from '../../domain/services/room-validation.service';
import { Room } from '../../domain/entities/room.entity';
import { RoomNumber } from '../../domain/value-objects/room-number.vo';
import { Capacity } from '../../domain/value-objects/capacity.vo';
import { RoomType } from '../../domain/value-objects/room-type.vo';
import { CreateRoomDto } from '../dto/create-room.dto';
import { RoomCreatedEvent } from '../../domain/events/room-created.event';

describe('CreateRoomUseCase', () => {
  let useCase: CreateRoomUseCase;
  let roomRepository: jest.Mocked<IRoomRepository>;
  let eventPublisher: jest.Mocked<IEventPublisher>;
  let validationService: jest.Mocked<RoomValidationService>;
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

    eventPublisher = {
      publish: jest.fn(),
      publishMany: jest.fn(),
    };

    validationService = {
      validateRoomNumberUniqueness: jest.fn(),
    } as any;

    useCase = new CreateRoomUseCase(
      roomRepository,
      eventPublisher,
      validationService,
    );

    const roomNumber = new RoomNumber('A101');
    const capacity = new Capacity(30);
    const type = new RoomType('CLASSROOM');
    room = Room.create(roomNumber, capacity, type, 'Sala de aula');
  });

  describe('execute', () => {
    it('should create room successfully', async () => {
      const createRoomDto: CreateRoomDto = {
        roomNumber: 'A101',
        capacity: 30,
        type: 'CLASSROOM',
        description: 'Sala de aula',
        hasEquipment: false,
      };

      validationService.validateRoomNumberUniqueness.mockResolvedValue(true);
      roomRepository.save.mockResolvedValue(undefined);
      eventPublisher.publish.mockResolvedValue(undefined);

      const result = await useCase.execute(createRoomDto);

      expect(result).toBeDefined();
      expect(result.getId()).toBeDefined();
      expect(result.getRoomNumber().toString()).toBe('A101');
      expect(result.getCapacity().getValue()).toBe(30);
      expect(result.getType().getValue()).toBe('CLASSROOM');
      expect(result.getDescription()).toBe('Sala de aula');
      expect(result.isActive()).toBe(true);

      expect(validationService.validateRoomNumberUniqueness).toHaveBeenCalled();
      expect(roomRepository.save).toHaveBeenCalled();
      expect(eventPublisher.publish).toHaveBeenCalledWith(
        expect.any(RoomCreatedEvent),
      );
    });

    it('should throw error if room number already exists', async () => {
      const createRoomDto: CreateRoomDto = {
        roomNumber: 'A101',
        capacity: 30,
        type: 'CLASSROOM',
      };

      validationService.validateRoomNumberUniqueness.mockResolvedValue(false);

      await expect(useCase.execute(createRoomDto)).rejects.toThrow(
        'Número da sala já cadastrado',
      );

      expect(roomRepository.save).not.toHaveBeenCalled();
      expect(eventPublisher.publish).not.toHaveBeenCalled();
    });
  });
});

