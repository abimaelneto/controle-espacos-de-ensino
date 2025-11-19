import { AuthenticateUserUseCase } from './authenticate-user.use-case';
import { AuthenticationService } from '../../domain/services/authentication.service';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { Role } from '../../domain/value-objects/role.vo';
import { PasswordHash } from '../../domain/value-objects/password-hash.vo';
import { LoginDto } from '../dto/login.dto';

describe('AuthenticateUserUseCase', () => {
  let useCase: AuthenticateUserUseCase;
  let authenticationService: jest.Mocked<AuthenticationService>;
  let user: User;

  beforeEach(async () => {
    authenticationService = {
      authenticate: jest.fn(),
      validateUser: jest.fn(),
    } as any;

    useCase = new AuthenticateUserUseCase(authenticationService);

    const email = new Email('test@example.com');
    const role = new Role('STUDENT');
    const passwordHash = await PasswordHash.fromPlain('password123');
    user = User.create(email, passwordHash, role);
  });

  describe('execute', () => {
    it('should authenticate user successfully', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      authenticationService.authenticate.mockResolvedValue(user);

      const result = await useCase.execute(loginDto);

      expect(result).toBeDefined();
      expect(result?.getId()).toBe(user.getId());
      expect(result?.getEmail().toString()).toBe('test@example.com');
      expect(authenticationService.authenticate).toHaveBeenCalledWith(
        expect.any(Email),
        'password123',
      );
    });

    it('should return null for invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      authenticationService.authenticate.mockResolvedValue(null);

      const result = await useCase.execute(loginDto);

      expect(result).toBeNull();
    });

    it('should handle email normalization', async () => {
      const loginDto: LoginDto = {
        email: '  TEST@EXAMPLE.COM  ',
        password: 'password123',
      };

      authenticationService.authenticate.mockResolvedValue(user);

      const result = await useCase.execute(loginDto);

      expect(result).toBeDefined();
      expect(authenticationService.authenticate).toHaveBeenCalledWith(
        expect.objectContaining({
          toString: expect.any(Function),
        }),
        'password123',
      );
    });
  });
});

