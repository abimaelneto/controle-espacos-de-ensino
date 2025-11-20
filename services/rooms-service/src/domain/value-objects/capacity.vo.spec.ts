import { Capacity } from './capacity.vo';

describe('Capacity Value Object', () => {
  describe('constructor', () => {
    it('should create a valid capacity', () => {
      const capacity = new Capacity(30);
      expect(capacity.getValue()).toBe(30);
    });

    it('should throw error for zero capacity', () => {
      expect(() => new Capacity(0)).toThrow('Capacidade deve ser maior que zero');
    });

    it('should throw error for negative capacity', () => {
      expect(() => new Capacity(-10)).toThrow('Capacidade deve ser maior que zero');
    });

    it('should throw error for capacity too large', () => {
      expect(() => new Capacity(10001)).toThrow('Capacidade não pode ser maior que 10000');
    });

    it('should accept maximum capacity', () => {
      expect(() => new Capacity(10000)).not.toThrow();
    });
  });

  describe('equals', () => {
    it('should return true for same capacity', () => {
      const cap1 = new Capacity(30);
      const cap2 = new Capacity(30);
      expect(cap1.equals(cap2)).toBe(true);
    });

    it('should return false for different capacities', () => {
      const cap1 = new Capacity(30);
      const cap2 = new Capacity(50);
      expect(cap1.equals(cap2)).toBe(false);
    });
  });

  describe('isGreaterThan', () => {
    it('should return true if capacity is greater', () => {
      const cap1 = new Capacity(50);
      const cap2 = new Capacity(30);
      expect(cap1.isGreaterThan(cap2)).toBe(true);
    });

    it('should return false if capacity is not greater', () => {
      const cap1 = new Capacity(30);
      const cap2 = new Capacity(50);
      expect(cap1.isGreaterThan(cap2)).toBe(false);
    });
  });
});

