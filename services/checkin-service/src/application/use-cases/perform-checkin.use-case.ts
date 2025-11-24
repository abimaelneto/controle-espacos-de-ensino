import { IAttendanceRepository } from '../../domain/ports/repositories/attendance.repository.port';
import { CheckInValidationService } from '../../domain/services/checkin-validation.service';
import { IEventPublisher } from '../../domain/ports/messaging/event-publisher.port';
import { Attendance } from '../../domain/entities/attendance.entity';
import { AttendanceCheckedInEvent } from '../../domain/events/attendance-checked-in.event';
import { PerformCheckInDto } from '../dto/perform-checkin.dto';
import { ResolveStudentIdUseCase } from './resolve-student-id.use-case';
import { BusinessMetricsService } from '../../infrastructure/metrics/business-metrics.service';
import { RedisLockAdapter } from '../../infrastructure/adapters/cache/redis-lock.adapter';
import { IdempotencyAdapter } from '../../infrastructure/adapters/cache/idempotency.adapter';
import { randomUUID } from 'crypto';

export interface PerformCheckInResult {
  success: boolean;
  message: string;
  attendance?: Attendance;
  checkInId?: string;
}

export class PerformCheckInUseCase {
  constructor(
    private readonly attendanceRepository: IAttendanceRepository,
    private readonly validationService: CheckInValidationService,
    private readonly eventPublisher: IEventPublisher,
    private readonly resolveStudentIdUseCase: ResolveStudentIdUseCase,
    private readonly metrics?: BusinessMetricsService,
    private readonly lockAdapter?: RedisLockAdapter,
    private readonly idempotencyAdapter?: IdempotencyAdapter,
  ) {}

  async execute(dto: PerformCheckInDto): Promise<PerformCheckInResult> {
    const startTime = Date.now();

    // Gerar ou usar idempotency key
    const idempotencyKey =
      dto.idempotencyKey ||
      this.idempotencyAdapter?.generateKey(
        'checkin',
        dto.studentId || dto.identificationValue,
        dto.roomId,
        Date.now().toString(),
      ) ||
      randomUUID();

    // Verificar idempotência
    if (this.idempotencyAdapter) {
      const cachedResult = await this.idempotencyAdapter.get(idempotencyKey);
      if (cachedResult) {
        const result = JSON.parse(cachedResult);
        return {
          success: result.success,
          message: result.message,
          checkInId: result.checkInId,
        };
      }
    }

    // Verificar no banco de dados também
    const existingAttendance = await this.attendanceRepository.findByIdempotencyKey(
      idempotencyKey,
    );
    if (existingAttendance) {
      return {
        success: true,
        message: 'Check-in já foi realizado anteriormente',
        attendance: existingAttendance,
        checkInId: existingAttendance.getId(),
      };
    }

    // Resolver studentId a partir do userId (se disponível) ou método de identificação
    let studentId = dto.studentId;

    if (!studentId) {
      // Tentar resolver por userId primeiro (do token JWT)
      if (dto.userId) {
        console.log(`[PerformCheckIn] Tentando resolver studentId por userId: ${dto.userId}`);
        studentId =
          (await this.resolveStudentIdUseCase.execute(
            dto.identificationMethod || 'MATRICULA',
            dto.identificationValue || '',
            dto.userId,
          )) || '';
      }
      
      // Se ainda não tiver studentId, tentar por método de identificação
      if (!studentId && dto.identificationMethod && dto.identificationValue) {
        console.log(`[PerformCheckIn] Tentando resolver studentId por método de identificação: ${dto.identificationMethod}`);
        studentId =
          (await this.resolveStudentIdUseCase.execute(
            dto.identificationMethod,
            dto.identificationValue,
          )) || '';
      }
    }

    if (!studentId) {
      this.metrics?.incrementCheckinsFailed('student_not_found');
      return {
        success: false,
        message: 'Aluno não encontrado com os dados fornecidos',
      };
    }

    // Usar distributed lock para prevenir race conditions
    const lockKey = `checkin:${studentId}:${dto.roomId}`;

    const executeCheckIn = async (): Promise<PerformCheckInResult> => {
      // Validar check-in (validação inicial)
      const validation = await this.validationService.validateCheckIn(
        studentId,
        dto.roomId,
      );

      if (!validation.valid) {
        this.metrics?.incrementCheckinsFailed(
          validation.reason || 'validation_failed',
        );
        return {
          success: false,
          message: validation.reason || 'Check-in não pode ser realizado',
        };
      }

      // Criar registro de atendimento
      const attendance = Attendance.checkIn(
        studentId,
        dto.roomId,
        idempotencyKey,
      );

      // Salvar com validação de capacidade em transação
      const saveResult = await this.attendanceRepository.saveWithCapacityCheck(
        attendance,
        dto.roomId,
        validation.room?.capacity || 0,
      );

      if (!saveResult.success) {
        this.metrics?.incrementCheckinsFailed(saveResult.reason || 'capacity_exceeded');
        return {
          success: false,
          message: saveResult.reason || 'Check-in não pode ser realizado',
        };
      }

      // Publicar evento (com retry em caso de falha)
      try {
        const event = new AttendanceCheckedInEvent(attendance);
        await this.eventPublisher.publish(event);
      } catch (error) {
        // Log mas não falha o check-in se o evento não for publicado
        console.error('Failed to publish event:', error);
      }

      // Metrics
      const roomType = validation.room?.type || 'UNKNOWN';
      this.metrics?.incrementCheckinsPerformed(dto.roomId, roomType);
      this.metrics?.incrementCheckinsByRoom(
        dto.roomId,
        validation.room?.roomNumber || 'UNKNOWN',
      );
      if (dto.identificationMethod) {
        this.metrics?.incrementCheckinsByMethod(dto.identificationMethod);
      }
      const duration = (Date.now() - startTime) / 1000;
      this.metrics?.recordCheckinDuration(dto.roomId, duration);

      const result: PerformCheckInResult = {
        success: true,
        message: 'Check-in realizado com sucesso',
        attendance,
        checkInId: attendance.getId(),
      };

      // Cache resultado para idempotência
      if (this.idempotencyAdapter) {
        await this.idempotencyAdapter.set(
          idempotencyKey,
          JSON.stringify(result),
          3600, // 1 hora
        );
      }

      return result;
    };

    // Executar com lock se disponível, senão executar diretamente
    if (this.lockAdapter) {
      try {
        return await this.lockAdapter.withLock(lockKey, executeCheckIn, 30, 3, 100);
      } catch (error) {
        this.metrics?.incrementCheckinsFailed('lock_timeout');
        return {
          success: false,
          message: 'Timeout ao processar check-in. Tente novamente.',
        };
      }
    }

    // Fallback: executar sem lock (menos seguro, mas funciona)
    return executeCheckIn();
  }
}

