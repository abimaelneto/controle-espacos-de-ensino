import { RoomNumber } from './room-number.vo';

describe('RoomNumber Value Object', () => {
  describe('constructor', () => {
    it('should create a valid room number', () => {
      const roomNumber = new RoomNumber('A101');
      expect(roomNumber.toString()).toBe('A101');
    });

    it('should trim whitespace', () => {
      const roomNumber = new RoomNumber('  A101  ');
      expect(roomNumber.toString()).toBe('A101');
    });

    it('should throw error for empty room number', () => {
      expect(() => new RoomNumber('')).toThrow('Número da sala não pode ser vazio');
      expect(() => new RoomNumber('   ')).toThrow('Número da sala não pode ser vazio');
    });

    it('should throw error for room number too short', () => {
      expect(() => new RoomNumber('A1')).toThrow('Número da sala deve ter no mínimo 3 caracteres');
    });

    it('should throw error for room number too long', () => {
      expect(() => new RoomNumber('A'.repeat(21))).toThrow('Número da sala deve ter no máximo 20 caracteres');
    });

    it('should accept alphanumeric room numbers', () => {
      expect(() => new RoomNumber('A101')).not.toThrow();
      expect(() => new RoomNumber('LAB-01')).not.toThrow();
      expect(() => new RoomNumber('SALA-202')).not.toThrow();
    });
  });

  describe('equals', () => {
    it('should return true for same room number', () => {
      const room1 = new RoomNumber('A101');
      const room2 = new RoomNumber('A101');
      expect(room1.equals(room2)).toBe(true);
    });

    it('should return true for room number with different case', () => {
      const room1 = new RoomNumber('A101');
      const room2 = new RoomNumber('a101');
      expect(room1.equals(room2)).toBe(true);
    });

    it('should return false for different room numbers', () => {
      const room1 = new RoomNumber('A101');
      const room2 = new RoomNumber('A102');
      expect(room1.equals(room2)).toBe(false);
    });
  });
});

