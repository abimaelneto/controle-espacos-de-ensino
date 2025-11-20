import { CPF } from './cpf.vo';

describe('CPF Value Object', () => {
  describe('constructor', () => {
    it('should create a valid CPF', () => {
      const cpf = new CPF('12345678909');
      expect(cpf).toBeDefined();
      expect(cpf.toString()).toBe('12345678909');
    });

    it('should sanitize CPF removing dots and dashes', () => {
      const cpf = new CPF('123.456.789-09');
      expect(cpf.toString()).toBe('12345678909');
    });

    it('should throw error for invalid CPF format', () => {
      expect(() => new CPF('123')).toThrow('CPF inválido');
      expect(() => new CPF('123456789012')).toThrow('CPF inválido');
    });

    it('should throw error for CPF with all same digits', () => {
      expect(() => new CPF('11111111111')).toThrow('CPF inválido');
      expect(() => new CPF('00000000000')).toThrow('CPF inválido');
    });

    it('should throw error for invalid CPF check digits', () => {
      expect(() => new CPF('12345678900')).toThrow('CPF inválido');
    });

    it('should accept valid CPF with check digits', () => {
      // CPF válido: 12345678909
      const cpf = new CPF('12345678909');
      expect(cpf.toString()).toBe('12345678909');
    });

    it('should throw error for empty CPF', () => {
      expect(() => new CPF('')).toThrow('CPF não pode ser vazio');
      expect(() => new CPF('   ')).toThrow('CPF não pode ser vazio');
    });
  });

  describe('equals', () => {
    it('should return true for same CPF', () => {
      const cpf1 = new CPF('12345678909');
      const cpf2 = new CPF('12345678909');
      expect(cpf1.equals(cpf2)).toBe(true);
    });

    it('should return true for CPF with different formatting', () => {
      const cpf1 = new CPF('123.456.789-09');
      const cpf2 = new CPF('12345678909');
      expect(cpf1.equals(cpf2)).toBe(true);
    });

    it('should return false for different CPFs', () => {
      const cpf1 = new CPF('12345678909');
      const cpf2 = new CPF('98765432100');
      expect(cpf1.equals(cpf2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return CPF as string without formatting', () => {
      const cpf = new CPF('123.456.789-09');
      expect(cpf.toString()).toBe('12345678909');
    });
  });
});

