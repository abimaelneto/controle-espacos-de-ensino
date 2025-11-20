import { RoomType } from './room-type.vo';

describe('RoomType Value Object', () => {
  describe('constructor', () => {
    it('should create valid room types', () => {
      expect(() => new RoomType('CLASSROOM')).not.toThrow();
      expect(() => new RoomType('LABORATORY')).not.toThrow();
      expect(() => new RoomType('AUDITORIUM')).not.toThrow();
      expect(() => new RoomType('STUDY_ROOM')).not.toThrow();
    });

    it('should throw error for invalid room type', () => {
      expect(() => new RoomType('INVALID')).toThrow('Tipo de sala inválido');
    });

    it('should accept lowercase and convert to uppercase', () => {
      const type = new RoomType('classroom');
      expect(type.getValue()).toBe('CLASSROOM');
    });
  });

  describe('getValue', () => {
    it('should return the room type value', () => {
      const type = new RoomType('CLASSROOM');
      expect(type.getValue()).toBe('CLASSROOM');
    });
  });

  describe('equals', () => {
    it('should return true for same room type', () => {
      const type1 = new RoomType('CLASSROOM');
      const type2 = new RoomType('CLASSROOM');
      expect(type1.equals(type2)).toBe(true);
    });

    it('should return false for different room types', () => {
      const type1 = new RoomType('CLASSROOM');
      const type2 = new RoomType('LABORATORY');
      expect(type1.equals(type2)).toBe(false);
    });
  });

  describe('isClassroom', () => {
    it('should return true for CLASSROOM', () => {
      const type = new RoomType('CLASSROOM');
      expect(type.isClassroom()).toBe(true);
    });

    it('should return false for other types', () => {
      const type = new RoomType('LABORATORY');
      expect(type.isClassroom()).toBe(false);
    });
  });

  describe('isLaboratory', () => {
    it('should return true for LABORATORY', () => {
      const type = new RoomType('LABORATORY');
      expect(type.isLaboratory()).toBe(true);
    });

    it('should return false for other types', () => {
      const type = new RoomType('CLASSROOM');
      expect(type.isLaboratory()).toBe(false);
    });
  });
});

