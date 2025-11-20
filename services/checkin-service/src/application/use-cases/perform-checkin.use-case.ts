import { IAttendanceRepository } from '../../domain/ports/repositories/attendance.repository.port';
import { CheckInValidationService } from '../../domain/services/checkin-validation.service';
import { IEventPublisher } from '../../domain/ports/messaging/event-publisher.port';
import { Attendance } from '../../domain/entities/attendance.entity';
import { AttendanceCheckedInEvent } from '../../domain/events/attendance-checked-in.event';
import { PerformCheckInDto } from '../dto/perform-checkin.dto';
import { ResolveStudentIdUseCase } from './resolve-student-id.use-case';
import { BusinessMetricsService } from '../../infrastructure/metrics/business-metrics.service';

export interface PerformCheckInResult {
  success: boolean;
  message: string;
  attendance?: Attendance;
}

export class PerformCheckInUseCase {
  constructor(
    private readonly attendanceRepository: IAttendanceRepository,
    private readonly validationService: CheckInValidationService,
    private readonly eventPublisher: IEventPublisher,
    private readonly resolveStudentIdUseCase: ResolveStudentIdUseCase,
    private readonly metrics?: BusinessMetricsService,
  ) {}

  async execute(dto: PerformCheckInDto): Promise<PerformCheckInResult> {
    const startTime = Date.now();
    
    // Resolver studentId a partir do método de identificação
    let studentId = dto.studentId;
    
    if (!studentId && dto.identificationMethod && dto.identificationValue) {
      studentId = await this.resolveStudentIdUseCase.execute(
        dto.identificationMethod,
        dto.identificationValue,
      ) || '';
    }

    if (!studentId) {
      this.metrics?.incrementCheckinsFailed('student_not_found');
      return {
        success: false,
        message: 'Aluno não encontrado com os dados fornecidos',
      };
    }

    // Validar check-in
    const validation = await this.validationService.validateCheckIn(
      studentId,
      dto.roomId,
    );

    if (!validation.valid) {
      this.metrics?.incrementCheckinsFailed(validation.reason || 'validation_failed');
      return {
        success: false,
        message: validation.reason || 'Check-in não pode ser realizado',
      };
    }

    // Criar registro de atendimento
    const attendance = Attendance.checkIn(studentId, dto.roomId);

    // Salvar
    await this.attendanceRepository.save(attendance);

    // Publicar evento
    const event = new AttendanceCheckedInEvent(attendance);
    await this.eventPublisher.publish(event);

    // Metrics
    const roomType = validation.room?.type || 'UNKNOWN';
    this.metrics?.incrementCheckinsPerformed(dto.roomId, roomType);
    this.metrics?.incrementCheckinsByRoom(dto.roomId, validation.room?.roomNumber || 'UNKNOWN');
    if (dto.identificationMethod) {
      this.metrics?.incrementCheckinsByMethod(dto.identificationMethod);
    }
    const duration = (Date.now() - startTime) / 1000;
    this.metrics?.recordCheckinDuration(dto.roomId, duration);

    return {
      success: true,
      message: 'Check-in realizado com sucesso',
      attendance,
    };
  }
}

