import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { UserEntity } from '../src/infrastructure/adapters/persistence/mysql/user.entity';
import { getTestDatabaseConfig } from './test-database.config';
import { IEventPublisher } from '../src/domain/ports/messaging/event-publisher.port';
import { IDomainEvent } from '../src/domain/events/domain-event.interface';
import { MySQLUserRepositoryAdapter } from '../src/infrastructure/adapters/persistence/mysql/mysql-user.repository.adapter';
import { AuthenticationService } from '../src/domain/services/authentication.service';
import { AuthenticateUserUseCase } from '../src/application/use-cases/authenticate-user.use-case';
import { CreateUserUseCase } from '../src/application/use-cases/create-user.use-case';
import { JwtService } from '../src/application/services/jwt.service';
import { AuthController } from '../src/presentation/http/controllers/auth.controller';
import { IUserRepository } from '../src/domain/ports/repositories/user.repository.port';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

// Mock Event Publisher para testes
class MockEventPublisher implements IEventPublisher {
  async publish(event: IDomainEvent): Promise<void> {
    // Mock - não faz nada em testes
  }

  async publishMany(events: IDomainEvent[]): Promise<void> {
    // Mock - não faz nada em testes
  }
}

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ['.env.test', '.env.local', '.env'],
        }),
        TypeOrmModule.forRoot(getTestDatabaseConfig()),
        TypeOrmModule.forFeature([UserEntity]),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: (config: ConfigService) => ({
            secret: config.get<string>('JWT_SECRET', 'test-secret-key-for-e2e-tests-min-32-chars'),
            signOptions: {
              expiresIn: config.get<string>('JWT_EXPIRES_IN', '1h'),
            },
          }),
          inject: [ConfigService],
        }),
      ],
      controllers: [AuthController],
      providers: [
        {
          provide: 'USER_REPOSITORY',
          useClass: MySQLUserRepositoryAdapter,
        },
        {
          provide: 'EVENT_PUBLISHER',
          useClass: MockEventPublisher,
        },
        {
          provide: AuthenticationService,
          useFactory: (userRepository: IUserRepository) => {
            return new AuthenticationService(userRepository);
          },
          inject: ['USER_REPOSITORY'],
        },
        {
          provide: AuthenticateUserUseCase,
          useFactory: (authService: AuthenticationService) => {
            return new AuthenticateUserUseCase(authService);
          },
          inject: [AuthenticationService],
        },
        {
          provide: CreateUserUseCase,
          useFactory: (
            userRepository: IUserRepository,
            eventPublisher: IEventPublisher,
          ) => {
            return new CreateUserUseCase(userRepository, eventPublisher);
          },
          inject: ['USER_REPOSITORY', 'EVENT_PUBLISHER'],
        },
        JwtService,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.setGlobalPrefix('api/v1');

    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  beforeEach(async () => {
    // Limpar tabelas antes de cada teste
    await dataSource.query('DELETE FROM refresh_tokens');
    await dataSource.query('DELETE FROM users');
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          role: 'STUDENT',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe('newuser@example.com');
          expect(res.body.user.role).toBe('STUDENT');
          expect(res.body.user).toHaveProperty('id');
        });
    });

    it('should return 400 for invalid email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          role: 'STUDENT',
        })
        .expect(400);
    });

    it('should return 400 for short password', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'user@example.com',
          password: '12345',
          role: 'STUDENT',
        })
        .expect(400);
    });

    it('should return 400 for invalid role', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'user@example.com',
          password: 'password123',
          role: 'INVALID_ROLE',
        })
        .expect(400);
    });

    it('should return 400 for missing fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'user@example.com',
        })
        .expect(400);
    });

    it('should return error for duplicate email', async () => {
      // Criar primeiro usuário
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password123',
          role: 'STUDENT',
        })
        .expect(201);

      // Tentar criar com mesmo email
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password123',
          role: 'STUDENT',
        })
        .expect(500); // Ou 400, dependendo da implementação
    });

    it('should normalize email to lowercase', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'UPPERCASE@EXAMPLE.COM',
          password: 'password123',
          role: 'STUDENT',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.user.email).toBe('uppercase@example.com');
        });
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Criar usuário de teste
      const passwordHash = await bcrypt.hash('password123', 10);
      await dataSource.query(
        `INSERT INTO users (id, email, passwordHash, role, status, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        ['test-user-id', 'test@example.com', passwordHash, 'STUDENT', 'ACTIVE'],
      );
    });

    it('should login successfully with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe('test@example.com');
          expect(res.body.user.role).toBe('STUDENT');
        });
    });

    it('should return 401 for invalid email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toBe('Credenciais inválidas');
        });
    });

    it('should return 401 for invalid password', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toBe('Credenciais inválidas');
        });
    });

    it('should return 400 for invalid email format', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);
    });

    it('should return 400 for missing password', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
        })
        .expect(400);
    });

    it('should return 401 for inactive user', async () => {
      // Criar usuário inativo
      const passwordHash = await bcrypt.hash('password123', 10);
      await dataSource.query(
        `INSERT INTO users (id, email, passwordHash, role, status, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        ['inactive-user-id', 'inactive@example.com', passwordHash, 'STUDENT', 'INACTIVE'],
      );

      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'inactive@example.com',
          password: 'password123',
        })
        .expect(401);
    });

    it('should normalize email to lowercase', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'TEST@EXAMPLE.COM',
          password: 'password123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.user.email).toBe('test@example.com');
        });
    });
  });

  describe('Token Validation', () => {
    let accessToken: string;
    let refreshToken: string;

    beforeEach(async () => {
      // Registrar e obter tokens
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'tokenuser@example.com',
          password: 'password123',
          role: 'STUDENT',
        })
        .expect(201);

      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;
    });

    it('should have valid JWT structure', () => {
      expect(accessToken).toBeDefined();
      expect(typeof accessToken).toBe('string');
      expect(accessToken.split('.').length).toBe(3); // JWT tem 3 partes
    });

    it('should have valid refresh token structure', () => {
      expect(refreshToken).toBeDefined();
      expect(typeof refreshToken).toBe('string');
      expect(refreshToken.split('.').length).toBe(3);
    });

    it('should have different access and refresh tokens', () => {
      expect(accessToken).not.toBe(refreshToken);
    });
  });

  describe('User Roles', () => {
    it('should register ADMIN user', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'admin@example.com',
          password: 'password123',
          role: 'ADMIN',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.user.role).toBe('ADMIN');
        });
    });

    it('should register MONITOR user', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'monitor@example.com',
          password: 'password123',
          role: 'MONITOR',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.user.role).toBe('MONITOR');
        });
    });
  });
});

