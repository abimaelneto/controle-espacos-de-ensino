import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MySQLUserRepositoryAdapter } from './mysql-user.repository.adapter';
import { UserEntity } from './user.entity';
import { User } from '../../../../domain/entities/user.entity';
import { Email } from '../../../../domain/value-objects/email.vo';
import { Role } from '../../../../domain/value-objects/role.vo';
import { PasswordHash } from '../../../../domain/value-objects/password-hash.vo';

describe('MySQLUserRepositoryAdapter', () => {
  let adapter: MySQLUserRepositoryAdapter;
  let repository: jest.Mocked<Repository<UserEntity>>;
  let user: User;
  let userEntity: UserEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MySQLUserRepositoryAdapter,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            exists: jest.fn(),
          },
        },
      ],
    }).compile();

    adapter = module.get<MySQLUserRepositoryAdapter>(
      MySQLUserRepositoryAdapter,
    );
    repository = module.get(getRepositoryToken(UserEntity));

    const email = new Email('test@example.com');
    const role = new Role('STUDENT');
    const passwordHash = await PasswordHash.fromPlain('password123');
    user = User.create(email, passwordHash, role);

    userEntity = {
      id: user.getId(),
      email: 'test@example.com',
      passwordHash: passwordHash.toString(),
      role: 'STUDENT',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as UserEntity;
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      repository.findOne.mockResolvedValue(userEntity);

      const result = await adapter.findById(user.getId());

      expect(result).toBeDefined();
      expect(result?.getId()).toBe(user.getId());
      expect(result?.getEmail().toString()).toBe('test@example.com');
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: user.getId() },
      });
    });

    it('should return null when user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await adapter.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return user when found by email', async () => {
      repository.findOne.mockResolvedValue(userEntity);

      const email = new Email('test@example.com');
      const result = await adapter.findByEmail(email);

      expect(result).toBeDefined();
      expect(result?.getEmail().equals(email)).toBe(true);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when user not found by email', async () => {
      repository.findOne.mockResolvedValue(null);

      const email = new Email('nonexistent@example.com');
      const result = await adapter.findByEmail(email);

      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('should save user successfully', async () => {
      repository.save.mockResolvedValue(userEntity);

      await adapter.save(user);

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: user.getId(),
          email: 'test@example.com',
        }),
      );
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      repository.delete.mockResolvedValue({ affected: 1, raw: [] });

      await adapter.delete(user.getId());

      expect(repository.delete).toHaveBeenCalledWith(user.getId());
    });
  });

  describe('exists', () => {
    it('should return true when email exists', async () => {
      repository.exists.mockResolvedValue(true);

      const email = new Email('test@example.com');
      const result = await adapter.exists(email);

      expect(result).toBe(true);
      expect(repository.exists).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return false when email does not exist', async () => {
      repository.exists.mockResolvedValue(false);

      const email = new Email('nonexistent@example.com');
      const result = await adapter.exists(email);

      expect(result).toBe(false);
    });
  });
});

