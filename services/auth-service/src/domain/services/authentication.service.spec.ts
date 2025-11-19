import { AuthenticationService } from './authentication.service';
import { User } from '../entities/user.entity';
import { Email } from '../value-objects/email.vo';
import { Role } from '../value-objects/role.vo';
import { PasswordHash } from '../value-objects/password-hash.vo';
import { IUserRepository } from '../ports/repositories/user.repository.port';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let userRepository: jest.Mocked<IUserRepository>;
  let user: User;

  beforeEach(async () => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
    };

    service = new AuthenticationService(userRepository);

    const email = new Email('test@example.com');
    const role = new Role('STUDENT');
    const passwordHash = await PasswordHash.fromPlain('password123');
    user = User.create(email, passwordHash, role);
  });

  describe('authenticate', () => {
    it('should authenticate user with correct credentials', async () => {
      userRepository.findByEmail.mockResolvedValue(user);

      const result = await service.authenticate(
        new Email('test@example.com'),
        'password123',
      );

      expect(result).toBeDefined();
      expect(result?.getId()).toBe(user.getId());
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        expect.any(Email),
      );
    });

    it('should return null for non-existent user', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      const result = await service.authenticate(
        new Email('nonexistent@example.com'),
        'password123',
      );

      expect(result).toBeNull();
    });

    it('should return null for incorrect password', async () => {
      userRepository.findByEmail.mockResolvedValue(user);

      const result = await service.authenticate(
        new Email('test@example.com'),
        'wrongpassword',
      );

      expect(result).toBeNull();
    });

    it('should return null for inactive user', async () => {
      user.deactivate();
      userRepository.findByEmail.mockResolvedValue(user);

      const result = await service.authenticate(
        new Email('test@example.com'),
        'password123',
      );

      expect(result).toBeNull();
    });
  });

  describe('validateUser', () => {
    it('should return user if exists and is active', async () => {
      userRepository.findById.mockResolvedValue(user);

      const result = await service.validateUser(user.getId());

      expect(result).toBe(user);
      expect(userRepository.findById).toHaveBeenCalledWith(user.getId());
    });

    it('should return null if user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      const result = await service.validateUser('non-existent-id');

      expect(result).toBeNull();
    });

    it('should return null if user is inactive', async () => {
      user.deactivate();
      userRepository.findById.mockResolvedValue(user);

      const result = await service.validateUser(user.getId());

      expect(result).toBeNull();
    });
  });
});

