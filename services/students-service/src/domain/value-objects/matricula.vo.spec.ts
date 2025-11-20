import { Matricula } from './matricula.vo';

describe('Matricula Value Object', () => {
  describe('constructor', () => {
    it('should create a valid matricula', () => {
      const matricula = new Matricula('2024001234');
      expect(matricula).toBeDefined();
      expect(matricula.toString()).toBe('2024001234');
    });

    it('should trim whitespace', () => {
      const matricula = new Matricula('  2024001234  ');
      expect(matricula.toString()).toBe('2024001234');
    });

    it('should throw error for empty matricula', () => {
      expect(() => new Matricula('')).toThrow('Matrícula não pode ser vazia');
      expect(() => new Matricula('   ')).toThrow('Matrícula não pode ser vazia');
    });

    it('should throw error for matricula too short', () => {
      expect(() => new Matricula('123')).toThrow('Matrícula deve ter no mínimo 5 caracteres');
    });

    it('should throw error for matricula too long', () => {
      expect(() => new Matricula('12345678901234567')).toThrow('Matrícula deve ter no máximo 16 caracteres');
    });

    it('should accept matricula with letters and numbers', () => {
      const matricula = new Matricula('2024ABC123');
      expect(matricula.toString()).toBe('2024ABC123');
    });
  });

  describe('equals', () => {
    it('should return true for same matricula', () => {
      const mat1 = new Matricula('2024001234');
      const mat2 = new Matricula('2024001234');
      expect(mat1.equals(mat2)).toBe(true);
    });

    it('should return true for matricula with different case', () => {
      const mat1 = new Matricula('2024ABC123');
      const mat2 = new Matricula('2024abc123');
      expect(mat1.equals(mat2)).toBe(true);
    });

    it('should return false for different matriculas', () => {
      const mat1 = new Matricula('2024001234');
      const mat2 = new Matricula('2024005678');
      expect(mat1.equals(mat2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return matricula as string', () => {
      const matricula = new Matricula('2024001234');
      expect(matricula.toString()).toBe('2024001234');
    });
  });
});

