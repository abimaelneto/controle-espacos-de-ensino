import { Role } from './role.vo';

describe('Role Value Object', () => {
  describe('constructor', () => {
    it('should create valid roles', () => {
      expect(new Role('ADMIN')).toBeDefined();
      expect(new Role('STUDENT')).toBeDefined();
      expect(new Role('MONITOR')).toBeDefined();
    });

    it('should throw error for invalid role', () => {
      expect(() => new Role('INVALID')).toThrow('Invalid role: INVALID');
      expect(() => new Role('')).toThrow('Invalid role: ');
    });
  });

  describe('isAdmin', () => {
    it('should return true for ADMIN role', () => {
      const role = new Role('ADMIN');
      expect(role.isAdmin()).toBe(true);
    });

    it('should return false for non-admin roles', () => {
      expect(new Role('STUDENT').isAdmin()).toBe(false);
      expect(new Role('MONITOR').isAdmin()).toBe(false);
    });
  });

  describe('isStudent', () => {
    it('should return true for STUDENT role', () => {
      const role = new Role('STUDENT');
      expect(role.isStudent()).toBe(true);
    });

    it('should return false for non-student roles', () => {
      expect(new Role('ADMIN').isStudent()).toBe(false);
      expect(new Role('MONITOR').isStudent()).toBe(false);
    });
  });

  describe('isMonitor', () => {
    it('should return true for MONITOR role', () => {
      const role = new Role('MONITOR');
      expect(role.isMonitor()).toBe(true);
    });

    it('should return false for non-monitor roles', () => {
      expect(new Role('ADMIN').isMonitor()).toBe(false);
      expect(new Role('STUDENT').isMonitor()).toBe(false);
    });
  });

  describe('getValue', () => {
    it('should return role value', () => {
      expect(new Role('ADMIN').getValue()).toBe('ADMIN');
      expect(new Role('STUDENT').getValue()).toBe('STUDENT');
      expect(new Role('MONITOR').getValue()).toBe('MONITOR');
    });
  });

  describe('equals', () => {
    it('should return true for same role', () => {
      const role1 = new Role('ADMIN');
      const role2 = new Role('ADMIN');
      expect(role1.equals(role2)).toBe(true);
    });

    it('should return false for different roles', () => {
      const role1 = new Role('ADMIN');
      const role2 = new Role('STUDENT');
      expect(role1.equals(role2)).toBe(false);
    });

    it('should return false for non-Role objects', () => {
      const role = new Role('ADMIN');
      expect(role.equals(null as any)).toBe(false);
      expect(role.equals({} as any)).toBe(false);
    });
  });
});

