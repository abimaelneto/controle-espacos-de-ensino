import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard, JwtPayload } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: JwtService;
  let configService: ConfigService;

  const testSecret = 'test-secret-key-for-jwt-validation-min-32-chars';
  const testPayload: JwtPayload = {
    sub: 'user-id-123',
    email: 'test@example.com',
    role: 'ADMIN',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: ['.env.test'],
        }),
        JwtModule.register({
          secret: testSecret,
          signOptions: { expiresIn: '1h' },
        }),
      ],
      providers: [
        JwtAuthGuard,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'JWT_SECRET') return testSecret;
              return undefined;
            },
          },
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('canActivate', () => {
    it('deve permitir acesso com token válido', () => {
      const token = jwtService.sign(testPayload);
      const request = {
        headers: {
          authorization: `Bearer ${token}`,
        },
        user: null,
      };
      const context = createMockContext(request);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(request.user).toEqual(
        expect.objectContaining({
          sub: testPayload.sub,
          email: testPayload.email,
          role: testPayload.role,
        }),
      );
    });

    it('deve lançar exceção quando token não é fornecido', () => {
      const request = { headers: {}, user: null };
      const context = createMockContext(request);

      expect(() => guard.canActivate(context)).toThrow(
        new UnauthorizedException('Token não fornecido'),
      );
    });

    it('deve lançar exceção quando header não começa com Bearer', () => {
      const request = {
        headers: { authorization: 'Invalid token' },
        user: null,
      };
      const context = createMockContext(request);

      expect(() => guard.canActivate(context)).toThrow(
        new UnauthorizedException('Token não fornecido'),
      );
    });

    it('deve lançar exceção quando token é inválido', () => {
      const request = {
        headers: { authorization: 'Bearer invalid-token' },
        user: null,
      };
      const context = createMockContext(request);

      expect(() => guard.canActivate(context)).toThrow(
        new UnauthorizedException('Token inválido ou expirado'),
      );
    });

    it('deve lançar exceção quando token está expirado', () => {
      const expiredToken = jwtService.sign(testPayload, { expiresIn: '-1h' });
      const request = {
        headers: { authorization: `Bearer ${expiredToken}` },
        user: null,
      };
      const context = createMockContext(request);

      expect(() => guard.canActivate(context)).toThrow(
        new UnauthorizedException('Token inválido ou expirado'),
      );
    });
  });

  function createMockContext(request: { headers: Record<string, string>; user: any }) {
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;
  }
});

