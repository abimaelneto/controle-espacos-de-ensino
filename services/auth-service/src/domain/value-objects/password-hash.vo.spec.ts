import * as bcrypt from 'bcrypt';
import { PasswordHash } from './password-hash.vo';

describe('PasswordHash Value Object', () => {
  describe('fromPlain', () => {
    it('should create hash from plain password', async () => {
      const plainPassword = 'MySecurePassword123!';
      const passwordHash = await PasswordHash.fromPlain(plainPassword);

      expect(passwordHash).toBeDefined();
      expect(passwordHash.toString()).not.toBe(plainPassword);
      expect(passwordHash.toString().length).toBeGreaterThan(0);
    });

    it('should create different hashes for same password', async () => {
      const plainPassword = 'MySecurePassword123!';
      const hash1 = await PasswordHash.fromPlain(plainPassword);
      const hash2 = await PasswordHash.fromPlain(plainPassword);

      // Hashes should be different due to salt
      expect(hash1.toString()).not.toBe(hash2.toString());
    });
  });

  describe('verify', () => {
    it('should verify correct password', async () => {
      const plainPassword = 'MySecurePassword123!';
      const passwordHash = await PasswordHash.fromPlain(plainPassword);

      const isValid = await passwordHash.verify(plainPassword);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const plainPassword = 'MySecurePassword123!';
      const wrongPassword = 'WrongPassword123!';
      const passwordHash = await PasswordHash.fromPlain(plainPassword);

      const isValid = await passwordHash.verify(wrongPassword);
      expect(isValid).toBe(false);
    });
  });

  describe('fromHash', () => {
    it('should create PasswordHash from existing hash', async () => {
      const plainPassword = 'MySecurePassword123!';
      const hash = await bcrypt.hash(plainPassword, 10);
      const passwordHash = PasswordHash.fromHash(hash);

      expect(passwordHash).toBeDefined();
      expect(passwordHash.toString()).toBe(hash);

      const isValid = await passwordHash.verify(plainPassword);
      expect(isValid).toBe(true);
    });
  });

  describe('toString', () => {
    it('should return hash as string', async () => {
      const plainPassword = 'MySecurePassword123!';
      const passwordHash = await PasswordHash.fromPlain(plainPassword);

      const hashString = passwordHash.toString();
      expect(typeof hashString).toBe('string');
      expect(hashString.length).toBeGreaterThan(0);
    });
  });
});

