import { FullName } from './full-name.vo';

describe('FullName Value Object', () => {
  describe('constructor', () => {
    it('should create a valid full name', () => {
      const name = new FullName('João', 'Silva');
      expect(name).toBeDefined();
      expect(name.getFirstName()).toBe('João');
      expect(name.getLastName()).toBe('Silva');
    });

    it('should trim whitespace', () => {
      const name = new FullName('  João  ', '  Silva  ');
      expect(name.getFirstName()).toBe('João');
      expect(name.getLastName()).toBe('Silva');
    });

    it('should throw error for empty first name', () => {
      expect(() => new FullName('', 'Silva')).toThrow('Nome não pode ser vazio');
      expect(() => new FullName('   ', 'Silva')).toThrow('Nome não pode ser vazio');
    });

    it('should throw error for empty last name', () => {
      expect(() => new FullName('João', '')).toThrow('Sobrenome não pode ser vazio');
      expect(() => new FullName('João', '   ')).toThrow('Sobrenome não pode ser vazio');
    });

    it('should throw error for first name too short', () => {
      expect(() => new FullName('Jo', 'Silva')).toThrow('Nome deve ter no mínimo 3 caracteres');
    });

    it('should throw error for first name too long', () => {
      const longName = 'A'.repeat(51);
      expect(() => new FullName(longName, 'Silva')).toThrow('Nome deve ter no máximo 50 caracteres');
    });
  });

  describe('getFullName', () => {
    it('should return full name concatenated', () => {
      const name = new FullName('João', 'Silva');
      expect(name.getFullName()).toBe('João Silva');
    });
  });

  describe('getFirstName', () => {
    it('should return first name', () => {
      const name = new FullName('João', 'Silva');
      expect(name.getFirstName()).toBe('João');
    });
  });

  describe('getLastName', () => {
    it('should return last name', () => {
      const name = new FullName('João', 'Silva');
      expect(name.getLastName()).toBe('Silva');
    });
  });
});

