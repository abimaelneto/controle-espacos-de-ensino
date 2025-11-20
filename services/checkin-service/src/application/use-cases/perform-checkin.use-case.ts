import { IAttendanceRepository } from '../../domain/ports/repositories/attendance.repository.port';
import { CheckInValidationService } from '../../domain/services/checkin-validation.service';
import { IEventPublisher } from '../../domain/ports/messaging/event-publisher.port';
import { Attendance } from '../../domain/entities/attendance.entity';
import { AttendanceCheckedInEvent } from '../../domain/events/attendance-checked-in.event';
import { PerformCheckInDto } from '../dto/perform-checkin.dto';
import { ResolveStudentIdUseCase } from './resolve-student-id.use-case';

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
  ) {}

  async execute(dto: PerformCheckInDto): Promise<PerformCheckInResult> {
    // Resolver studentId a partir do método de identificação
    let studentId = dto.studentId;
    
    if (!studentId && dto.identificationMethod && dto.identificationValue) {
      studentId = await this.resolveStudentIdUseCase.execute(
        dto.identificationMethod,
        dto.identificationValue,
      ) || '';
    }

    if (!studentId) {
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

    return {
      success: true,
      message: 'Check-in realizado com sucesso',
      attendance,
    };
  }
}

