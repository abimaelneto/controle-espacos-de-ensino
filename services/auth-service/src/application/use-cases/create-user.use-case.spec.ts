import { CreateUserUseCase } from './create-user.use-case';
import { IUserRepository } from '../../domain/ports/repositories/user.repository.port';
import { IEventPublisher } from '../../domain/ports/messaging/event-publisher.port';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { Role } from '../../domain/value-objects/role.vo';
import { PasswordHash } from '../../domain/value-objects/password-hash.vo';
import { CreateUserDto, UserRole } from '../dto/create-user.dto';
import { UserCreatedEvent } from '../../domain/events/user-created.event';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let eventPublisher: jest.Mocked<IEventPublisher>;
  let user: User;

  beforeEach(async () => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
    };

    eventPublisher = {
      publish: jest.fn(),
      publishMany: jest.fn(),
    };

    useCase = new CreateUserUseCase(userRepository, eventPublisher);

    const email = new Email('test@example.com');
    const role = new Role('STUDENT');
    const passwordHash = await PasswordHash.fromPlain('password123');
    user = User.create(email, passwordHash, role);
  });

  describe('execute', () => {
    it('should create user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'newuser@example.com',
        password: 'password123',
        role: UserRole.STUDENT,
      };

      userRepository.exists.mockResolvedValue(false);
      userRepository.save.mockResolvedValue(undefined);
      eventPublisher.publish.mockResolvedValue(undefined);

      const result = await useCase.execute(createUserDto);

      expect(result).toBeDefined();
      expect(result.getId()).toBeDefined();
      expect(result.getEmail().toString()).toBe('newuser@example.com');
      expect(result.getRole().getValue()).toBe('STUDENT');
      expect(result.isActive()).toBe(true);

      expect(userRepository.exists).toHaveBeenCalledWith(
        expect.any(Email),
      );
      expect(userRepository.save).toHaveBeenCalledWith(expect.any(User));
      expect(eventPublisher.publish).toHaveBeenCalledWith(
        expect.any(UserCreatedEvent),
      );
    });

    it('should throw error if email already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'existing@example.com',
        password: 'password123',
        role: UserRole.STUDENT,
      };

      userRepository.exists.mockResolvedValue(true);

      await expect(useCase.execute(createUserDto)).rejects.toThrow(
        'User with this email already exists',
      );

      expect(userRepository.save).not.toHaveBeenCalled();
      expect(eventPublisher.publish).not.toHaveBeenCalled();
    });

    it('should publish UserCreatedEvent after creating user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'newuser@example.com',
        password: 'password123',
        role: UserRole.ADMIN,
      };

      userRepository.exists.mockResolvedValue(false);
      userRepository.save.mockResolvedValue(undefined);
      eventPublisher.publish.mockResolvedValue(undefined);

      const result = await useCase.execute(createUserDto);

      expect(eventPublisher.publish).toHaveBeenCalledTimes(1);
      const publishedEvent = eventPublisher.publish.mock.calls[0][0];
      expect(publishedEvent).toBeInstanceOf(UserCreatedEvent);
      expect(publishedEvent.eventType).toBe('UserCreated');
      expect(publishedEvent.aggregateId).toBe(result.getId());
    });
  });
});

