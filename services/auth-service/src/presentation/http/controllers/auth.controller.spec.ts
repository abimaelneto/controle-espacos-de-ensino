import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthenticateUserUseCase } from '../../../application/use-cases/authenticate-user.use-case';
import { CreateUserUseCase } from '../../../application/use-cases/create-user.use-case';
import { JwtService } from '../../../application/services/jwt.service';
import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { Role } from '../../../domain/value-objects/role.vo';
import { PasswordHash } from '../../../domain/value-objects/password-hash.vo';
import { LoginDto } from '../../../application/dto/login.dto';
import { CreateUserDto, UserRole } from '../../../application/dto/create-user.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authenticateUseCase: jest.Mocked<AuthenticateUserUseCase>;
  let createUserUseCase: jest.Mocked<CreateUserUseCase>;
  let jwtService: jest.Mocked<JwtService>;
  let user: User;

  beforeEach(async () => {
    authenticateUseCase = {
      execute: jest.fn(),
    } as any;

    createUserUseCase = {
      execute: jest.fn(),
    } as any;

    jwtService = {
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthenticateUserUseCase,
          useValue: authenticateUseCase,
        },
        {
          provide: CreateUserUseCase,
          useValue: createUserUseCase,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);

    const email = new Email('test@example.com');
    const role = new Role('STUDENT');
    const passwordHash = await PasswordHash.fromPlain('password123');
    user = User.create(email, passwordHash, role);
  });

  describe('login', () => {
    it('should return tokens on successful login', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      authenticateUseCase.execute.mockResolvedValue(user);
      jwtService.generateAccessToken.mockReturnValue('access-token');
      jwtService.generateRefreshToken.mockReturnValue('refresh-token');

      const result = await controller.login(loginDto);

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: user.getId(),
          email: user.getEmail().toString(),
          role: user.getRole().getValue(),
        },
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      authenticateUseCase.execute.mockResolvedValue(null);

      await expect(controller.login(loginDto)).rejects.toThrow(
        'Credenciais inválidas',
      );
    });
  });

  describe('register', () => {
    it('should create user and return tokens', async () => {
      const createUserDto: CreateUserDto = {
        email: 'newuser@example.com',
        password: 'password123',
        role: UserRole.STUDENT,
      };

      createUserUseCase.execute.mockResolvedValue(user);
      jwtService.generateAccessToken.mockReturnValue('access-token');
      jwtService.generateRefreshToken.mockReturnValue('refresh-token');

      const result = await controller.register(createUserDto);

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: user.getId(),
          email: user.getEmail().toString(),
          role: user.getRole().getValue(),
        },
      });
    });
  });
});

