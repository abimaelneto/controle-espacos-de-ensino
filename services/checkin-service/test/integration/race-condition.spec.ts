import { Test, TestingModule } from '@nestjs/testing';
import { NestApplication } from '@nestjs/core';
import * as request from 'supertest';
import { HttpModule, HttpService } from '@nestjs/axios';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { AttendanceEntity } from '../../src/infrastructure/adapters/persistence/mysql/attendance.entity';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';

const STUDENTS_CLIENT_TOKEN = 'STUDENTS_CLIENT';
const ROOMS_CLIENT_TOKEN = 'ROOMS_CLIENT';

function buildResponse(data: any, status = 200): AxiosResponse {
  return {
    data,
    status,
    statusText: status === 200 ? 'OK' : 'Not Found',
    headers: {},
    config: {} as any,
  };
}

describe('Race Condition Tests (e2e)', () => {
  let app: NestApplication;
  let attendanceRepository: Repository<AttendanceEntity>;
  let httpService: HttpService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, HttpModule],
    })
      .overrideProvider(STUDENTS_CLIENT_TOKEN)
      .useValue({
        findStudentByMatricula: jest.fn(),
        findStudentByCPF: jest.fn(),
        validateStudentActive: jest.fn().mockResolvedValue(true),
      })
      .overrideProvider(ROOMS_CLIENT_TOKEN)
      .useValue({
        getRoom: jest.fn().mockResolvedValue({
          id: 'room-race-test',
          roomNumber: 'RACE-101',
          capacity: 5, // Capacidade pequena para facilitar teste
          type: 'CLASSROOM',
          status: 'ACTIVE',
        }),
        validateRoomAvailable: jest.fn().mockResolvedValue(true),
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
    await attendanceRepository.clear();
  });

  describe('Concurrent Check-ins (Race Condition)', () => {
    it('should prevent exceeding room capacity with concurrent requests', async () => {
      // Mock HTTP responses
      jest.spyOn(httpService, 'get').mockImplementation((url: string) => {
        if (url.includes('/students/')) {
          return of(
            buildResponse({
              id: 'student-race-test',
              status: 'ACTIVE',
            }),
          );
        }
        if (url.includes('/rooms/')) {
          return of(
            buildResponse({
              id: 'room-race-test',
              roomNumber: 'RACE-101',
              capacity: 5,
              type: 'CLASSROOM',
              status: 'ACTIVE',
            }),
          );
        }
        return of(buildResponse(null, 404));
      });

      const roomCapacity = 5;
      const concurrentRequests = 10; // Mais que a capacidade

      // Criar múltiplas requisições simultâneas
      const requests = Array.from({ length: concurrentRequests }, (_, i) => {
        const checkInDto = {
          studentId: `student-race-${i}`,
          roomId: 'room-race-test',
          identificationMethod: 'MATRICULA',
          identificationValue: `M-${i}`,
        };

        return request(app.getHttpServer())
          .post('/api/v1/checkin')
          .send(checkInDto);
      });

      const responses = await Promise.all(requests);

      // Contar sucessos e falhas
      const successes = responses.filter((r) => r.body.success === true);
      const failures = responses.filter((r) => r.body.success === false);

      // Verificar que não excedeu a capacidade
      const finalCount = await attendanceRepository.count({
        where: { roomId: 'room-race-test' },
      });

      expect(finalCount).toBeLessThanOrEqual(roomCapacity);
      expect(successes.length).toBeLessThanOrEqual(roomCapacity);
      expect(failures.length + successes.length).toBe(concurrentRequests);

      // Verificar que pelo menos algumas falharam por capacidade
      const capacityErrors = failures.filter((r) =>
        r.body.message?.includes('capacidade'),
      );
      expect(capacityErrors.length).toBeGreaterThan(0);
    }, 30000); // Timeout maior para teste de concorrência

    it('should handle idempotency keys correctly', async () => {
      jest.spyOn(httpService, 'get').mockImplementation((url: string) => {
        if (url.includes('/students/')) {
          return of(
            buildResponse({
              id: 'student-idempotency-test',
              status: 'ACTIVE',
            }),
          );
        }
        if (url.includes('/rooms/')) {
          return of(
            buildResponse({
              id: 'room-idempotency-test',
              roomNumber: 'IDEMP-101',
              capacity: 10,
              type: 'CLASSROOM',
              status: 'ACTIVE',
            }),
          );
        }
        return of(buildResponse(null, 404));
      });

      const idempotencyKey = 'test-idempotency-key-123';
      const checkInDto = {
        studentId: 'student-idempotency-test',
        roomId: 'room-idempotency-test',
        identificationMethod: 'MATRICULA',
        identificationValue: 'M-IDEMP',
        idempotencyKey,
      };

      // Primeira requisição
      const firstResponse = await request(app.getHttpServer())
        .post('/api/v1/checkin')
        .send(checkInDto)
        .expect(201);

      expect(firstResponse.body.success).toBe(true);
      const firstCheckInId = firstResponse.body.checkInId;

      // Segunda requisição com mesma idempotency key
      const secondResponse = await request(app.getHttpServer())
        .post('/api/v1/checkin')
        .send(checkInDto)
        .expect(201);

      // Deve retornar o mesmo resultado
      expect(secondResponse.body.success).toBe(true);
      expect(secondResponse.body.checkInId).toBe(firstCheckInId);

      // Verificar que só foi criado um registro
      const count = await attendanceRepository.count({
        where: { idempotencyKey },
      });
      expect(count).toBe(1);
    });
  });
});

