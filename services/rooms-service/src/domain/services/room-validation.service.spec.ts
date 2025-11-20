import { RoomValidationService } from './room-validation.service';
import { IRoomRepository } from '../ports/repositories/room.repository.port';
import { RoomNumber } from '../value-objects/room-number.vo';

describe('RoomValidationService', () => {
  let service: RoomValidationService;
  let roomRepository: jest.Mocked<IRoomRepository>;

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

    service = new RoomValidationService(roomRepository);
  });

  describe('validateRoomNumberUniqueness', () => {
    it('should return true if room number does not exist', async () => {
      roomRepository.existsByRoomNumber.mockResolvedValue(false);

      const roomNumber = new RoomNumber('A101');
      const result = await service.validateRoomNumberUniqueness(roomNumber);

      expect(result).toBe(true);
      expect(roomRepository.existsByRoomNumber).toHaveBeenCalledWith(roomNumber);
    });

    it('should return false if room number already exists', async () => {
      roomRepository.existsByRoomNumber.mockResolvedValue(true);

      const roomNumber = new RoomNumber('A101');
      const result = await service.validateRoomNumberUniqueness(roomNumber);

      expect(result).toBe(false);
    });
  });
});

