import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/core';
import * as request from 'supertest';
import { HttpModule } from '@nestjs/axios';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { AttendanceEntity } from '../../src/infrastructure/adapters/persistence/mysql/attendance.entity';
import { StudentsClientAdapter } from '../../src/infrastructure/adapters/http/students-client.adapter';
import { RoomsClientAdapter } from '../../src/infrastructure/adapters/http/rooms-client.adapter';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

/**
 * Testes de Integração - Check-in Service
 * 
 * Testa a integração entre:
 * - Check-in Service ↔ Students Service
 * - Check-in Service ↔ Rooms Service
 * - Check-in Service ↔ Analytics Service (via eventos)
 */
describe('CheckIn Integration (e2e)', () => {
  let app: INestApplication;
  let attendanceRepository: Repository<AttendanceEntity>;
  let httpService: HttpService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, HttpModule],
    })
      .overrideProvider(StudentsClientAdapter)
      .useValue({
        findStudentByMatricula: jest.fn(),
        findStudentByCPF: jest.fn(),
        validateStudentActive: jest.fn(),
      })
      .overrideProvider(RoomsClientAdapter)
      .useValue({
        getRoom: jest.fn(),
        validateRoomAvailable: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    attendanceRepository = moduleFixture.get(
      getRepositoryToken(AttendanceEntity),
    );
    httpService = moduleFixture.get(HttpService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Limpar banco de dados de teste
    await attendanceRepository.clear();
  });

  describe('POST /api/v1/checkin', () => {
    it('should perform check-in with valid student and room', async () => {
      // Mock Students Service
      jest.spyOn(httpService, 'get').mockImplementation((url: string) => {
        if (url.includes('/students/')) {
          return of({
            data: {
              id: 'student-123',
              userId: 'user-123',
              name: 'João Silva',
              cpf: '12345678909',
              email: 'joao@example.com',
              matricula: '2024001234',
              status: 'ACTIVE',
            },
            status: 200,
          });
        }
        if (url.includes('/rooms/')) {
          return of({
            data: {
              id: 'room-456',
              roomNumber: 'A101',
              capacity: 30,
              type: 'CLASSROOM',
              status: 'ACTIVE',
            },
            status: 200,
          });
        }
        return of({ data: null, status: 404 });
      });

      const checkInDto = {
        studentId: 'student-123',
        roomId: 'room-456',
        identificationMethod: 'MATRICULA',
        identificationValue: '2024001234',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/checkin')
        .send(checkInDto)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.checkInId).toBeDefined();
    });

    it('should reject check-in if student is inactive', async () => {
      jest.spyOn(httpService, 'get').mockImplementation((url: string) => {
        if (url.includes('/students/')) {
          return of({
            data: {
              id: 'student-123',
              status: 'INACTIVE',
            },
            status: 200,
          });
        }
        return of({ data: null, status: 404 });
      });

      const checkInDto = {
        studentId: 'student-123',
        roomId: 'room-456',
        identificationMethod: 'MATRICULA',
        identificationValue: '2024001234',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/checkin')
        .send(checkInDto)
        .expect(201); // O controller retorna 201 mesmo em caso de erro de negócio

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('inativo');
    });

    it('should reject check-in if room is at capacity', async () => {
      // Criar 30 check-ins ativos (capacidade máxima)
      const entities = Array.from({ length: 30 }, (_, i) =>
        attendanceRepository.create({
          id: `attendance-${i}`,
          studentId: `student-${i}`,
          roomId: 'room-456',
          checkInTime: new Date(),
          checkOutTime: null,
        }),
      );
      await attendanceRepository.save(entities);

      jest.spyOn(httpService, 'get').mockImplementation((url: string) => {
        if (url.includes('/students/')) {
          return of({
            data: {
              id: 'student-123',
              status: 'ACTIVE',
            },
            status: 200,
          });
        }
        if (url.includes('/rooms/')) {
          return of({
            data: {
              id: 'room-456',
              roomNumber: 'A101',
              capacity: 30,
              status: 'ACTIVE',
            },
            status: 200,
          });
        }
        return of({ data: null, status: 404 });
      });

      const checkInDto = {
        studentId: 'student-123',
        roomId: 'room-456',
        identificationMethod: 'MATRICULA',
        identificationValue: '2024001234',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/checkin')
        .send(checkInDto)
        .expect(201);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('capacidade máxima');
    });
  });
});

