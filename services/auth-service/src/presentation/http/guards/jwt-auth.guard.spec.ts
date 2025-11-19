import { JwtAuthGuard } from './jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { JwtService } from '../../../application/services/jwt.service';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(() => {
    jwtService = {
      verifyAccessToken: jest.fn(),
    } as any;

    guard = new JwtAuthGuard(jwtService);
  });

  describe('canActivate', () => {
    it('should return true for valid token', () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: 'Bearer valid-token',
            },
          }),
        }),
      } as ExecutionContext;

      jwtService.verifyAccessToken.mockReturnValue({
        sub: 'user-123',
        email: 'test@example.com',
        role: 'STUDENT',
      });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(jwtService.verifyAccessToken).toHaveBeenCalledWith('valid-token');
    });

    it('should throw UnauthorizedException for invalid token', () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: 'Bearer invalid-token',
            },
          }),
        }),
      } as ExecutionContext;

      jwtService.verifyAccessToken.mockReturnValue(null);

      expect(() => guard.canActivate(context)).toThrow('Token inválido');
    });

    it('should throw UnauthorizedException for missing token', () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {},
          }),
        }),
      } as ExecutionContext;

      expect(() => guard.canActivate(context)).toThrow('Token não fornecido');
    });
  });
});

