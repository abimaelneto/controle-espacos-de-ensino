import { Room } from './room.entity';
import { RoomNumber } from '../value-objects/room-number.vo';
import { Capacity } from '../value-objects/capacity.vo';
import { RoomType } from '../value-objects/room-type.vo';

describe('Room Entity', () => {
  let room: Room;
  let roomNumber: RoomNumber;
  let capacity: Capacity;
  let roomType: RoomType;

  beforeEach(() => {
    roomNumber = new RoomNumber('A101');
    capacity = new Capacity(30);
    roomType = new RoomType('CLASSROOM');
  });

  describe('create', () => {
    it('should create a new room', () => {
      room = Room.create(roomNumber, capacity, roomType, 'Sala de aula padrão');

      expect(room).toBeDefined();
      expect(room.getId()).toBeDefined();
      expect(room.getRoomNumber().equals(roomNumber)).toBe(true);
      expect(room.getCapacity().equals(capacity)).toBe(true);
      expect(room.getType().equals(roomType)).toBe(true);
      expect(room.getDescription()).toBe('Sala de aula padrão');
      expect(room.isActive()).toBe(true);
      expect(room.hasEquipment()).toBe(false);
    });

    it('should create room with equipment', () => {
      room = Room.create(
        roomNumber,
        capacity,
        roomType,
        'Sala com equipamentos',
        true,
      );

      expect(room.hasEquipment()).toBe(true);
    });
  });

  describe('activate', () => {
    it('should activate room', () => {
      room = Room.create(roomNumber, capacity, roomType, 'Descrição');
      room.deactivate();
      expect(room.isActive()).toBe(false);

      room.activate();
      expect(room.isActive()).toBe(true);
    });
  });

  describe('deactivate', () => {
    it('should deactivate room', () => {
      room = Room.create(roomNumber, capacity, roomType, 'Descrição');
      expect(room.isActive()).toBe(true);

      room.deactivate();
      expect(room.isActive()).toBe(false);
    });
  });

  describe('updateCapacity', () => {
    it('should update room capacity', () => {
      room = Room.create(roomNumber, capacity, roomType, 'Descrição');
      const newCapacity = new Capacity(50);

      room.updateCapacity(newCapacity);
      expect(room.getCapacity().equals(newCapacity)).toBe(true);
    });
  });

  describe('updateDescription', () => {
    it('should update room description', () => {
      room = Room.create(roomNumber, capacity, roomType, 'Descrição antiga');

      room.updateDescription('Nova descrição');
      expect(room.getDescription()).toBe('Nova descrição');
    });
  });

  describe('isAvailable', () => {
    it('should return true for active room', () => {
      room = Room.create(roomNumber, capacity, roomType, 'Descrição');
      expect(room.isAvailable()).toBe(true);
    });

    it('should return false for inactive room', () => {
      room = Room.create(roomNumber, capacity, roomType, 'Descrição');
      room.deactivate();
      expect(room.isAvailable()).toBe(false);
    });
  });
});

