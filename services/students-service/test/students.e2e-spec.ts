import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTestDatabaseConfig } from './test-database.config';
import { IEventPublisher } from '../src/domain/ports/messaging/event-publisher.port';
import { ConfigService } from '@nestjs/config';

describe('StudentsController (e2e)', () => {
  let app: INestApplication;
  let mockEventPublisher: jest.Mocked<IEventPublisher>;

  beforeAll(async () => {
    mockEventPublisher = {
      publish: jest.fn().mockResolvedValue(undefined),
      publishMany: jest.fn().mockResolvedValue(undefined),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(getTestDatabaseConfig()),
        AppModule,
      ],
    })
      .overrideProvider('EVENT_PUBLISHER')
      .useValue(mockEventPublisher)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/students', () => {
    it('should create a student', () => {
      const createStudentDto = {
        userId: 'user-123',
        firstName: 'João',
        lastName: 'Silva',
        cpf: '12345678909',
        email: 'joao@example.com',
        matricula: '2024001234',
      };

      return request(app.getHttpServer())
        .post('/api/v1/students')
        .send(createStudentDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.userId).toBe('user-123');
          expect(res.body.name).toBeDefined();
        });
    });

    it('should return 400 for invalid data', () => {
      const invalidDto = {
        userId: 'user-123',
        firstName: 'Jo',
        lastName: 'Si',
        cpf: '123',
        email: 'invalid-email',
        matricula: '123',
      };

      return request(app.getHttpServer())
        .post('/api/v1/students')
        .send(invalidDto)
        .expect(400);
    });

    it('should return 409 for duplicate CPF', async () => {
      const createStudentDto = {
        userId: 'user-123',
        firstName: 'João',
        lastName: 'Silva',
        cpf: '12345678909',
        email: 'joao@example.com',
        matricula: '2024001234',
      };

      // Criar primeiro aluno
      await request(app.getHttpServer())
        .post('/api/v1/students')
        .send(createStudentDto)
        .expect(201);

      // Tentar criar segundo aluno com mesmo CPF
      const duplicateDto = {
        ...createStudentDto,
        userId: 'user-456',
        email: 'joao2@example.com',
        matricula: '2024005678',
      };

      return request(app.getHttpServer())
        .post('/api/v1/students')
        .send(duplicateDto)
        .expect(409);
    });
  });

  describe('GET /api/v1/students', () => {
    it('should return all students', async () => {
      // Criar um aluno primeiro
      const createStudentDto = {
        userId: 'user-list-1',
        firstName: 'Maria',
        lastName: 'Santos',
        cpf: '98765432100',
        email: 'maria@example.com',
        matricula: '2024009999',
      };

      await request(app.getHttpServer())
        .post('/api/v1/students')
        .send(createStudentDto)
        .expect(201);

      return request(app.getHttpServer())
        .get('/api/v1/students')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('GET /api/v1/students/:id', () => {
    it('should return a student by id', async () => {
      const createStudentDto = {
        userId: 'user-get-1',
        firstName: 'Pedro',
        lastName: 'Oliveira',
        cpf: '11122233344',
        email: 'pedro@example.com',
        matricula: '2024008888',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/students')
        .send(createStudentDto)
        .expect(201);

      const studentId = createResponse.body.id;

      return request(app.getHttpServer())
        .get(`/api/v1/students/${studentId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(studentId);
          expect(res.body.email).toBe('pedro@example.com');
        });
    });

    it('should return 404 for non-existent student', () => {
      return request(app.getHttpServer())
        .get('/api/v1/students/non-existent-id')
        .expect(404);
    });
  });

  describe('PUT /api/v1/students/:id', () => {
    it('should update a student', async () => {
      const createStudentDto = {
        userId: 'user-update-1',
        firstName: 'Ana',
        lastName: 'Costa',
        cpf: '55566677788',
        email: 'ana@example.com',
        matricula: '2024007777',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/students')
        .send(createStudentDto)
        .expect(201);

      const studentId = createResponse.body.id;

      const updateDto = {
        firstName: 'Ana Maria',
        email: 'anamaria@example.com',
      };

      return request(app.getHttpServer())
        .put(`/api/v1/students/${studentId}`)
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe('anamaria@example.com');
        });
    });
  });

  describe('DELETE /api/v1/students/:id', () => {
    it('should soft delete a student', async () => {
      const createStudentDto = {
        userId: 'user-delete-1',
        firstName: 'Carlos',
        lastName: 'Ferreira',
        cpf: '99988877766',
        email: 'carlos@example.com',
        matricula: '2024006666',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/students')
        .send(createStudentDto)
        .expect(201);

      const studentId = createResponse.body.id;

      return request(app.getHttpServer())
        .delete(`/api/v1/students/${studentId}`)
        .expect(204);
    });
  });
});

