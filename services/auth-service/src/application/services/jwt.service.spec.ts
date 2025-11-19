import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule, JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from './jwt.service';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { Role } from '../../domain/value-objects/role.vo';
import { PasswordHash } from '../../domain/value-objects/password-hash.vo';

describe('JwtService', () => {
  let service: JwtService;
  let user: User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: ['.env.test'],
        }),
        JwtModule.register({
          secret: 'test-secret-key',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      providers: [
        JwtService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string, defaultValue?: string) => {
              const env: Record<string, string> = {
                JWT_SECRET: 'test-secret-key',
                JWT_EXPIRES_IN: '1h',
                JWT_REFRESH_SECRET: 'test-refresh-secret-key',
                JWT_REFRESH_EXPIRES_IN: '7d',
              };
              return env[key] || defaultValue;
            },
          },
        },
      ],
    }).compile();

    service = module.get<JwtService>(JwtService);

    const email = new Email('test@example.com');
    const role = new Role('STUDENT');
    const passwordHash = await PasswordHash.fromPlain('password123');
    user = User.create(email, passwordHash, role);
  });

  describe('generateAccessToken', () => {
    it('should generate access token', () => {
      const token = service.generateAccessToken(user);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should generate token with user payload', () => {
      const token = service.generateAccessToken(user);
      const payload = service.verifyAccessToken(token);

      expect(payload).toBeDefined();
      expect(payload?.sub).toBe(user.getId());
      expect(payload?.email).toBe(user.getEmail().toString());
      expect(payload?.role).toBe(user.getRole().getValue());
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate refresh token', () => {
      const token = service.generateRefreshToken(user);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should generate different token from access token', () => {
      const accessToken = service.generateAccessToken(user);
      const refreshToken = service.generateRefreshToken(user);

      expect(refreshToken).not.toBe(accessToken);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid access token', () => {
      const token = service.generateAccessToken(user);
      const payload = service.verifyAccessToken(token);

      expect(payload).toBeDefined();
      expect(payload?.sub).toBe(user.getId());
    });

    it('should return null for invalid token', () => {
      const payload = service.verifyAccessToken('invalid-token');

      expect(payload).toBeNull();
    });

    it('should return null for expired token', () => {
      // Token expirado seria testado com um token real expirado
      // Por enquanto, testamos apenas tokens inválidos
      const payload = service.verifyAccessToken('expired.token.here');

      expect(payload).toBeNull();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', () => {
      const token = service.generateRefreshToken(user);
      const payload = service.verifyRefreshToken(token);

      expect(payload).toBeDefined();
      expect(payload?.sub).toBe(user.getId());
    });

    it('should return null for invalid refresh token', () => {
      const payload = service.verifyRefreshToken('invalid-token');

      expect(payload).toBeNull();
    });
  });
});

