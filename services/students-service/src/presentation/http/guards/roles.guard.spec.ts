import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, Reflector],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  describe('canActivate', () => {
    it('deve permitir acesso quando não há roles requeridas', () => {
      const context = createMockContext({ user: { role: 'STUDENT' } });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('deve permitir acesso quando usuário tem role requerida', () => {
      const context = createMockContext({ user: { role: 'ADMIN' } });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('deve negar acesso quando usuário não tem role requerida', () => {
      const context = createMockContext({ user: { role: 'STUDENT' } });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('deve permitir acesso quando usuário tem uma das roles requeridas', () => {
      const context = createMockContext({ user: { role: 'MONITOR' } });
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['ADMIN', 'MONITOR']);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('deve negar acesso quando usuário não está autenticado', () => {
      const context = createMockContext({ user: null });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });
  });

  function createMockContext(request: { user: { role: string } | null }) {
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;
  }
});

