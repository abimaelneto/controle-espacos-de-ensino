import { User } from './user.entity';
import { Email } from '../value-objects/email.vo';
import { Role } from '../value-objects/role.vo';
import { PasswordHash } from '../value-objects/password-hash.vo';

describe('User Entity', () => {
  let user: User;
  let email: Email;
  let role: Role;
  let passwordHash: PasswordHash;

  beforeEach(async () => {
    email = new Email('test@example.com');
    role = new Role('STUDENT');
    passwordHash = await PasswordHash.fromPlain('password123');
  });

  describe('create', () => {
    it('should create a new user', () => {
      user = User.create(email, passwordHash, role);

      expect(user).toBeDefined();
      expect(user.getId()).toBeDefined();
      expect(user.getEmail().equals(email)).toBe(true);
      expect(user.getRole().equals(role)).toBe(true);
      expect(user.isActive()).toBe(true);
    });
  });

  describe('authenticate', () => {
    it('should authenticate with correct password', async () => {
      user = User.create(email, passwordHash, role);
      const isValid = await user.authenticate('password123');

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      user = User.create(email, passwordHash, role);
      const isValid = await user.authenticate('wrongpassword');

      expect(isValid).toBe(false);
    });
  });

  describe('changePassword', () => {
    it('should change password with correct old password', async () => {
      user = User.create(email, passwordHash, role);
      const newPasswordHash = await PasswordHash.fromPlain('newpassword123');

      await user.changePassword('password123', newPasswordHash);

      const isValid = await user.authenticate('newpassword123');
      expect(isValid).toBe(true);
    });

    it('should throw error when old password is incorrect', async () => {
      user = User.create(email, passwordHash, role);
      const newPasswordHash = await PasswordHash.fromPlain('newpassword123');

      await expect(
        user.changePassword('wrongpassword', newPasswordHash),
      ).rejects.toThrow('Old password is incorrect');
    });
  });

  describe('activate', () => {
    it('should activate user', () => {
      user = User.create(email, passwordHash, role);
      user.deactivate();
      expect(user.isActive()).toBe(false);

      user.activate();
      expect(user.isActive()).toBe(true);
    });
  });

  describe('deactivate', () => {
    it('should deactivate user', () => {
      user = User.create(email, passwordHash, role);
      expect(user.isActive()).toBe(true);

      user.deactivate();
      expect(user.isActive()).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('should return true for admin role', () => {
      const adminRole = new Role('ADMIN');
      user = User.create(email, passwordHash, adminRole);

      expect(user.hasPermission('CREATE_USER')).toBe(true);
      expect(user.hasPermission('DELETE_USER')).toBe(true);
    });

    it('should return false for student role without permission', () => {
      user = User.create(email, passwordHash, role);

      expect(user.hasPermission('CREATE_USER')).toBe(false);
    });

    it('should return true for student role with student permissions', () => {
      user = User.create(email, passwordHash, role);

      expect(user.hasPermission('REGISTER_ATTENDANCE')).toBe(true);
    });
  });
});

